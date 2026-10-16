from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Header
from typing import List, Optional
from sqlalchemy.orm import Session
import pypdf
import io
import uuid

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.db_models import MasterConceptMapModel, AssessmentModel, StudentSubmissionModel, UserModel
from app.models.schemas import (
    MasterConceptMap,
    AssessmentConfig,
    ConceptKit,
    StudentSubmission,
    EvaluationResult,
    EdgeEvaluationItem,
    ClassKnowledgeGapSummary,
    StudentPerformanceItem,
    AIDraftRequest,
    AIDraftResponse,
    ConceptNode,
    ConceptEdge,
    VerifyTokenRequest,
    VerifyTokenResponse,
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse,
)
from app.services.graph_engine import GraphAssessmentEngine
from app.services.kit_generator import KitGenerator
from app.services.ai_service import AIService

router = APIRouter()

# Initial Seed Data for Base Starter Master Map & Assessment
DEFAULT_NODES = [
    {"id": "cpu", "label": "CPU", "description": "Central Processing Unit", "x": 300, "y": 50},
    {"id": "alu", "label": "ALU", "description": "Arithmetic Logic Unit", "x": 150, "y": 190},
    {"id": "cu", "label": "Control Unit", "description": "Pengendali instruksi dan sinyal", "x": 450, "y": 190},
    {"id": "register", "label": "Register", "description": "Penyimpan data internal sementara", "x": 150, "y": 340},
    {"id": "memory", "label": "Memory (RAM)", "description": "Memori penyimpanan data utama", "x": 300, "y": 480},
]

DEFAULT_EDGES = [
    {"id": "e1", "source": "cpu", "target": "alu", "label": "contains", "is_bidirectional": False},
    {"id": "e2", "source": "cpu", "target": "cu", "label": "contains", "is_bidirectional": False},
    {"id": "e3", "source": "cpu", "target": "register", "label": "uses", "is_bidirectional": False},
    {"id": "e4", "source": "alu", "target": "register", "label": "stores temporary result in", "is_bidirectional": False},
    {"id": "e5", "source": "cu", "target": "alu", "label": "controls", "is_bidirectional": False},
    {"id": "e6", "source": "register", "target": "memory", "label": "transfers data with", "is_bidirectional": True},
]

def seed_initial_database(db: Session):
    """Seed initial master map and starter assessment template if database is empty."""
    try:
        master = db.query(MasterConceptMapModel).filter_by(id="map-cpu-1").first()
        if not master:
            master = MasterConceptMapModel(
                id="map-cpu-1",
                title="Arsitektur Komputer — Komponen CPU",
                description="Peta acuan struktur CPU, ALU, CU, Register, dan Memory.",
                course_id="course-cs101",
                nodes=DEFAULT_NODES,
                edges=DEFAULT_EDGES,
                status="approved"
            )
            db.add(master)
            db.commit()

        assessment = db.query(AssessmentModel).filter_by(id="asm-1").first()
        if not assessment:
            assessment = AssessmentModel(
                id="asm-1",
                title="Kuis Pemahaman Konseptual CPU",
                description="Rekonstruksi komponen utama CPU dan alur transfer data.",
                instructions="Rangkai kembali simpul konsep CPU dan alur transfer data dengan tepat.",
                master_map_id="map-cpu-1",
                exam_token="KBT-9428",
                duration_minutes=30,
                allow_bidirectional_tolerance=True,
                tolerated_symmetric_labels=["transfers data with", "interacts with", "terhubung dengan", "connected to"],
                randomize_kit=True,
                weights={
                    "concept_recognition": 0.20,
                    "relationship_accuracy": 0.50,
                    "structural_understanding": 0.30
                },
                passing_grade=75.0,
                distractors=[]
            )
            db.add(assessment)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {e}")


# Auth Helper Dependencies
def get_current_user_from_header(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[UserModel]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split("Bearer ")[1].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return db.query(UserModel).filter_by(id=payload["sub"]).first()


# Helper Converters
def to_user_response(user: UserModel) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        identifier=user.identifier
    )

def to_assessment_schema(asm: AssessmentModel) -> AssessmentConfig:
    return AssessmentConfig(
        id=asm.id,
        title=asm.title,
        description=asm.description,
        instructions=asm.instructions,
        master_map_id=asm.master_map_id,
        exam_token=asm.exam_token,
        duration_minutes=asm.duration_minutes,
        allow_bidirectional_tolerance=asm.allow_bidirectional_tolerance,
        tolerated_symmetric_labels=asm.tolerated_symmetric_labels or [],
        randomize_kit=asm.randomize_kit,
        weights=asm.weights or {},
        passing_grade=asm.passing_grade or 75.0,
        distractors=asm.distractors or []
    )

