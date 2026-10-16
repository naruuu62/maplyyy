# **Product Requirements Document (PRD)**

## **Maply — AI-Assisted Conceptual Understanding Assessment**

**Version:** 1.1 (Full MVP Scope Target)  
**Platform:** Web Application  
**Primary Theme:** Education  
**Target:** Dosen/Pengajar dan Mahasiswa  
**Product Type:** Learning Assessment & Concept Mapping Platform

---

# **1\. Product Overview**

**Maply** adalah platform pembelajaran berbasis web yang membantu dosen mengukur **pemahaman konseptual mahasiswa** melalui rekonstruksi *concept map* (berlandaskan kerangka metodologi *Kit-Build Concept Map*).

Berbeda dari evaluasi konvensional yang umumnya mengukur kemampuan mahasiswa dalam memilih atau mengingat jawaban, Maply menguji apakah mahasiswa memahami **konsep dan hubungan antar konsep** dalam suatu materi.

Dosen membuat *Master Concept Map* sebagai representasi struktur pengetahuan yang benar. Sistem kemudian membongkar (*decompose*) peta tersebut menjadi kumpulan konsep dan hubungan yang disebut **Concept Kit**. Mahasiswa diminta menyusun kembali Concept Kit tersebut menjadi peta pengetahuan yang menurut mereka benar.

Sistem membandingkan *Student Concept Map* dengan *Master Concept Map* untuk mengidentifikasi:

* konsep yang berhasil dikenali;  
* hubungan konsep yang benar;  
* hubungan yang hilang;  
* hubungan yang salah;  
* serta pola kesalahan pemahaman.

Maply kemudian menghasilkan **Conceptual Understanding Score** dan **Knowledge Gap Analysis** yang dapat digunakan mahasiswa maupun dosen.

---

# **2\. Problem Statement**

Evaluasi pembelajaran masih banyak menggunakan pilihan ganda, kuis, dan soal berbasis jawaban akhir.

Metode tersebut dapat menunjukkan apakah mahasiswa memperoleh jawaban benar, tetapi belum tentu menunjukkan apakah mahasiswa memahami **struktur dan hubungan antar konsep**.

Contohnya, mahasiswa dapat mengetahui bahwa:

> "ALU adalah bagian dari CPU."

Namun belum tentu memahami hubungan ALU dengan Register, Control Unit, dan Memory dalam keseluruhan proses komputer.

Akibatnya, dosen dapat mengetahui **nilai mahasiswa**, tetapi tidak selalu mengetahui **bagian konsep mana yang sebenarnya belum dipahami**.

### **Problem utama**

> **Bagaimana mengukur apakah mahasiswa benar-benar memahami hubungan antar konsep dalam suatu materi, bukan hanya mampu mengingat informasi atau memperoleh jawaban yang benar?**

---

# **3\. Product Goal**

Maply bertujuan menyediakan mekanisme assessment yang dapat:

1. Mengukur pemahaman konseptual mahasiswa.  
2. Mengidentifikasi kesalahan hubungan antar konsep.  
3. Menunjukkan *knowledge gap* secara visual.  
4. Membantu dosen menemukan konsep yang belum dipahami oleh kelas.  
5. Mengurangi waktu pembuatan *concept map* melalui AI pada paket premium.

---

# **4\. Target Users**

## **4.1 Dosen / Pengajar**

Dosen menggunakan Maply untuk:

* membuat *Master Concept Map*;  
* membuat assessment;  
* memberikan assessment kepada mahasiswa;  
* melihat hasil individu;  
* menganalisis pemahaman satu kelas;  
* mengidentifikasi *knowledge gap*;  
* menggunakan AI untuk membuat draft concept map dari materi kuliah.

## **4.2 Mahasiswa**

Mahasiswa menggunakan Maply untuk:

* mengerjakan assessment;  
* menyusun kembali Concept Kit;  
* memahami kesalahan konseptual;  
* melihat feedback hasil assessment;  
* mengetahui bagian materi yang perlu dipelajari kembali.

---

# **5\. Core User Journey**

## **Teacher Journey**

Login  
  ↓  
Create Course  
  ↓  
Create Assessment  
  ↓  
