import {
  MasterConceptMap,
  AssessmentConfig,
  ConceptKit,
  EvaluationResult,
  ClassKnowledgeGapSummary,
  AIDraftResponse,
  ConceptNode,
  ConceptEdge,
  User,
  AuthResponse
} from '../types/maply';

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }
  // If running in browser and domain is NOT localhost (e.g. *.vercel.app), default to Render backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://maply-api-39cp.onrender.com/api/v1';
  }
  return (envUrl || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
}

export const INITIAL_MASTER_MAP: MasterConceptMap = {
  id: 'map-cpu-1',
  title: 'Arsitektur Komputer — Komponen CPU',
  description: 'Peta konsep acuan struktur CPU, ALU, Control Unit, Register, dan Memory.',
  course_id: 'course-cs101',
  nodes: [
    { id: 'cpu', label: 'CPU', description: 'Central Processing Unit', x: 300, y: 50 },
    { id: 'alu', label: 'ALU', description: 'Arithmetic Logic Unit', x: 150, y: 190 },
    { id: 'cu', label: 'Control Unit', description: 'Pengendali alur instruksi', x: 450, y: 190 },
    { id: 'register', label: 'Register', description: 'Penyimpan data internal super cepat', x: 150, y: 340 },
    { id: 'memory', label: 'Memory (RAM)', description: 'Penyimpan data utama sistem', x: 300, y: 480 },
  ],
  edges: [
    { id: 'e1', source: 'cpu', target: 'alu', label: 'contains' },
    { id: 'e2', source: 'cpu', target: 'cu', label: 'contains' },
    { id: 'e3', source: 'cpu', target: 'register', label: 'uses' },
    { id: 'e4', source: 'alu', target: 'register', label: 'stores temporary result in' },
    { id: 'e5', source: 'cu', target: 'alu', label: 'controls' },
    { id: 'e6', source: 'register', target: 'memory', label: 'transfers data with', is_bidirectional: true },
  ],
  status: 'approved'
};

export const INITIAL_ASSESSMENT: AssessmentConfig = {
  id: 'asm-1',
  title: 'Kuis Pemahaman Konseptual Arsitektur CPU',
  description: 'Susun kembali Concept Kit untuk menguji pemahaman aliran data antar-komponen CPU.',
  instructions: 'Rangkai kembali simpul konsep CPU dan alur transfer data dengan tepat.',
  master_map_id: 'map-cpu-1',
  exam_token: 'KBT-9428',
  duration_minutes: 30,
  allow_bidirectional_tolerance: true,
  tolerated_symmetric_labels: ['transfers data with', 'interacts with', 'terhubung dengan', 'connected to'],
  randomize_kit: true,
  weights: {
    concept_recognition: 0.20,
    relationship_accuracy: 0.50,
    structural_understanding: 0.30
  }
};

// Auth Token Local Helpers
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('maply_auth_token');
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('maply_auth_token', token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('maply_auth_token');
    localStorage.removeItem('maply_active_user');
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('maply_active_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('maply_active_user', JSON.stringify(user));
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const root = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
    const res = await fetch(`${root}/health`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
  } catch {
    return `HTTP ${res.status}`;
  }
}

// ==========================================
// AUTHENTICATION CLIENT (REAL EMAIL/PASSWORD)
// ==========================================

export async function registerUser(payload: {
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'teacher';
  identifier?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await readError(res));
  const data: AuthResponse = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await readError(res));
  const data: AuthResponse = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    if (res.ok) {
      const u = await res.json();
      setStoredUser(u);
      return u;
    }
  } catch (err) {
    console.warn('Failed to fetch user with token:', err);
  }
  return null;
}

// ==========================================
// ASSESSMENT & MASTER MAPS CLIENT
// ==========================================

export async function fetchAssessmentsList(): Promise<AssessmentConfig[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/assessments`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, fallback assessments list:', err);
  }
  return [INITIAL_ASSESSMENT];
}

export async function fetchAssessment(asmId: string = 'asm-1'): Promise<AssessmentConfig> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/assessments/${asmId}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using initial assessment config:', err);
  }
  return INITIAL_ASSESSMENT;
}

export async function updateAssessment(config: AssessmentConfig): Promise<AssessmentConfig> {
  const res = await fetch(`${getApiBaseUrl()}/assessments/${config.id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function verifyExamToken(token: string): Promise<{ valid: boolean; assessment?: AssessmentConfig; message: string }> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/assessments/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim().toUpperCase() })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend token verification unavailable:', err);
  }
  return {
    valid: false,
    message: 'Gagal memverifikasi token ke server.'
  };
}

export async function saveMasterMap(map: MasterConceptMap): Promise<MasterConceptMap> {
  const res = await fetch(`${getApiBaseUrl()}/maps/master`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(map)
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchMasterMapsList(): Promise<MasterConceptMap[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/maps/master`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, fallback master maps list:', err);
  }
  return [INITIAL_MASTER_MAP];
}

export async function fetchMasterMap(mapId: string = 'map-cpu-1'): Promise<MasterConceptMap> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/maps/master/${mapId}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using initial data:', err);
  }
  return INITIAL_MASTER_MAP;
}

export async function fetchAssessmentKit(asmId: string = 'asm-1'): Promise<ConceptKit> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/assessments/${asmId}/kit`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, generating client fallback kit:', err);
  }
  return {
    assessment_id: asmId,
    concepts: [...INITIAL_MASTER_MAP.nodes].sort(() => Math.random() - 0.5),
    available_relationships: ['contains', 'uses', 'stores temporary result in', 'controls', 'transfers data with']
  };
}

export async function submitStudentMap(
  asmId: string,
  studentName: string,
  nodes: ConceptNode[],
  edges: ConceptEdge[],
  studentId?: string
): Promise<EvaluationResult> {
  const activeUser = getStoredUser();
  const effectiveId = studentId || activeUser?.id || ('mhs-' + Math.floor(Math.random() * 900 + 100));
  const effectiveName = studentName || activeUser?.full_name || 'Mahasiswa';

  const res = await fetch(`${getApiBaseUrl()}/assessments/${asmId}/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      student_id: effectiveId,
      student_name: effectiveName,
      assessment_id: asmId,
      submitted_nodes: nodes,
      submitted_edges: edges
    })
  });
  if (!res.ok) throw new Error(await readError(res));
  return await res.json();
}

export async function fetchMySubmissions(studentId?: string): Promise<EvaluationResult[]> {
  try {
    const activeUser = getStoredUser();
    const id = studentId || activeUser?.id;
    const url = id ? `${getApiBaseUrl()}/students/my-submissions?student_id=${encodeURIComponent(id)}` : `${getApiBaseUrl()}/students/my-submissions`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Failed to fetch personal submissions:', err);
  }
  return [];
}

export async function fetchClassAnalytics(asmId: string = 'asm-1'): Promise<ClassKnowledgeGapSummary> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/assessments/${asmId}/analytics`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Backend analytics unavailable:', err);
  }

  // Clean empty state when no data exists (NO FAKE DATA)
  return {
    assessment_id: asmId,
    total_students: 0,
    average_score: 0.0,
    score_distribution: {
      '<60': 0,
      '60-69': 0,
      '70-79': 0,
      '80-89': 0,
      '90-100': 0
    },
    problematic_relationships: [],
    well_understood_relationships: []
  };
}

export async function generateAIDraft(topic: string, materialText: string): Promise<AIDraftResponse> {
  const res = await fetch(`${getApiBaseUrl()}/ai/draft`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ topic, material_text: materialText, target_node_count: 6 })
  });
  if (!res.ok) throw new Error(await readError(res));
  return await res.json();
}