def to_master_schema(m: MasterConceptMapModel) -> MasterConceptMap:
    return MasterConceptMap(
        id=m.id,
        title=m.title,
        description=m.description,
        course_id=m.course_id,
        nodes=[ConceptNode(**n) for n in m.nodes],
        edges=[ConceptEdge(**e) for e in m.edges],
        status=m.status
    )


# ==========================================
# AUTH ENDPOINTS (Email & Password Authentication)
# ==========================================

@router.post("/auth/register", response_model=AuthResponse)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    existing = db.query(UserModel).filter_by(email=email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar. Silakan login.")

    user_id = f"user-{uuid.uuid4().hex[:10]}"
    hashed_pwd = hash_password(payload.password)
    new_user = UserModel(
        id=user_id,
        email=email_clean,
        hashed_password=hashed_pwd,
        full_name=payload.full_name.strip(),
        role=payload.role if payload.role in ["student", "teacher"] else "student",
        identifier=payload.identifier.strip() if payload.identifier else None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return AuthResponse(access_token=token, token_type="bearer", user=to_user_response(new_user))

@router.post("/auth/login", response_model=AuthResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(UserModel).filter_by(email=email_clean).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email atau kata sandi tidak valid.")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return AuthResponse(access_token=token, token_type="bearer", user=to_user_response(user))

@router.get("/auth/me", response_model=UserResponse)
def get_current_user_profile(
    user: Optional[UserModel] = Depends(get_current_user_from_header)
):
    if not user:
        raise HTTPException(status_code=401, detail="Sesi login telah berakhir atau tidak valid.")
    return to_user_response(user)


# ==========================================
# ASSESSMENT & KIT ENDPOINTS
# ==========================================

@router.get("/assessments", response_model=List[AssessmentConfig])
def list_assessments(db: Session = Depends(get_db)):
    assessments = db.query(AssessmentModel).order_by(AssessmentModel.created_at.desc()).all()
    return [to_assessment_schema(a) for a in assessments]

@router.post("/assessments", response_model=AssessmentConfig)
def create_assessment(config: AssessmentConfig, db: Session = Depends(get_db)):
    master = db.query(MasterConceptMapModel).filter_by(id=config.master_map_id).first()
    if not master:
        raise HTTPException(status_code=404, detail="Master Map tidak ditemukan")

    existing = db.query(AssessmentModel).filter_by(id=config.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="ID Assessment sudah ada")

    new_asm = AssessmentModel(
        id=config.id,
        title=config.title,
        description=config.description,
        instructions=config.instructions,
        master_map_id=config.master_map_id,
        exam_token=config.exam_token,
        duration_minutes=config.duration_minutes,
        allow_bidirectional_tolerance=config.allow_bidirectional_tolerance,
        tolerated_symmetric_labels=config.tolerated_symmetric_labels,
        randomize_kit=config.randomize_kit,
        weights=config.weights,
        passing_grade=config.passing_grade or 75.0,
        distractors=config.distractors or []
    )
    db.add(new_asm)
    db.commit()
    db.refresh(new_asm)
    return to_assessment_schema(new_asm)

@router.get("/assessments/{assessment_id}", response_model=AssessmentConfig)
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    asm = db.query(AssessmentModel).filter_by(id=assessment_id).first()
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment tidak ditemukan")
    return to_assessment_schema(asm)

@router.put("/assessments/{assessment_id}", response_model=AssessmentConfig)
def update_assessment(assessment_id: str, config: AssessmentConfig, db: Session = Depends(get_db)):
    asm = db.query(AssessmentModel).filter_by(id=assessment_id).first()
    if not asm:
        return create_assessment(config, db)

    asm.title = config.title
    asm.description = config.description
    asm.instructions = config.instructions
    asm.master_map_id = config.master_map_id
    asm.exam_token = config.exam_token
    asm.duration_minutes = config.duration_minutes
    asm.allow_bidirectional_tolerance = config.allow_bidirectional_tolerance
    asm.tolerated_symmetric_labels = config.tolerated_symmetric_labels
    asm.randomize_kit = config.randomize_kit
    asm.weights = config.weights
    asm.passing_grade = config.passing_grade or 75.0
    asm.distractors = config.distractors or []

    db.commit()
    db.refresh(asm)
    return to_assessment_schema(asm)

@router.post("/assessments/verify-token", response_model=VerifyTokenResponse)
def verify_exam_token(payload: VerifyTokenRequest, db: Session = Depends(get_db)):
    clean_token = payload.token.strip().upper()
    asm = db.query(AssessmentModel).filter(AssessmentModel.exam_token == clean_token).first()
    if not asm:
        return VerifyTokenResponse(
            valid=False,
            message="Token ujian tidak valid atau tidak terdaftar."
        )
    return VerifyTokenResponse(
        valid=True,
        assessment=to_assessment_schema(asm),
        message="Token terverifikasi! Memulai sesi pengerjaan asesmen."
    )

@router.get("/assessments/{assessment_id}/kit", response_model=ConceptKit)
def get_assessment_kit(assessment_id: str, db: Session = Depends(get_db)):
    asm = db.query(AssessmentModel).filter_by(id=assessment_id).first()
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment tidak ditemukan")

    master_map = db.query(MasterConceptMapModel).filter_by(id=asm.master_map_id).first()
    if not master_map:
        raise HTTPException(status_code=404, detail="Master Map tidak ditemukan")

    master_schema = to_master_schema(master_map)
    return KitGenerator.generate_kit(
        master_schema,
        shuffle=asm.randomize_kit,
        distractors=asm.distractors
    )


# ==========================================
# MASTER CONCEPT MAP ENDPOINTS
# ==========================================

@router.get("/maps/master", response_model=List[MasterConceptMap])
def list_master_maps(db: Session = Depends(get_db)):
    maps = db.query(MasterConceptMapModel).all()
    return [to_master_schema(m) for m in maps]

@router.get("/maps/master/{map_id}", response_model=MasterConceptMap)
def get_master_map(map_id: str, db: Session = Depends(get_db)):
    m = db.query(MasterConceptMapModel).filter_by(id=map_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Master Map tidak ditemukan")
    return to_master_schema(m)

@router.post("/maps/master", response_model=MasterConceptMap)
def save_master_map(master_map: MasterConceptMap, db: Session = Depends(get_db)):
    node_ids = {n.id for n in master_map.nodes}
    if not node_ids:
        raise HTTPException(status_code=422, detail="Master Map harus memiliki minimal satu konsep")
    for e in master_map.edges:
        if e.source not in node_ids or e.target not in node_ids:
            raise HTTPException(
                status_code=422,
                detail=f"Relasi '{e.id}' merujuk node yang tidak ada ({e.source} -> {e.target})"
            )

    nodes_json = [n.model_dump() for n in master_map.nodes]
    edges_json = [e.model_dump() for e in master_map.edges]

    existing = db.query(MasterConceptMapModel).filter_by(id=master_map.id).first()
    if existing:
        existing.title = master_map.title
        existing.description = master_map.description
        existing.course_id = master_map.course_id
        existing.nodes = nodes_json
        existing.edges = edges_json
        existing.status = master_map.status
        db.commit()
        db.refresh(existing)
        return to_master_schema(existing)
    else:
        new_map = MasterConceptMapModel(
            id=master_map.id,
            title=master_map.title,
            description=master_map.description,
            course_id=master_map.course_id,
            nodes=nodes_json,
            edges=edges_json,
            status=master_map.status
        )
        db.add(new_map)
        db.commit()
        db.refresh(new_map)
        return to_master_schema(new_map)


# ==========================================
# SUBMISSION & ANALYTICS ENDPOINTS (REAL DATA ONLY)
# ==========================================

@router.post("/assessments/{assessment_id}/submit", response_model=EvaluationResult)
def submit_student_map(assessment_id: str, submission: StudentSubmission, db: Session = Depends(get_db)):
    asm = db.query(AssessmentModel).filter_by(id=assessment_id).first()
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment tidak ditemukan")

    master_map = db.query(MasterConceptMapModel).filter_by(id=asm.master_map_id).first()
    if not master_map:
        raise HTTPException(status_code=404, detail="Master Map tidak ditemukan")

    master_schema = to_master_schema(master_map)
    asm_schema = to_assessment_schema(asm)

    result = GraphAssessmentEngine.evaluate_submission(master_schema, submission, asm_schema)

    # Persist real student submission to database
    sub_record = StudentSubmissionModel(
        id=f"sub-{uuid.uuid4().hex[:10]}",
        assessment_id=assessment_id,
        student_id=submission.student_id,
        student_name=submission.student_name,
        total_score=result.total_score,
        concept_recognition_score=result.concept_recognition_score,
        relationship_accuracy_score=result.relationship_accuracy_score,
        structural_understanding_score=result.structural_understanding_score,
        metrics=result.metrics,
        submitted_nodes=[n.model_dump() for n in submission.submitted_nodes],
        submitted_edges=[e.model_dump() for e in submission.submitted_edges],
        evaluated_edges=[e.model_dump() for e in result.evaluated_edges],
        knowledge_gaps=result.knowledge_gaps,
        strengths=result.strengths
    )
    db.add(sub_record)
    db.commit()

    return result

@router.get("/students/my-submissions", response_model=List[EvaluationResult])
def get_my_submissions(
    student_id: Optional[str] = None,
    user: Optional[UserModel] = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Retrieve real historical assessment submissions for current student."""
    target_id = student_id
    if not target_id and user:
        target_id = user.id

    if not target_id:
        return []

    submissions = db.query(StudentSubmissionModel).filter_by(student_id=target_id).order_by(StudentSubmissionModel.submitted_at.desc()).all()
    return [
        EvaluationResult(
            student_id=s.student_id,
            student_name=s.student_name,
            assessment_id=s.assessment_id,
            total_score=s.total_score,
            concept_recognition_score=s.concept_recognition_score,
            relationship_accuracy_score=s.relationship_accuracy_score,
            structural_understanding_score=s.structural_understanding_score,
            metrics=s.metrics,
            evaluated_edges=[EdgeEvaluationItem(**item) for item in s.evaluated_edges],
            knowledge_gaps=s.knowledge_gaps or [],
            strengths=s.strengths or []
        )
        for s in submissions
    ]

@router.get("/assessments/{assessment_id}/analytics", response_model=ClassKnowledgeGapSummary)
def get_class_analytics(assessment_id: str, db: Session = Depends(get_db)):
    """
    Returns aggregated class analytics based strictly on real submissions.
    If no student has submitted yet, returns an empty clean summary (no fake data).
    """
    asm = db.query(AssessmentModel).filter_by(id=assessment_id).first()
    if not asm:
        raise HTTPException(status_code=404, detail="Assessment tidak ditemukan")

    master_map = db.query(MasterConceptMapModel).filter_by(id=asm.master_map_id).first()
    if not master_map:
        raise HTTPException(status_code=404, detail="Master Map tidak ditemukan")

    submissions = db.query(StudentSubmissionModel).filter_by(assessment_id=assessment_id).all()

    # If empty, return zeroed summary
    if not submissions:
        return ClassKnowledgeGapSummary(
            assessment_id=assessment_id,
            total_students=0,
            average_score=0.0,
            score_distribution={"<60": 0, "60-69": 0, "70-79": 0, "80-89": 0, "90-100": 0},
            problematic_relationships=[],
            well_understood_relationships=[]
        )

    results = [
        EvaluationResult(
            student_id=s.student_id,
            student_name=s.student_name,
            assessment_id=s.assessment_id,
            total_score=s.total_score,
            concept_recognition_score=s.concept_recognition_score,
            relationship_accuracy_score=s.relationship_accuracy_score,
            structural_understanding_score=s.structural_understanding_score,
            metrics=s.metrics,
            evaluated_edges=[EdgeEvaluationItem(**item) for item in s.evaluated_edges],
            knowledge_gaps=s.knowledge_gaps or [],
            strengths=s.strengths or []
        )
        for s in submissions
    ]

    master_schema = to_master_schema(master_map)
    summary = GraphAssessmentEngine.aggregate_class_knowledge_gaps(master_schema, results)
    summary.student_performances = [
        StudentPerformanceItem(
            student_id=s.student_id,
            student_name=s.student_name,
            total_score=round(s.total_score, 1),
            status="Lulus Standar" if s.total_score >= 75.0 else "Perlu Remedial",
            structural_score=round(s.structural_understanding_score or 0.0, 1),
            accuracy_score=round(s.relationship_accuracy_score or 0.0, 1),
            gaps_count=len(s.knowledge_gaps or [])
        )
        for s in submissions
    ]
    return summary


# ==========================================
# AI CONCEPT MAP ASSISTANT ENDPOINTS
# ==========================================

@router.post("/ai/draft", response_model=AIDraftResponse)
async def generate_ai_draft(payload: AIDraftRequest):
    return await AIService.generate_concept_map_draft(
        topic=payload.topic,
        text=payload.material_text,
        target_node_count=payload.target_node_count or 7
    )

@router.post("/ai/draft-from-file", response_model=AIDraftResponse)
async def generate_ai_draft_from_file(
    topic: str = Form(...),
    file: UploadFile = File(...)
):
    content_bytes = await file.read()
    extracted_text = ""

    if file.filename.endswith(".pdf"):
        pdf_reader = pypdf.PdfReader(io.BytesIO(content_bytes))
        for page in pdf_reader.pages:
            extracted_text += (page.extract_text() or "") + "\n"
    else:
        try:
            extracted_text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = content_bytes.decode("latin-1", errors="ignore")

    if not extracted_text.strip():
        extracted_text = f"Materi seputar {topic}."

    return await AIService.generate_concept_map_draft(
        topic=topic,
        text=extracted_text,
        target_node_count=7
    )
