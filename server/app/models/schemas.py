from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ConceptNode(BaseModel):
    id: str
    label: str
    description: Optional[str] = None
    group: Optional[str] = None
    x: Optional[float] = 0.0
    y: Optional[float] = 0.0

class ConceptEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    is_bidirectional: Optional[bool] = False

class MasterConceptMap(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    course_id: Optional[str] = "course-1"
    nodes: List[ConceptNode]
    edges: List[ConceptEdge]
    status: str = "approved"  # "draft" | "approved" | "archived"

class AssessmentConfig(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    master_map_id: str
    exam_token: Optional[str] = None
    duration_minutes: int = 30
    allow_bidirectional_tolerance: bool = True
    tolerated_symmetric_labels: List[str] = Field(
        default_factory=lambda: ["berkaitan dengan", "interacts with", "terhubung dengan", "connected to"]
    )
    randomize_kit: bool = True
    weights: Dict[str, float] = Field(
        default_factory=lambda: {
            "concept_recognition": 0.20,
            "relationship_accuracy": 0.50,
            "structural_understanding": 0.30
        }
    )
    passing_grade: Optional[float] = 75.0
    distractors: Optional[List[str]] = Field(default_factory=list)

class VerifyTokenRequest(BaseModel):
    token: str

class VerifyTokenResponse(BaseModel):
    valid: bool
    assessment: Optional[AssessmentConfig] = None
    message: str

class ConceptKit(BaseModel):
    assessment_id: str
    concepts: List[ConceptNode]
    available_relationships: List[str]

class StudentSubmission(BaseModel):
    student_id: str
    student_name: str
    assessment_id: str
    submitted_nodes: List[ConceptNode]
    submitted_edges: List[ConceptEdge]

class EdgeEvaluationItem(BaseModel):
    source: str
    source_label: str
    target: str
    target_label: str
    label: str
    status: str  # "correct" (TP) | "incorrect" (FP) | "missing" (FN)
    note: Optional[str] = None

class EvaluationResult(BaseModel):
    student_id: str
    student_name: str
    assessment_id: str
    total_score: float
    concept_recognition_score: float
    relationship_accuracy_score: float
    structural_understanding_score: float
    metrics: Dict[str, float]  # precision, recall, f1_score, tp, fp, fn
    evaluated_edges: List[EdgeEvaluationItem]
    knowledge_gaps: List[str]
    strengths: List[str]

class StudentPerformanceItem(BaseModel):
    student_id: str
    student_name: str
    total_score: float
    status: Optional[str] = "Lulus Standar"
    structural_score: Optional[float] = 0.0
    accuracy_score: Optional[float] = 0.0
    gaps_count: Optional[int] = 0

class ClassKnowledgeGapSummary(BaseModel):
    assessment_id: str
    total_students: int
    average_score: float
    score_distribution: Dict[str, int]
    problematic_relationships: List[Dict[str, Any]]
    well_understood_relationships: List[Dict[str, Any]]
    student_performances: Optional[List[StudentPerformanceItem]] = Field(default_factory=list)

class AIDraftRequest(BaseModel):
    topic: str
    material_text: str
    target_node_count: Optional[int] = 7

class AIDraftResponse(BaseModel):
    topic: str
    nodes: List[ConceptNode]
    edges: List[ConceptEdge]
    confidence_score: float
    generation_notes: str

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "student"
    identifier: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    identifier: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
