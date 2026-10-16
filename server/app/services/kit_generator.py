import random
from typing import List
from app.models.schemas import MasterConceptMap, ConceptKit, ConceptNode

class KitGenerator:
    """
    Decomposes a Master Concept Map into a randomized Concept Kit
    and unique Relationship Kit for student reconstruction.
    """

    @staticmethod
    def generate_kit(
        master_map: MasterConceptMap,
        shuffle: bool = True,
        distractors: List[str] = None
    ) -> ConceptKit:
        concepts = [
            ConceptNode(
                id=node.id,
                label=node.label,
                description=node.description,
                group=node.group
            )
            for node in master_map.nodes
        ]

        # Inject distractor nodes if configured
        if distractors:
            for idx, dist in enumerate(distractors):
                if dist and dist.strip():
                    concepts.append(
                        ConceptNode(
                            id=f"distractor-{idx+1}",
                            label=dist.strip(),
                            description="Pengecoh Konsep",
                            group="distractor"
                        )
                    )

        # Extract unique relationship labels used in the master map
        unique_labels = sorted(list({edge.label for edge in master_map.edges if edge.label}))

        if shuffle:
            random.seed()
            random.shuffle(concepts)
            random.shuffle(unique_labels)

        return ConceptKit(
            assessment_id=master_map.id,
            concepts=concepts,
            available_relationships=unique_labels
        )
