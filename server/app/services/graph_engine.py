import networkx as nx
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    MasterConceptMap,
    StudentSubmission,
    AssessmentConfig,
    EvaluationResult,
    EdgeEvaluationItem,
    ClassKnowledgeGapSummary,
)

def normalize_text(text: str) -> str:
    """Helper to normalize concept and relation labels."""
    return " ".join(text.strip().lower().split())

class GraphAssessmentEngine:
    """
    Maply Deterministic Graph Assessment Engine.
    Implements labeled directed graph comparison using NetworkX
    with configurable direction tolerance and 3-dimensional scoring.
    """

    @staticmethod
    def build_networkx_graph(nodes, edges) -> nx.DiGraph:
        g = nx.DiGraph()
        for node in nodes:
            g.add_node(node.id, label=normalize_text(node.label), original_label=node.label)
        for edge in edges:
            g.add_edge(
                edge.source,
                edge.target,
                id=edge.id,
                label=normalize_text(edge.label),
                original_label=edge.label,
                is_bidirectional=getattr(edge, 'is_bidirectional', False)
            )
        return g

    @classmethod
    def evaluate_submission(
        cls,
        master_map: MasterConceptMap,
        submission: StudentSubmission,
        config: AssessmentConfig
    ) -> EvaluationResult:
        master_g = cls.build_networkx_graph(master_map.nodes, master_map.edges)
        student_g = cls.build_networkx_graph(submission.submitted_nodes, submission.submitted_edges)

        # Lookup maps for node labels
        master_node_labels = {n.id: n.label for n in master_map.nodes}
        student_node_labels = {n.id: n.label for n in submission.submitted_nodes}

        # Concept recognition score
        master_concepts_norm = {normalize_text(n.label) for n in master_map.nodes}
        student_concepts_norm = {normalize_text(n.label) for n in submission.submitted_nodes}
        recognized_concepts = master_concepts_norm.intersection(student_concepts_norm)
        concept_recognition_score = (
            (len(recognized_concepts) / len(master_concepts_norm) * 100.0)
            if master_concepts_norm else 100.0
        )

        tolerated_labels = {normalize_text(l) for l in config.tolerated_symmetric_labels}

        # Master edge triplets: normalized (src_label, edge_label, tgt_label)
        # and store original references
        master_triplets: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
        for u, v, data in master_g.edges(data=True):
            src_lbl = master_g.nodes[u]["label"]
            tgt_lbl = master_g.nodes[v]["label"]
            edge_lbl = data["label"]
            master_triplets[(src_lbl, edge_lbl, tgt_lbl)] = {
                "source_id": u,
                "target_id": v,
                "source_label": master_g.nodes[u]["original_label"],
                "target_label": master_g.nodes[v]["original_label"],
                "edge_label": data["original_label"],
                "is_bidirectional": data.get("is_bidirectional", False),
            }

        # Student edge triplets
        student_triplets: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
        for u, v, data in student_g.edges(data=True):
            src_lbl = student_g.nodes[u]["label"] if u in student_g.nodes else normalize_text(student_node_labels.get(u, u))
            tgt_lbl = student_g.nodes[v]["label"] if v in student_g.nodes else normalize_text(student_node_labels.get(v, v))
            edge_lbl = data["label"]
            student_triplets[(src_lbl, edge_lbl, tgt_lbl)] = {
                "source_id": u,
                "target_id": v,
                "source_label": student_node_labels.get(u, u),
                "target_label": student_node_labels.get(v, v),
                "edge_label": data["original_label"],
            }

        evaluated_edges: List[EdgeEvaluationItem] = []
        matched_master_triplets = set()
        matched_student_triplets = set()

        # 1. Identify True Positives (TP) - direct match or tolerated direction match
        for s_trip, s_info in student_triplets.items():
            src, lbl, tgt = s_trip

            # Direct exact match
            if s_trip in master_triplets and s_trip not in matched_master_triplets:
                matched_master_triplets.add(s_trip)
                matched_student_triplets.add(s_trip)
                evaluated_edges.append(
                    EdgeEvaluationItem(
                        source=s_info["source_id"],
                        source_label=s_info["source_label"],
                        target=s_info["target_id"],
                        target_label=s_info["target_label"],
                        label=s_info["edge_label"],
                        status="correct",
                        note="Relasi dan arah sesuai dengan Master Map."
                    )
                )
            # Check direction tolerance if permitted
            elif config.allow_bidirectional_tolerance:
                rev_trip = (tgt, lbl, src)
                master_edge_info = master_triplets.get(rev_trip)
                is_tolerated = (
                    lbl in tolerated_labels or
                    (master_edge_info and master_edge_info.get("is_bidirectional"))
                )
                if rev_trip in master_triplets and rev_trip not in matched_master_triplets and is_tolerated:
                    matched_master_triplets.add(rev_trip)
                    matched_student_triplets.add(s_trip)
                    evaluated_edges.append(
                        EdgeEvaluationItem(
                            source=s_info["source_id"],
                            source_label=s_info["source_label"],
                            target=s_info["target_id"],
                            target_label=s_info["target_label"],
                            label=s_info["edge_label"],
                            status="correct",
                            note="Relasi terbalik namun ditoleransi berdasarkan aturan simetris asesmen."
                        )
                    )

        # 2. Identify False Negatives (FN) - missing relationships from Master Map
        knowledge_gaps: List[str] = []
        for m_trip, m_info in master_triplets.items():
            if m_trip not in matched_master_triplets:
                evaluated_edges.append(
                    EdgeEvaluationItem(
                        source=m_info["source_id"],
                        source_label=m_info["source_label"],
                        target=m_info["target_id"],
                        target_label=m_info["target_label"],
                        label=m_info["edge_label"],
                        status="missing",
                        note=f"Relasi '{m_info['source_label']} --[{m_info['edge_label']}]--> {m_info['target_label']}' belum dibuat."
                    )
                )
                knowledge_gaps.append(
                    f"Koneksi belum terbangun: {m_info['source_label']} ➔ {m_info['target_label']} ({m_info['edge_label']})"
                )

        # 3. Identify False Positives (FP) - extra or incorrect relationships made by student
        for s_trip, s_info in student_triplets.items():
            if s_trip not in matched_student_triplets:
                evaluated_edges.append(
                    EdgeEvaluationItem(
                        source=s_info["source_id"],
                        source_label=s_info["source_label"],
                        target=s_info["target_id"],
                        target_label=s_info["target_label"],
                        label=s_info["edge_label"],
                        status="incorrect",
                        note=f"Relasi tidak sesuai dengan struktur acuan."
                    )
                )

        tp = len(matched_master_triplets)
        fp = len(student_triplets) - len(matched_student_triplets)
        fn = len(master_triplets) - len(matched_master_triplets)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1_score = (2.0 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        relationship_accuracy_score = round(precision * 100.0, 1)
        structural_understanding_score = round(f1_score * 100.0, 1)

        w = config.weights
        total_score = round(
            (w.get("concept_recognition", 0.20) * concept_recognition_score) +
            (w.get("relationship_accuracy", 0.50) * relationship_accuracy_score) +
            (w.get("structural_understanding", 0.30) * structural_understanding_score),
            1
        )

        strengths = [
            f"{e.source_label} ➔ {e.target_label} ({e.label})"
            for e in evaluated_edges if e.status == "correct"
        ]

        return EvaluationResult(
            student_id=submission.student_id,
            student_name=submission.student_name,
            assessment_id=submission.assessment_id,
            total_score=total_score,
            concept_recognition_score=round(concept_recognition_score, 1),
            relationship_accuracy_score=relationship_accuracy_score,
            structural_understanding_score=structural_understanding_score,
            metrics={
                "precision": round(precision, 3),
                "recall": round(recall, 3),
                "f1_score": round(f1_score, 3),
                "true_positive": tp,
                "false_positive": fp,
                "false_negative": fn
            },
            evaluated_edges=evaluated_edges,
            knowledge_gaps=knowledge_gaps,
            strengths=strengths
        )

    @classmethod
    def aggregate_class_knowledge_gaps(
        cls,
        master_map: MasterConceptMap,
        results: List[EvaluationResult]
    ) -> ClassKnowledgeGapSummary:
        if not results:
            return ClassKnowledgeGapSummary(
                assessment_id=master_map.id,
                total_students=0,
                average_score=0.0,
                score_distribution={"<60": 0, "60-69": 0, "70-79": 0, "80-89": 0, "90-100": 0},
                problematic_relationships=[],
                well_understood_relationships=[]
            )

        total_students = len(results)
        average_score = round(sum(r.total_score for r in results) / total_students, 1)

        score_distribution = {"<60": 0, "60-69": 0, "70-79": 0, "80-89": 0, "90-100": 0}
        for r in results:
            s = r.total_score
            if s >= 90:
                score_distribution["90-100"] += 1
            elif s >= 80:
                score_distribution["80-89"] += 1
            elif s >= 70:
                score_distribution["70-79"] += 1
            elif s >= 60:
                score_distribution["60-69"] += 1
            else:
                score_distribution["<60"] += 1

        # Track accuracy per master edge
        edge_stats: Dict[str, Dict[str, Any]] = {}
        for edge in master_map.edges:
            src_lbl = next((n.label for n in master_map.nodes if n.id == edge.source), edge.source)
            tgt_lbl = next((n.label for n in master_map.nodes if n.id == edge.target), edge.target)
            key = f"{src_lbl} -> {tgt_lbl} [{edge.label}]"
            edge_stats[key] = {
                "source": src_lbl,
                "target": tgt_lbl,
                "label": edge.label,
                "correct_count": 0,
                "missing_count": 0,
            }

        for r in results:
            for item in r.evaluated_edges:
                key = f"{item.source_label} -> {item.target_label} [{item.label}]"
                rev_key = f"{item.target_label} -> {item.source_label} [{item.label}]"
                if key not in edge_stats and item.status == "correct" and rev_key in edge_stats:
                    key = rev_key  # accepted via direction tolerance
                if key in edge_stats:
                    if item.status == "correct":
                        edge_stats[key]["correct_count"] += 1
                    elif item.status == "missing":
                        edge_stats[key]["missing_count"] += 1

        problematic = []
        well_understood = []
        for key, stat in edge_stats.items():
            correct_pct = round((stat["correct_count"] / total_students) * 100.0, 1)
            error_pct = round(100.0 - correct_pct, 1)
            item_data = {
                "key": key,
                "source": stat["source"],
                "target": stat["target"],
                "label": stat["label"],
                "correct_percentage": correct_pct,
                "error_percentage": error_pct
            }
            if error_pct >= 40.0:
                problematic.append(item_data)
            else:
                well_understood.append(item_data)

        # Sort problematic by error descending
        problematic.sort(key=lambda x: x["error_percentage"], reverse=True)
        well_understood.sort(key=lambda x: x["correct_percentage"], reverse=True)

        return ClassKnowledgeGapSummary(
            assessment_id=master_map.id,
            total_students=total_students,
            average_score=average_score,
            score_distribution=score_distribution,
            problematic_relationships=problematic,
            well_understood_relationships=well_understood
        )