Create Master Concept Map  
  ↓  
Configure Assessment  
  ↓  
Generate Concept Kit  
  ↓  
Publish Assessment  
  ↓  
Students Complete Assessment  
  ↓  
View Results  
  ↓  
Analyze Knowledge Gaps

## **Premium Teacher Journey**

Login  
  ↓  
Create Assessment  
  ↓  
Upload Learning Material  
(PDF / DOCX / PPTX / Text)  
  ↓  
AI analyzes material  
  ↓  
Extract Concepts  
  ↓  
Extract Relationships  
  ↓  
Generate Concept Map  
  ↓  
Teacher Review & Edit  
  ↓  
Approve Master Map  
  ↓  
Generate Concept Kit  
  ↓  
Publish Assessment

## **Student Journey**

Login  
  ↓  
Join / Open Assessment  
  ↓  
Read Instructions  
  ↓  
Receive Concept Kit  
  ↓  
Reconstruct Concept Map  
  ↓  
Submit  
  ↓  
Automatic Analysis  
  ↓  
View Result & Feedback

---

# **6\. Core Product Features**

## **6.1 Authentication & Role Management**

Users dapat login sebagai:

* Teacher  
* Student

Role menentukan akses terhadap fitur.

### **Teacher**

* Dashboard  
* Course  
* Concept Map  
* Assessment  
* Analytics  
* AI Generator (Premium)

### **Student**

* Dashboard  
* Available Assessment  
* Assessment History  
* Result  
* Feedback

---

# **7\. Teacher Features**

## **7.1 Course Management**

Dosen dapat:

* membuat course;  
* memberikan nama course;  
* memberikan deskripsi;  
* melihat daftar assessment;  
* melihat jumlah mahasiswa.

Contoh:

Computer Architecture  
├── CPU & Instruction  
├── Memory Hierarchy  
└── I/O System

---

# **8\. Master Concept Map Builder**

Dosen dapat membuat *Master Concept Map* secara visual sebagai acuan penilaian pemahaman konseptual peserta didik.

### **Node**

Setiap node merepresentasikan sebuah konsep.

Contoh:

\[CPU\]

\[ALU\]

\[Control Unit\]

\[Register\]

\[Memory\]

### **Edge**

Setiap edge menunjukkan hubungan antar konsep dan memiliki label yang menjelaskan jenis hubungannya.

Contoh:

CPU

├── contains → ALU

├── contains → Control Unit

└── interacts with → Memory

### **Editor Capabilities**

* Create node  
* Delete node  
* Edit node  
* Connect node  
* Delete connection  
* Edit relationship  
* Drag and reposition  
* Zoom  
* Pan  
* Auto-layout  
* Group related nodes  
* Collapse and expand node groups  
* Save draft  
* Publish

  ### **Large Concept Map Support**

* Editor dirancang untuk menangani peta konsep dengan minimal 100 node.  
* Node grouping membantu dosen mengelompokkan konsep yang saling berkaitan.  
* Collapsible groups memungkinkan kelompok konsep dilipat atau dibuka untuk mempermudah navigasi.  
* Zoom dan pan membantu pengguna menjelajahi peta konsep berukuran besar.

# **9\. Concept Kit Generation**

Setelah Master Concept Map selesai, sistem melakukan decomposition.

Master map:

         CPU  
        /     \\  
      ALU      Control Unit  
       |  
    Register  
       |  
    Memory

Menjadi:

### **Concept Kit**

\[CPU\]  
\[ALU\]  
\[Control Unit\]  
\[Register\]  
\[Memory\]

### **Relationship Kit**

\[contains\]  
\[uses\]  
\[interacts with\]  
\[connected to\]

Kit kemudian dapat diacak ketika diberikan kepada mahasiswa.

---

# **10\. Assessment Configuration**

Dosen dapat mengatur konfigurasi asesmen sebelum dipublikasikan.

### **Assessment Settings**

* Assessment title  
* Assessment description  
* Duration  
* Attempt limits  
* Start and end time  
* Result visibility  
* Feedback settings  
* Randomize concept kit  
* Randomize answer options  
* Relationship direction tolerance

### **Relationship Direction Tolerance**

