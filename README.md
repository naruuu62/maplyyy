# Maply — AI-Assisted Conceptual Understanding Assessment Platform

Platform asesmen pemahaman konseptual berbasis rekonstruksi *concept map* (*Kit-Build Concept Mapping*) untuk dosen dan mahasiswa.

---

## 🚀 Fitur Utama (MVP Scope)

1. **Teacher Concept Map Builder & AI Generator:**
   - Visual drag-and-drop node & edge canvas menggunakan React Flow.
   - Ekstraksi draf otomatis dari materi kuliah via AI (*Authoring Assistant*).
   - Validasi dan penguncian *Master Concept Map* sebagai acuan penilaian formal.
   - Konfigurasi asesmen (durasi, toleransi arah relasi simetris, bobot penilaian).

2. **Student Concept Reconstruction Workspace:**
   - Penyajian kartu konsep dan jenis relasi yang diacak (*Concept Kit*).
   - Kanvas interaktif rekonstruksi struktur pengetahuan.
   - Preset simulasi pemahaman vs simulasi *knowledge gap* untuk demonstrasi cepat.

3. **Deterministic Graph Assessment Engine:**
   - Evaluasi graf berarah berlabel (*directed labeled graph*) menggunakan **NetworkX**.
   - Klasifikasi akurat: True Positive (TP), False Positive (FP), False Negative (FN).
   - Perhitungan metrik: Precision, Recall, F1-Score.
   - Skor 3 Dimensi:
     - **Concept Recognition** (20%)
     - **Relationship Accuracy** (50%)
     - **Structural Understanding** (30%)

4. **Class Knowledge Gap Analytics:**
   - Dashboard agregat kelas: distribusi skor pemahaman dan rata-rata kelas.
   - Visualisasi relasi paling banyak salah / belum dipahami (*Top Knowledge Gaps*).
   - Rekomendasi pedagogis (*actionable insights*) untuk pengajar.

---

## 📂 Struktur Proyek

```
Maply/
├── client/                     # Frontend Web (Next.js 16 + React 19 + TypeScript + Tailwind)
│   ├── src/
│   │   ├── app/                # App Router (page.tsx, globals.css, layout.tsx)
│   │   ├── components/         # UI Components (Navbar, StudentView, TeacherView, AnalyticsView, EvaluationModal)
│   │   ├── lib/                # API client & local fallback evaluator
│   │   └── types/              # TypeScript schema definitions
│   └── package.json
│
├── server/                     # Backend API (Python 3.13 + FastAPI + NetworkX)
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint & CORS
│   │   ├── models/schemas.py   # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── graph_engine.py # Deterministic NetworkX graph matching & gap analysis
│   │   │   ├── kit_generator.py# Randomized kit decomposition
│   │   │   └── ai_service.py   # AI Concept Map extractor (LLM & Heuristic fallback)
│   │   └── api/v1/endpoints/   # REST API routes
│   ├── tests/                  # Pytest unit tests
│   └── requirements.txt
│
├── Product Requirements Document (PRD) (2).md
└── Maply_Proposal_ICONFEST  (1).pdf
```

---

## 🛠️ Cara Menjalankan Proyek

### 1. Menjalankan Backend (FastAPI)
```bash
cd server
# Aktifkan virtual environment
.\.venv\Scripts\activate

# Jalankan server
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation (Swagger UI): `http://localhost:8000/docs`

### 2. Menjalankan Frontend (Next.js)
```bash
cd client
npm run dev
```
Buka browser di: `http://localhost:3000`

---

## 🧪 Menjalankan Unit Tests (Backend)
```bash
cd server
.\.venv\Scripts\pytest -v
```
Semua test perbandingan graf, klasifikasi relasi, dan toleransi arah dieksekusi secara otomatis.
