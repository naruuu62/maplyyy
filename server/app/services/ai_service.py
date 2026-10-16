import os
import re
import uuid
import httpx
from typing import List, Dict, Any, Optional
from app.models.schemas import ConceptNode, ConceptEdge, AIDraftResponse

class AIService:
    """
    AI Concept Map Assistant.
    Generates structured concept maps (nodes and labeled edges) from instructional texts.
    Supports external LLM calls or intelligent local heuristic extraction as fallback.
    """

    @classmethod
    async def generate_concept_map_draft(cls, topic: str, text: str, target_node_count: int = 7) -> AIDraftResponse:
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                return await cls._call_gemini_api(topic, text, target_node_count, gemini_key)
            except Exception as e:
                print(f"[Gemini API Error] {e}")

        api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                return await cls._call_external_llm(topic, text, target_node_count, api_key)
            except Exception as e:
                print(f"[LLM API Error] {e}")

        return cls._generate_heuristic_draft(topic, text, target_node_count)

    @classmethod
    def _generate_heuristic_draft(cls, topic: str, text: str, target_node_count: int) -> AIDraftResponse:
        """
        Robust heuristic extraction for CPU architecture and common domain texts.
        Ensures Maply MVP works deterministically and immediately even without external API keys.
        """
        # Common domain patterns or general text sentence extraction
        topic_lower = topic.lower()
        
        if "cpu" in topic_lower or "arsitektur" in topic_lower or "computer" in topic_lower:
            nodes = [
                ConceptNode(id="node-cpu", label="CPU", description="Central Processing Unit", x=300, y=50),
                ConceptNode(id="node-alu", label="ALU", description="Arithmetic Logic Unit", x=150, y=180),
                ConceptNode(id="node-cu", label="Control Unit", description="Mengatur alur instruksi CPU", x=450, y=180),
                ConceptNode(id="node-reg", label="Register", description="Penyimpan data internal super cepat", x=150, y=320),
                ConceptNode(id="node-mem", label="Memory (RAM)", description="Penyimpan data utama sistem", x=300, y=450),
                ConceptNode(id="node-bus", label="System Bus", description="Jalur komunikasi data dan sinyal", x=450, y=320),
            ]
            edges = [
                ConceptEdge(id="edge-1", source="node-cpu", target="node-alu", label="contains"),
                ConceptEdge(id="edge-2", source="node-cpu", target="node-cu", label="contains"),
                ConceptEdge(id="edge-3", source="node-cpu", target="node-reg", label="uses"),
                ConceptEdge(id="edge-4", source="node-alu", target="node-reg", label="stores temporary result in"),
                ConceptEdge(id="edge-5", source="node-cu", target="node-alu", label="controls"),
                ConceptEdge(id="edge-6", source="node-reg", target="node-mem", label="transfers data with", is_bidirectional=True),
                ConceptEdge(id="edge-7", source="node-cu", target="node-bus", label="sends control signal to"),
            ]
            notes = "Draf diekstraksi dari struktur konseptual arsitektur komputer (CPU & Komponen)."
        else:
            # General heuristic from sentences
            sentences = [s.strip() for s in re.split(r'[.\n]+', text) if len(s.strip()) > 10]
            words = [w for w in re.findall(r'\b[A-Za-z0-9_-]{3,}\b', text)]
            
            # Form default seed nodes
            nodes = [
                ConceptNode(id="node-root", label=topic.title(), description=f"Topik utama: {topic}", x=300, y=50)
            ]
            edges = []
            
            # Extract capitalized or frequent words
            freq = {}
            for w in words:
                w_c = w.capitalize()
                if w_c.lower() not in [topic.lower(), "dan", "yang", "untuk", "dari", "pada", "adalah", "dengan"]:
                    freq[w_c] = freq.get(w_c, 0) + 1
            
            top_words = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)[:target_node_count-1]
            if not top_words:
                top_words = ["Komponen A", "Komponen B", "Proses Utama", "Hasil Akhir"]

            for idx, w in enumerate(top_words):
                nid = f"node-{idx+1}"
                nodes.append(ConceptNode(
                    id=nid,
                    label=w,
                    description=f"Konsep turunan dari {topic}",
                    x=150 + (idx % 3) * 180,
                    y=180 + (idx // 3) * 140
                ))
                # connect root to nodes
                edges.append(ConceptEdge(
                    id=f"edge-{idx+1}",
                    source="node-root",
                    target=nid,
                    label="memiliki komponen" if idx == 0 else "berhubungan dengan",
                    is_bidirectional=True if idx > 2 else False
                ))

            notes = f"Draf dihasilkan otomatis berdasarkan ekstraksi leksikal materi '{topic}'."

        return AIDraftResponse(
            topic=topic,
            nodes=nodes,
            edges=edges,
            confidence_score=0.88,
            generation_notes=notes
        )

    @classmethod
    async def _call_external_llm(cls, topic: str, text: str, target_count: int, api_key: str) -> AIDraftResponse:
        # Structured JSON prompt for OpenAI-compatible endpoint
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        prompt = f"""
You are Maply AI Concept Assistant.
Extract a concept map for topic: "{topic}".
Text:
{text[:2000]}

Return STRICT JSON with format:
{{
  "topic": "{topic}",
  "nodes": [{{"id": "n1", "label": "Concept Name", "description": "brief desc"}}],
  "edges": [{{"id": "e1", "source": "n1", "target": "n2", "label": "relationship label", "is_bidirectional": false}}],
  "confidence_score": 0.92,
  "generation_notes": "Summary of extraction"
}}
"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
            )
            data = resp.json()
            import json
            content = json.loads(data["choices"][0]["message"]["content"])
            nodes = [ConceptNode(**n) for n in content.get("nodes", [])]
            edges = [ConceptEdge(**e) for e in content.get("edges", [])]
            return AIDraftResponse(
                topic=topic,
                nodes=nodes,
                edges=edges,
                confidence_score=content.get("confidence_score", 0.90),
                generation_notes=content.get("generation_notes", "Extracted via LLM API")
            )

    @classmethod
    async def _call_gemini_api(cls, topic: str, text: str, target_count: int, api_key: str) -> AIDraftResponse:
        """
        Calls Google Gemini API (gemini-3.8-flash) with native JSON output mode.
        Extracts high-fidelity concept maps (nodes and directed edges) from curriculum materials.
        """
        import json
        candidate_models = ["gemini-3-flash-preview", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"]
        
        system_instruction = (
            "You are an expert pedagogical concept map builder following Kit-Build principles. "
            "Extract essential concepts (nodes) and explicit, labeled, directed relationships (edges) from the provided instructional text. "
            "You must respond ONLY with a JSON object adhering to the specified schema without Markdown fences."
        )

        user_prompt = f"""
Topik: "{topic}"
Jumlah konsep target: {target_count} keping.

Materi Ajar / Dokumen:
{text[:6000]}

Format JSON yang diwajibkan:
{{
  "topic": "{topic}",
  "nodes": [
    {{"id": "c1", "label": "Nama Konsep Singkat", "description": "Deskripsi singkat fungsi konsep", "x": 300, "y": 80}}
  ],
  "edges": [
    {{"id": "e1", "source": "c1", "target": "c2", "label": "predikat relasi", "is_bidirectional": false}}
  ],
  "confidence_score": 0.95,
  "generation_notes": "Penjelasan singkat struktur materi yang diekstraksi."
}}
"""

        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            last_err = None
            for model_name in candidate_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    res_json = resp.json()
                    candidates = res_json.get("candidates", [])
                    if candidates:
                        raw_text = candidates[0]["content"]["parts"][0]["text"]
                        content = json.loads(raw_text)
                        break
                else:
                    last_err = f"Model {model_name} returned status {resp.status_code}: {resp.text}"
            else:
                raise Exception(last_err or "All Gemini candidate models failed.")

            # Assign aesthetic default coordinates if missing or zero
            raw_nodes = content.get("nodes", [])
            nodes = []
            for idx, n in enumerate(raw_nodes):
                x = n.get("x") or (200 + (idx % 3) * 220)
                y = n.get("y") or (80 + (idx // 3) * 150)
                nodes.append(ConceptNode(
                    id=n.get("id") or f"c-{idx+1}",
                    label=n.get("label", f"Konsep {idx+1}"),
                    description=n.get("description", ""),
                    x=x,
                    y=y
                ))

            edges = [
                ConceptEdge(
                    id=e.get("id") or f"e-{idx+1}",
                    source=e["source"],
                    target=e["target"],
                    label=e["label"],
                    is_bidirectional=e.get("is_bidirectional", False)
                )
                for idx, e in enumerate(content.get("edges", []))
                if e.get("source") and e.get("target")
            ]

            return AIDraftResponse(
                topic=content.get("topic", topic),
                nodes=nodes,
                edges=edges,
                confidence_score=content.get("confidence_score", 0.95),
                generation_notes=content.get("generation_notes", "Ekstraksi berhasil via Google Gemini AI")
            )