* Dosen dapat menentukan apakah arah relasi tertentu boleh ditoleransi ketika peserta didik menyusun ulang peta konsep.  
* Toleransi hanya berlaku untuk jenis relasi yang secara eksplisit diizinkan dalam konfigurasi asesmen.  
* Relasi yang tidak termasuk dalam aturan toleransi tetap dinilai berdasarkan arah dan label aslinya.  
* Pengaturan ini memungkinkan asesmen menyesuaikan karakteristik hubungan antar konsep tanpa mengabaikan ketepatan struktur peta.

# **11\. Student Concept Map Workspace**

Mahasiswa mendapatkan canvas kosong dan Concept Kit.

Contoh:

┌──────────────────────────────────────────┐  
│ CONCEPT KIT                              │  
│                                          │  
│ \[CPU\] \[ALU\] \[Register\] \[Memory\]         │  
│ \[Control Unit\]                           │  
│                                          │  
│ \[contains\] \[uses\] \[interacts with\]      │  
├──────────────────────────────────────────┤  
│                                          │  
│             YOUR CONCEPT MAP             │  
│                                          │  
│                  \[CPU\]                   │  
│                  /   \\                   │  
│                \[ALU\] \[Control Unit\]     │  
│                   │                      │  
│               \[Register\]                 │  
│                   │                      │  
│                \[Memory\]                  │  
│                                          │  
└──────────────────────────────────────────┘

Mahasiswa dapat:

* drag node;  
* connect node;  
* memilih relationship;  
* menghapus connection;  
* mengubah posisi;  
* melihat seluruh Concept Kit;  
* submit map.

---

# **12\. Concept Map Assessment Engine**

Maply mengevaluasi peta konsep peserta didik dengan membandingkannya terhadap *Master Concept Map* menggunakan pendekatan *directed labeled graph*. Setiap relasi dinilai berdasarkan konsep asal, label hubungan, dan konsep tujuan.

### **Graph Comparison**

* Compare Student Concept Map with Master Concept Map  
* Identify correct relationships  
* Identify incorrect relationships  
* Identify missing relationships  
* Apply configured relationship direction tolerance  
* Calculate evaluation metrics

### **Evaluation Metrics**

* **True Positive (TP):** Relasi yang berhasil direkonstruksi dengan benar.  
* **False Positive (FP):** Relasi yang dibuat peserta didik tetapi tidak sesuai dengan peta acuan.  
* **False Negative (FN):** Relasi yang seharusnya ada tetapi tidak berhasil direkonstruksi.  
* **Precision:** Proporsi relasi yang teridentifikasi dan benar.  
* **Recall:** Proporsi relasi pada peta acuan yang berhasil ditemukan.  
* **F1-score:** Rata-rata harmonik Precision dan Recall.

### **Relationship Direction Tolerance**

* Evaluasi graf menggunakan NetworkX.  
* Arah relasi tetap diperhitungkan dalam proses perbandingan.  
* Relasi terbalik hanya dapat diterima jika diizinkan oleh konfigurasi asesmen.  
* Relasi terbalik yang diizinkan tidak boleh dihitung sekaligus sebagai relasi salah dan relasi hilang.  
* Relasi yang tidak mendapat toleransi tetap dievaluasi berdasarkan arah aslinya.

### **Assessment Output**

* Conceptual Understanding Score  
* Knowledge Gap Analysis  
* Correct relationships  
* Incorrect relationships  
* Missing relationships

# **13\. Assessment Result**

Sistem mengklasifikasikan hasil menjadi:

### **Correct Relationship**

Hubungan sesuai dengan Master Map.

CPU → ALU ✓

### **Missing Relationship**

Hubungan yang seharusnya ada tetapi tidak dibuat mahasiswa.

ALU → Register ✕

### **Incorrect Relationship**

Mahasiswa membuat hubungan yang tidak sesuai dengan Master Map.

ALU → Memory ⚠

### **Correct Concept**

Konsep berhasil digunakan pada posisi/struktur yang sesuai.

---

# **14\. Conceptual Understanding Score**

Nilai akhir tidak hanya berdasarkan jumlah node.

Contoh komponen:

Concept Recognition       20%  
Relationship Accuracy     50%  
Structural Understanding  30%

