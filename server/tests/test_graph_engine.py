import pytest
from app.models.schemas import (
    ConceptNode,
    ConceptEdge,
    MasterConceptMap,
    StudentSubmission,
    AssessmentConfig
)
from app.services.graph_engine import GraphAssessmentEngine

def test_graph_assessment_engine_perfect_score():
    nodes = [
        ConceptNode(id="cpu", label="CPU"),
        ConceptNode(id="alu", label="ALU"),
        ConceptNode(id="cu", label="Control Unit"),
    ]
    edges = [
        ConceptEdge(id="e1", source="cpu", target="alu", label="contains"),
        ConceptEdge(id="e2", source="cpu", target="cu", label="contains"),
    ]
    master = MasterConceptMap(id="m1", title="CPU Map", nodes=nodes, edges=edges)
    submission = StudentSubmission(
        student_id="s1",
        student_name="Test Student",
        assessment_id="a1",
        submitted_nodes=nodes,
        submitted_edges=edges
    )
    config = AssessmentConfig(id="a1", title="Test Asm", master_map_id="m1")

    res = GraphAssessmentEngine.evaluate_submission(master, submission, config)
    assert res.total_score == 100.0
    assert res.metrics["true_positive"] == 2
    assert res.metrics["false_positive"] == 0
    assert res.metrics["false_negative"] == 0
    assert res.metrics["precision"] == 1.0
    assert res.metrics["recall"] == 1.0
    assert res.metrics["f1_score"] == 1.0
    assert len(res.knowledge_gaps) == 0

def test_graph_assessment_engine_missing_and_incorrect():
    nodes = [
        ConceptNode(id="cpu", label="CPU"),
        ConceptNode(id="alu", label="ALU"),
        ConceptNode(id="cu", label="Control Unit"),
        ConceptNode(id="mem", label="Memory"),
    ]
    master_edges = [
        ConceptEdge(id="e1", source="cpu", target="alu", label="contains"),
        ConceptEdge(id="e2", source="cpu", target="cu", label="contains"),
    ]
    master = MasterConceptMap(id="m1", title="CPU Map", nodes=nodes, edges=master_edges)

    # Student connects cpu->alu correctly, misses cpu->cu, and adds wrong alu->mem
    student_edges = [
        ConceptEdge(id="s1", source="cpu", target="alu", label="contains"),
        ConceptEdge(id="s2", source="alu", target="mem", label="stores in"),
    ]
    submission = StudentSubmission(
        student_id="s2",
        student_name="Student 2",
        assessment_id="a1",
        submitted_nodes=nodes,
        submitted_edges=student_edges
    )
    config = AssessmentConfig(id="a1", title="Test Asm", master_map_id="m1")

    res = GraphAssessmentEngine.evaluate_submission(master, submission, config)
    assert res.metrics["true_positive"] == 1
    assert res.metrics["false_positive"] == 1
    assert res.metrics["false_negative"] == 1
    assert res.metrics["precision"] == 0.5
    assert res.metrics["recall"] == 0.5
    assert res.metrics["f1_score"] == 0.5
    assert len(res.knowledge_gaps) == 1
    assert "Control Unit" in res.knowledge_gaps[0]
