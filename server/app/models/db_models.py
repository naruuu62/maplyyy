from sqlalchemy import Column, String, Integer, Float, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # "student" | "teacher"
    identifier = Column(String(100), nullable=True)  # NIM untuk mahasiswa, NIP untuk dosen
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MasterConceptMapModel(Base):
    __tablename__ = "master_concept_maps"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    course_id = Column(String(100), default="course-cs101")
    nodes = Column(JSON, nullable=False)
    edges = Column(JSON, nullable=False)
    status = Column(String(50), default="approved")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AssessmentModel(Base):
    __tablename__ = "assessments"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    master_map_id = Column(String(100), ForeignKey("master_concept_maps.id"), nullable=False)
    exam_token = Column(String(20), index=True, nullable=True)
    duration_minutes = Column(Integer, default=30)
    allow_bidirectional_tolerance = Column(Boolean, default=True)
    tolerated_symmetric_labels = Column(JSON, nullable=False)
    randomize_kit = Column(Boolean, default=True)
    weights = Column(JSON, nullable=False)
    passing_grade = Column(Float, default=75.0)
    distractors = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudentSubmissionModel(Base):
    __tablename__ = "student_submissions"

    id = Column(String(100), primary_key=True, index=True)
    assessment_id = Column(String(100), ForeignKey("assessments.id"), index=True, nullable=False)
    student_id = Column(String(100), index=True, nullable=False)
    student_name = Column(String(255), nullable=False)
    total_score = Column(Float, nullable=False)
    concept_recognition_score = Column(Float, default=0.0)
    relationship_accuracy_score = Column(Float, default=0.0)
    structural_understanding_score = Column(Float, default=0.0)
    metrics = Column(JSON, nullable=False)
    submitted_nodes = Column(JSON, nullable=False)
    submitted_edges = Column(JSON, nullable=False)
    evaluated_edges = Column(JSON, nullable=False)
    knowledge_gaps = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