Contoh hasil:

Concept Recognition       100%  
Relationship Accuracy      76%  
Structural Understanding   72%

Conceptual Understanding  
           79 / 100

Bobot dapat dikonfigurasi atau ditentukan oleh sistem pada versi awal.

---

# **15\. Knowledge Gap Analysis**

Ini merupakan salah satu fitur utama Maply.

Sistem mengidentifikasi bagian konsep yang paling sering salah atau hilang.

Contoh:

CLASS KNOWLEDGE MAP

              CPU  
             /   \\  
          94%     91%  
          /         \\  
        ALU          CU  
         |  
        48%  
         |  
      Register  
         |  
        37%  
         |  
       Memory

Interpretasi:

> Hubungan ALU → Register dan Register → Memory merupakan bagian yang paling banyak mengalami kesalahan.

Dosen dapat melihat:

* konsep paling dipahami;  
* konsep paling sering salah;  
* hubungan paling sering hilang;  
* hubungan paling sering salah;  
* persentase mahasiswa yang mengalami kesalahan;  
* distribusi skor kelas.

---

# **16\. Student Feedback**

Mahasiswa mendapatkan feedback setelah assessment.

Contoh:

Your Score

79 / 100

Strong Understanding  
✓ CPU  
✓ ALU  
✓ Control Unit

Needs Review  
⚠ ALU → Register  
⚠ Register → Memory

Your main knowledge gap:  
Understanding how intermediate data moves  
between processing and memory components.

Feedback harus berasal dari hasil graph comparison.

---

# **17\. Premium Feature — AI Concept Map Generator**

Fitur ini membantu dosen menghasilkan draf peta konsep dari materi pembelajaran menggunakan AI. Hasil generasi digunakan sebagai titik awal penyusunan peta konsep, bukan sebagai peta acuan yang langsung digunakan untuk penilaian.

### **Supported Input**

* PDF  
* DOCX  
* PPTX  
* Plain text

### **Generation Workflow**

1. Dosen mengunggah materi pembelajaran.  
2. Sistem mengekstrak teks dari dokumen.  
3. AI mengidentifikasi konsep utama dan konsep pendukung.  
4. AI mengidentifikasi hubungan antar konsep.  
5. Sistem membentuk keluaran terstruktur dalam format JSON.  
6. Sistem memvalidasi struktur JSON dan referensi antar node.  
7. Draf peta konsep ditampilkan dalam editor.  
8. Dosen meninjau dan mengoreksi hasil generasi.  
9. Dosen menyetujui draf untuk dijadikan Master Concept Map.

### **AI Processing**

* AI generation dijalankan melalui layanan FastAPI yang terpisah dari alur utama asesmen.  
* Pemrosesan dilakukan secara asinkron agar proses generasi tidak memblokir penggunaan fitur lain.  
* Keluaran menggunakan Structured Output berbasis JSON Schema.  
* Struktur keluaran memuat `nodes` dan `edges`.  
* Setiap edge harus merujuk pada node yang valid.  
* Sistem menangani kegagalan ekstraksi dokumen, keluaran tidak valid, dan kegagalan layanan AI.  
* Semua hasil generasi berstatus draft sampai disetujui dosen.

---

# **18\. AI Concept Extraction**

Contoh materi:

> "CPU terdiri dari Control Unit dan ALU. ALU melakukan operasi aritmatika dan logika. Register digunakan untuk menyimpan data sementara yang sedang diproses."

AI menghasilkan:

CPU  
Control Unit  
ALU  
Register  
Arithmetic Operation  
Logic Operation  
Temporary Data

---

# **19\. AI Relationship Extraction**

AI kemudian menghasilkan:

CPU  
 ├── contains → Control Unit  
 ├── contains → ALU  
 └── uses → Register

ALU  
 ├── performs → Arithmetic Operation  
 └── performs → Logic Operation

Register  
 └── stores → Temporary Data

---

# **20\. AI Confidence & Teacher Review**

Setiap peta konsep yang dihasilkan AI harus melalui proses peninjauan dosen sebelum digunakan sebagai acuan asesmen.

### **Teacher Review Capabilities**

* Accept generated node  
* Reject generated node  
* Edit generated node  
* Delete generated node  
* Add missing node  
* Accept generated relationship  
* Reject generated relationship  
* Edit relationship label or direction  
* Delete generated relationship  
* Add missing relationship  
* Approve Master Concept Map

  ### **Confidence Indicator**

* Sistem dapat menampilkan confidence score apabila informasi tersebut disediakan oleh penyedia AI yang digunakan.  
* Confidence score hanya berfungsi sebagai indikator tambahan untuk membantu proses peninjauan.  
* Confidence score tidak menjamin bahwa konsep atau relasi yang dihasilkan benar.  
* Dosen tetap bertanggung jawab untuk memvalidasi kesesuaian peta konsep dengan materi pembelajaran.

  ### **Approval Rules**

* AI-generated maps remain drafts until approved.  
* Only teacher-approved maps can be published as assessment references.  
* AI cannot automatically publish or replace an existing Master Concept Map.

---

# **21\. Prinsip AI**

## **21\. AI Principles**

AI digunakan sebagai:

> **Authoring Assistant**

bukan:

> **Assessment Authority**

Artinya:

AI

↓

Generate Draft

↓

Teacher Validation

↓

Approved Master Map

↓

Deterministic Assessment

Dengan demikian, AI hanya membantu dosen menyusun draf peta konsep dari materi pembelajaran. Dosen tetap bertanggung jawab memvalidasi konsep dan relasi sebelum peta digunakan sebagai acuan asesmen. Penilaian peserta didik dilakukan melalui perbandingan graf berdasarkan *Master Concept Map* yang telah disetujui dosen, sehingga hasil asesmen dapat ditelusuri dan dijelaskan berdasarkan aturan evaluasi yang telah ditentukan.

---

# **22\. Analytics Dashboard**

Dashboard dosen menampilkan:

### **Overview**

Students        42  
Average Score   76%  
Completion      95%

### **Understanding Distribution**

90–100   █████████  
80–89    █████████████  
70–79    ███████████████  
60–69    ███████  
\<60      ███

### **Knowledge Gap**

Top Knowledge Gaps

1\. Register → Memory       38%  
2\. ALU → Register          43%  
3\. Control Unit → ALU      61%

---

# **23\. Data Model**

Core entities:

User  
 ├── Teacher  
 └── Student

Course  
 └── Assessment  
       │  
       └── MasterConceptMap  
             ├── ConceptNode  
             └── ConceptEdge

Assessment  
 └── StudentAttempt  
       └── StudentConceptMap  
             ├── StudentNode  
             └── StudentEdge

StudentAttempt  
 └── AssessmentResult  
       ├── CorrectEdges  
       ├── MissingEdges  
       ├── IncorrectEdges  
       ├── Score  
       └── KnowledgeGaps

---

# **24\. Technical Architecture**

                   Maply menggunakan arsitektur berbasis web dengan Next.js dan TypeScript pada sisi frontend serta FastAPI pada sisi backend.  
                   WEB CLIENT  
               Next.js \+ TypeScript  
                         |  
          \+--------------+--------------+  
          |                             |  
   Teacher Dashboard             Student Workspace  
          |                             |  
          \+--------------+--------------+  
                         |  
                      REST API  
                         |  
                    \+----▼----+  
                    | FastAPI |  
                    \+---------+  
                    | Auth Service  
                    | Course Service  
                    | Map Service  
                    | Assessment Service  
                    | Graph Engine  
                    | Analytics Service  
                    | AI Generation Service  
                    \+---------+  
                         |  
          \+--------------+--------------+  
          |              |              |  
      PostgreSQL      NetworkX        LLM API  
          |  
      Supabase

Web Client menyediakan antarmuka bagi dosen untuk mengelola kelas, membuat peta konsep, mengatur asesmen, dan melihat hasil evaluasi. Student Workspace digunakan peserta didik untuk merekonstruksi peta konsep sebagai bagian dari asesmen. Komunikasi antara frontend dan backend dilakukan melalui REST API yang dibangun menggunakan FastAPI.

Backend terdiri atas Auth Service untuk autentikasi dan pengelolaan hak akses, Course Service untuk pengelolaan kelas, Map Service untuk pengelolaan peta konsep, Assessment Service untuk pengaturan dan pemrosesan asesmen, Graph Engine untuk evaluasi graf, Analytics Service untuk menghasilkan analisis hasil asesmen, serta AI Generation Service untuk menghasilkan draf peta konsep menggunakan layanan AI eksternal.

PostgreSQL digunakan untuk menyimpan data pengguna, kelas, asesmen, peta konsep, relasi, dan hasil evaluasi. Supabase digunakan sebagai layanan PostgreSQL terkelola. NetworkX digunakan oleh Graph Engine untuk membandingkan peta konsep peserta didik dengan Master Concept Map yang telah disetujui dosen. LLM API digunakan oleh AI Generation Service untuk membantu menghasilkan draf peta konsep dari materi pembelajaran.

AI-generated draft harus melalui validasi dan persetujuan dosen sebelum digunakan sebagai Master Concept Map. Proses evaluasi asesmen dilakukan menggunakan mekanisme perbandingan graf sehingga tetap dapat berjalan tanpa bergantung pada ketersediaan LLM API.

---

# **25\. Technology Stack**

### **Frontend**

* Next.js  
* React  
* TypeScript  
* Tailwind CSS  
* shadcn/ui  
* React Flow

  ### **Backend**

* Python  
* FastAPI  
* Pydantic  
* SQLAlchemy  
* NetworkX

  ### **Database and Storage**

* PostgreSQL  
* Supabase

  ### **AI Integration**

* External LLM API  
* Structured Output / JSON Schema  
* Document text extraction  
* Asynchronous AI processing  
* JSON validation before rendering

  ### **Deployment**

* Vercel for frontend deployment  
* Railway for backend deployment  
* Supabase for managed database services

The specific LLM provider and model will be selected after verifying API availability, structured-output support, cost, and compatibility with the generation workflow.

---

# **26\. Non-Functional Requirements**

### **Performance**

* The concept map editor is designed to support at least 100 nodes while remaining responsive during normal editing operations.  
* Zoom, pan, node grouping, and collapsible groups should remain usable for large concept maps.  
* Assessment results should be generated within a defined response-time target for the tested map size.  
* AI generation must use asynchronous processing so that long-running tasks do not block the main application.

### **Reliability**

* Draft maps should be saved automatically or through an explicit save mechanism.  
* Submission status must be communicated clearly to students.  
* The system should handle network interruptions and prevent unnecessary loss of submitted answers.  
* Failed AI generation must not corrupt existing concept maps or assessment data.

### **Security**

* Role-based access control must distinguish teacher and student permissions.  
* Students must not be able to modify the official Master Concept Map.  
* Only authorized teachers can approve and publish reference maps.  
* Assessment answers and results must be accessible only to authorized users.

### **Explainability**

* Evaluation results must identify correct, incorrect, and missing relationships.  
* Scores must be traceable to the graph-comparison process and configured assessment rules.  
* Relationship direction tolerance must be applied consistently according to the assessment configuration.

---

# **27\. MVP Scope (Target Fungsional Penuh)**

Untuk implementasi produk dan kesiapan kompetisi, MVP Maply menargetkan seluruh rangkaian fitur inti (End-to-End) dapat beroperasi secara fungsional dan teruji penuh, mencakup alur Pengajar, Peserta Didik, Mesin Evaluasi Graf, hingga Asisten AI.

### **Teacher**

* Login  
* Course Management  
* Manual Concept Map Builder  
* Create Assessment  
* Configure Assessment  
* Generate Concept Kit  
* Publish Assessment  
* Basic Analytics

  ### **Student**

* Login  
* View Assessment  
* Access Concept Kit  
* Concept Map Workspace  
* Reconstruct Concept Map  
* Submit Assessment  
* View Result

  ### **Assessment**

* Graph Comparison  
* Correct Relationship Identification  
* Missing Relationship Identification  
* Incorrect Relationship Identification  
* Configurable Relationship Direction Tolerance  
* Conceptual Understanding Score  
* Basic Knowledge Gap Analysis

  ### **Premium Demo**

* Upload PDF  
* Document Text Extraction  
* AI Concept Extraction  
* AI Relationship Extraction  
* AI-generated Concept Map  
* Structured JSON Validation  
* Teacher Review  
* Edit Generated Map  
* Approve Master Concept Map

Fitur Premium Demo ditujukan untuk menunjukkan alur pembuatan draf peta konsep menggunakan AI. Hasil generasi harus melalui validasi dan persetujuan dosen sebelum digunakan sebagai Master Concept Map. Fitur ini tidak menjadi dependensi bagi proses asesmen utama.

---

# **28\. Out of Scope untuk MVP**

The following features are excluded from the initial MVP:

* Full Learning Management System (LMS)  
* Direct integration with external LMS platforms  
* Video conferencing and learning video hosting  
* Attendance management  
* Student-teacher chat  
* Native Android and iOS applications  
* Production payment processing and subscription billing  
* LLM-based automatic grading of student submissions  
* Automatic curriculum generation  
* Automatic publication of AI-generated concept maps without teacher approval

CSV import and export may be used as the initial method for transferring participant data and assessment reports without requiring direct LMS integration.

---

# **29\. Key Differentiator**

Maply bukan sekadar:

> "Aplikasi untuk membuat concept map."

Dan bukan pula:

> "AI pembuat mind map."

Nilai utama produk adalah:

> **Menggunakan rekonstruksi concept map untuk mengukur apakah mahasiswa memahami hubungan antar konsep dan mengidentifikasi knowledge gap yang tidak terlihat dari skor ujian konvensional.**

AI premium hanya mempercepat proses pembuatan *Master Concept Map*.

---

# **30\. Success Metrics**

Maply's success will be evaluated through usability, assessment performance, system reliability, and the usefulness of the generated learning insights.

### **Product Adoption**

* Number of teachers who create and publish assessments  
* Number of students who complete assessments  
* Completion rate of published assessments  
* Teacher satisfaction with the concept map editor

  ### **Assessment Performance**

* Consistency of graph-comparison results against manually verified examples  
* Ability to identify correct, incorrect, and missing relationships  
* Correct application of configured relationship direction tolerance  
* Agreement between automated evaluation results and teacher-reviewed examples

  ### **AI Generation**

* Percentage of AI-generated drafts approved by teachers  
* Number and types of corrections made during teacher review  
* Frequency of invalid JSON outputs or failed generation requests  
* Time required for teachers to review and finalize generated maps

  ### **System Performance**

* Editor responsiveness when handling at least 100 nodes  
* Assessment processing time for defined test cases  
* Successful CSV import and report export rates  
* Frequency of failed submissions and unrecovered errors

Numerical targets will be established after initial usability testing, technical validation, and pilot implementation. Metrics must be measured using documented test scenarios rather than assumed performance results.

---

# **31\. Example End-to-End Scenario**

### **Materi**

**Computer Architecture — CPU**

### **Dosen**

Upload materi:

`CPU_Architecture.pdf`

AI menghasilkan:

CPU  
├── ALU  
├── Control Unit  
└── Register

Dosen memperbaiki satu relationship dan menekan:

**Approve Master Map**

---

### **Sistem**

Menghasilkan Concept Kit:

CPU  
ALU  
Control Unit  
Register  
Memory

contains  
uses  
stores

Kit diacak.

---

### **Mahasiswa**

Menyusun:

CPU  
├── ALU  
└── Control Unit

ALU  
└── Memory

---

### **Sistem**

Membandingkan dengan Master Map.

Correct  
CPU → ALU                    ✓  
CPU → Control Unit           ✓

Missing  
ALU → Register               ✕

Incorrect  
ALU → Memory                 ⚠

---

### **Hasil**

Concept Recognition       100%  
Relationship Accuracy      67%  
Structural Understanding   62%

CONCEPTUAL UNDERSTANDING  
              70 / 100

Knowledge gap utama:

> **Mahasiswa memahami komponen CPU, tetapi belum memahami hubungan antara ALU dan Register.**

---

# **32\. Product Vision**

> **Maply transforms assessment from measuring what students can answer into measuring how students connect what they know.**

Dengan pendekatan ini, Maply memosisikan **conceptual structure** sebagai objek utama assessment, sementara AI digunakan untuk mempercepat proses authoring bagi pengajar.

