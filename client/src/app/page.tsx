'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from '../components/Navbar';
import { OnboardingView } from '../components/OnboardingView';
import { StudentView } from '../components/StudentView';
import { StudentDashboardView } from '../components/StudentDashboardView';
import { StudentAssessmentsView } from '../components/StudentAssessmentsView';
import { StudentEvaluationView } from '../components/StudentEvaluationView';
import { StudentPersonalResultsView } from '../components/StudentPersonalResultsView';
import { TeacherView } from '../components/TeacherView';
import { TeacherDashboardView } from '../components/TeacherDashboardView';
import { TeacherCoursesView } from '../components/TeacherCoursesView';
import { TeacherAssessmentsView } from '../components/TeacherAssessmentsView';
import { AnalyticsView } from '../components/AnalyticsView';
import { EvaluationModal } from '../components/EvaluationModal';
import { AuthModal } from '../components/AuthModal';
import { CreateAssessmentWizard } from '../components/CreateAssessmentWizard';
import { WorkspacePickerView } from '../components/WorkspacePickerView';
import {
  checkBackendHealth,
  fetchAssessmentsList,
  verifyExamToken,
  fetchMasterMap,
  fetchAssessment,
  fetchAssessmentKit,
  fetchClassAnalytics,
  fetchCurrentUser,
  fetchMySubmissions,
  getStoredUser,
  clearStoredToken,
  saveMasterMap,
  updateAssessment,
  INITIAL_MASTER_MAP,
  INITIAL_ASSESSMENT
} from '../lib/api';
import {
  MasterConceptMap,
  AssessmentConfig,
  ConceptKit,
  EvaluationResult,
  ClassKnowledgeGapSummary,
  User,
  StudentSubmission
} from '../types/maply';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mySubmissions, setMySubmissions] = useState<EvaluationResult[]>([]);
  const [currentTab, setCurrentTab] = useState<ActiveTab>('onboarding');
  const [masterMap, setMasterMap] = useState<MasterConceptMap>(INITIAL_MASTER_MAP);
  const [assessmentConfig, setAssessmentConfig] = useState<AssessmentConfig>(INITIAL_ASSESSMENT);
  const [assessments, setAssessments] = useState<AssessmentConfig[]>([]);
  const [workspaceAsmId, setWorkspaceAsmId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<Record<string, number>>({});
  const [kit, setKit] = useState<ConceptKit | null>(null);
  const [kitVersion, setKitVersion] = useState(0);
  const [mapVersion, setMapVersion] = useState(0);
  const [analytics, setAnalytics] = useState<ClassKnowledgeGapSummary | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [studentSubView, setStudentSubView] = useState<'dashboard' | 'assessments' | 'workspace' | 'evaluation'>('dashboard');
  const [teacherSubView, setTeacherSubView] = useState<'dashboard' | 'courses' | 'assessments' | 'map' | 'premiumMap'>('dashboard');
  const [openAiDraftOnEditor, setOpenAiDraftOnEditor] = useState(false);
  const [inspectedAssessmentId, setInspectedAssessmentId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'student' | 'teacher'>('student');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeExamToken, setActiveExamToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Exam Countdown Timer (synchronized across Navbar & Student Workspace)
  const [examTimeRemaining, setExamTimeRemaining] = useState<number>(2700);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Restore active user session on mount
  useEffect(() => {
    try {
      const stored = getStoredUser();
      if (stored) {
        setCurrentUser(stored);
        if (stored.role === 'student') {
          fetchMySubmissions(stored.id).then(setMySubmissions).catch(() => {});
        }
      }
      const savedSession = localStorage.getItem('maply_active_session_v1');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.currentTab) setCurrentTab(parsed.currentTab);
        if (parsed.studentSubView) setStudentSubView(parsed.studentSubView);
        if (parsed.teacherSubView) setTeacherSubView(parsed.teacherSubView);
        if (parsed.activeExamToken) setActiveExamToken(parsed.activeExamToken);
        if (parsed.inspectedAssessmentId) setInspectedAssessmentId(parsed.inspectedAssessmentId);
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    }
  }, []);

  // Persist session changes to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(
          'maply_active_session_v1',
          JSON.stringify({
            currentTab,
            studentSubView,
            teacherSubView,
            activeExamToken,
            inspectedAssessmentId
          })
        );
      } catch (e) {
        console.error('Failed to persist session:', e);
      }
    }
  }, [currentTab, studentSubView, teacherSubView, activeExamToken, inspectedAssessmentId, isLoading]);

  // Live Countdown Interval for Active Exam Workspace
  useEffect(() => {
    if (currentTab === 'student' && studentSubView === 'workspace') {
      const interval = setInterval(() => {
        setExamTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            showToast('⚠️ Waktu pengerjaan asesmen telah habis!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentTab, studentSubView]);

  const handleOpenAuth = (role: 'student' | 'teacher' = 'student') => {
    setAuthRole(role);
    setIsAuthModalOpen(true);
  };

  const startedKey = (userId?: string) => `maply_started_${userId || 'anon'}`;

  const loadStartedMarkers = (userId?: string): Record<string, number> => {
    try {
      return JSON.parse(localStorage.getItem(startedKey(userId)) || '{}');
    } catch {
      return {};
    }
  };

  const saveStartedMarkers = (userId: string | undefined, map: Record<string, number>) => {
    setStartedAt(map);
    try {
      localStorage.setItem(startedKey(userId), JSON.stringify(map));
    } catch {}
  };

  /** Opens the canvas for a specific assessment (new start or resume). */
  const openWorkspace = async (asmId: string) => {
    if (mySubmissions.some((s) => s.assessment_id === asmId)) {
      showToast('Asesmen ini sudah Anda kumpulkan dan tidak bisa dikerjakan ulang.');
      return;
    }
    const target = assessments.find((a) => a.id === asmId) || (assessmentConfig.id === asmId ? assessmentConfig : null);
    if (!target) {
      showToast('Asesmen tidak ditemukan.');
      return;
    }
    setAssessmentConfig(target);
    await refreshKitAndAnalytics(target.id);

    const markers = loadStartedMarkers(currentUser?.id);
    const durationSec = (target.duration_minutes || target.time_limit_minutes || 30) * 60;
    if (markers[target.id]) {
      const elapsed = Math.floor((Date.now() - markers[target.id]) / 1000);
      setExamTimeRemaining(Math.max(0, durationSec - elapsed));
    } else {
      markers[target.id] = Date.now();
      saveStartedMarkers(currentUser?.id, markers);
      setExamTimeRemaining(durationSec);
    }

    setWorkspaceAsmId(target.id);
    setCurrentTab('student');
    setStudentSubView('workspace');
  };

  const handleEnterExamWithToken = async (token: string) => {
    const res = await verifyExamToken(token);
    if (!res.valid || !res.assessment) {
      showToast(`⚠️ ${res.message}`);
      return;
    }
    setActiveExamToken(token);
    setAssessments((prev) => (prev.some((a) => a.id === res.assessment!.id) ? prev : [...prev, res.assessment!]));
    if (mySubmissions.some((s) => s.assessment_id === res.assessment!.id)) {
      showToast('Asesmen ini sudah Anda kumpulkan.');
      return;
    }
    setAssessmentConfig(res.assessment);
    await refreshKitAndAnalytics(res.assessment.id);
    const markers = loadStartedMarkers(currentUser?.id);
    const durationSec = (res.assessment.duration_minutes || res.assessment.time_limit_minutes || 30) * 60;
    if (!markers[res.assessment.id]) {
      markers[res.assessment.id] = Date.now();
      saveStartedMarkers(currentUser?.id, markers);
      setExamTimeRemaining(durationSec);
    } else {
      const elapsed = Math.floor((Date.now() - markers[res.assessment.id]) / 1000);
      setExamTimeRemaining(Math.max(0, durationSec - elapsed));
    }
    setWorkspaceAsmId(res.assessment.id);
    setCurrentTab('student');
    setStudentSubView('workspace');
    showToast(`✓ Memulai sesi pengerjaan Kit Map dengan Token ${token}!`);
  };

  /** Workspace tab click: go straight in if exactly one pending assessment, else show the picker. */
  const handleStudentSubViewChange = (sub: 'dashboard' | 'assessments' | 'workspace' | 'evaluation') => {
    if (sub === 'evaluation') setInspectedAssessmentId(null);
    if (sub === 'workspace') {
      const submittedIds = new Set(mySubmissions.map((s) => s.assessment_id));
      const pending = assessments.filter((a) => !submittedIds.has(a.id));
      if (pending.length === 1 && assessments.length === 1) {
        void openWorkspace(pending[0].id);
        return;
      }
      setWorkspaceAsmId(null);
    }
    setStudentSubView(sub);
  };

  const handleLoginSuccess = (role: 'student' | 'teacher', userName: string, user?: User) => {
    const active = user || getStoredUser();
    if (active) {
      setCurrentUser(active);
      if (active.role === 'student') {
        fetchMySubmissions(active.id).then(setMySubmissions).catch(() => {});
        setStartedAt(loadStartedMarkers(active.id));
        fetchAssessmentsList().then(setAssessments).catch(() => {});
      }
    }
    setCurrentTab(role === 'student' ? 'student' : 'teacher');
    if (role === 'student') {
      setStudentSubView('dashboard');
    } else {
      setTeacherSubView('dashboard');
    }
    showToast(`✓ Berhasil masuk ke Portal ${role === 'student' ? 'Mahasiswa' : 'Dosen'} sebagai ${active?.full_name || userName}`);
  };

  const handleAssessmentPublished = (token: string, newConfig: AssessmentConfig) => {
    setActiveExamToken(token);
    setAssessmentConfig(newConfig);
    showToast(`🚀 Asesmen berhasil diterbitkan! Token Mahasiswa: ${token}`);
  };

  const handleLogout = () => {
    clearStoredToken();
    setCurrentUser(null);
    setMySubmissions([]);
    setEvaluationResult(null);
    setCurrentTab('onboarding');
    setStudentSubView('dashboard');
    setTeacherSubView('dashboard');
    setOpenAiDraftOnEditor(false);
    setActiveExamToken(null);
    setInspectedAssessmentId(null);
    setWorkspaceAsmId(null);
    setStartedAt({});
    setExamTimeRemaining(2700);
    try {
      localStorage.removeItem('maply_active_session_v1');
    } catch {}
    showToast('✓ Anda telah berhasil keluar dari akun');
  };

  const refreshKitAndAnalytics = useCallback(async (asmId: string) => {
    const [kitData, analyticsData] = await Promise.all([
      fetchAssessmentKit(asmId),
      fetchClassAnalytics(asmId)
    ]);
    setKit(kitData);
    setKitVersion((v) => v + 1);
    setAnalytics(analyticsData);
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const online = await checkBackendHealth();
        setBackendOnline(online);

        const stored = getStoredUser();
        if (stored) {
          setCurrentUser(stored);
          fetchCurrentUser().then((fresh) => {
            if (fresh) setCurrentUser(fresh);
          }).catch(() => {});
          if (stored.role === 'student') {
            fetchMySubmissions(stored.id).then(setMySubmissions).catch(() => {});
          }
        }

        const asm = await fetchAssessment(INITIAL_ASSESSMENT.id);
        const mapData = await fetchMasterMap(asm.master_map_id);
        setAssessmentConfig(asm);
        setMasterMap(mapData);
        if (online) {
          fetchAssessmentsList().then(setAssessments).catch(() => {});
        }
        if (stored) {
          setStartedAt(loadStartedMarkers(stored.id));
        }
        await refreshKitAndAnalytics(asm.id);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, [refreshKitAndAnalytics]);

  /** Persists the master map to the backend so student grading uses it. Throws on failure. */
  const handleSaveMasterMap = async (newMap: MasterConceptMap) => {
    if (backendOnline) {
      const saved = await saveMasterMap(newMap);
      setMasterMap(saved);
      setMapVersion((v) => v + 1);
      await refreshKitAndAnalytics(assessmentConfig.id);
      return;
    }

    // Offline demo mode: keep everything client-side
    setMasterMap(newMap);
    setMapVersion((v) => v + 1);
    setKit({
      assessment_id: assessmentConfig.id,
      concepts: [...newMap.nodes].sort(() => Math.random() - 0.5),
      available_relationships: Array.from(new Set(newMap.edges.map((e) => e.label)))
    });
    setKitVersion((v) => v + 1);
  };

  const handleSaveAssessment = async (config: AssessmentConfig) => {
    if (backendOnline) {
      const saved = await updateAssessment(config);
      setAssessmentConfig(saved);
      return;
    }
    setAssessmentConfig(config);
  };

  const handleEvaluationComplete = async (res: EvaluationResult) => {
    const markers = loadStartedMarkers(currentUser?.id);
    delete markers[assessmentConfig.id];
    saveStartedMarkers(currentUser?.id, markers);
    setWorkspaceAsmId(null);
    setEvaluationResult(res);
    setInspectedAssessmentId(assessmentConfig.id);
    setStudentSubView('evaluation');
    if (backendOnline) {
      const [analyticsData, freshSubs] = await Promise.all([
        fetchClassAnalytics(assessmentConfig.id),
        currentUser ? fetchMySubmissions(currentUser.id) : Promise.resolve([])
      ]);
      setAnalytics(analyticsData);
      if (freshSubs && freshSubs.length > 0) {
        setMySubmissions(freshSubs);
      }
    }
    showToast(`✓ Evaluasi graf selesai: Skor ${res.total_score}/100`);
  };

  if (isLoading || !kit || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#1B1B1E]">
          <div className="w-8 h-8 border-4 border-[#1B1B1E] border-t-[#0038D1] rounded-full animate-spin"></div>
          <span className="text-xs font-black uppercase text-[#1B1B1E] tracking-wider">
            Memuat Maply Cognitive Lab...
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F2] font-sans text-[#1B1B1E]">
      {/* Instructor views render their own navigation bar. */}
      {currentTab !== 'teacher' && currentTab !== 'analytics' && (
        <Navbar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab === 'teacher') {
              setTeacherSubView('map');
              setOpenAiDraftOnEditor(false);
            }
          }}
          studentSubView={studentSubView}
          onStudentSubViewChange={handleStudentSubViewChange}
          currentUser={currentUser}
          studentName={currentUser?.full_name}
          studentNim={currentUser?.identifier}
          onLogout={handleLogout}
          backendOnline={backendOnline}
          onOpenAuthModal={handleOpenAuth}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#1B1B1E] text-white border-2 border-[#1B1B1E] shadow-[4px_4px_0px_#0038D1] text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      <div className="flex-1">
        {currentTab === 'onboarding' && (
          <OnboardingView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAuthModal={handleOpenAuth}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}

        {currentTab === 'student' && (
          <>
            {studentSubView === 'dashboard' && (
              <StudentDashboardView
                assessmentConfig={assessmentConfig}
                kit={kit}
                studentName={currentUser?.full_name}
                studentNim={currentUser?.identifier}
                submissions={mySubmissions}
                onStartWorkspace={() => void openWorkspace(assessmentConfig.id)}
                onEnterToken={(tok) => handleEnterExamWithToken(tok)}
                onViewResults={() => {
                  if (mySubmissions.length > 0) {
                    const latest = mySubmissions[0];
                    setEvaluationResult(latest);
                    setInspectedAssessmentId(latest.assessment_id);
                  } else {
                    setInspectedAssessmentId(null);
                  }
                  setStudentSubView('evaluation');
                }}
              />
            )}

            {studentSubView === 'assessments' && (
              <StudentAssessmentsView
                assessments={assessments.length > 0 ? assessments : [assessmentConfig]}
                assessmentConfig={assessmentConfig}
                kit={kit}
                submissions={mySubmissions}
                onStartWorkspace={(asmId) => void openWorkspace(asmId)}
                onViewResults={(asmId) => {
                  const found = mySubmissions.find((s) => s.assessment_id === asmId);
                  if (found) {
                    setEvaluationResult(found);
                  }
                  setInspectedAssessmentId(asmId);
                  setStudentSubView('evaluation');
                }}
              />
            )}

            {studentSubView === 'workspace' && !workspaceAsmId && (
              <WorkspacePickerView
                assessments={assessments.length > 0 ? assessments : [assessmentConfig]}
                submissions={mySubmissions}
                startedAt={startedAt}
                onOpen={(id) => void openWorkspace(id)}
                onViewResult={(id) => {
                  const found = mySubmissions.find((s) => s.assessment_id === id);
                  if (found) setEvaluationResult(found);
                  setInspectedAssessmentId(id);
                  setStudentSubView('evaluation');
                }}
              />
            )}

            {studentSubView === 'workspace' && workspaceAsmId && (
              <StudentView
                key={`kit-${kitVersion}`}
                kit={kit}
                assessmentConfig={assessmentConfig}
                timeRemainingSeconds={examTimeRemaining}
                studentName={currentUser?.full_name}
                studentNim={currentUser?.identifier}
                onEvaluationComplete={handleEvaluationComplete}
                onBackToDashboard={() => setStudentSubView('dashboard')}
              />
            )}

            {studentSubView === 'evaluation' && (
              inspectedAssessmentId && evaluationResult ? (
                <StudentEvaluationView
                  result={evaluationResult}
                  assessmentConfig={assessmentConfig}
                  onBackToDashboard={() => setInspectedAssessmentId(null)}
                  onRetakeWorkspace={() => {
                    setInspectedAssessmentId(null);
                    setWorkspaceAsmId(null);
                    setStudentSubView('workspace');
                  }}
                />
              ) : (
                <StudentPersonalResultsView
                  studentName={currentUser?.full_name}
                  studentNim={currentUser?.identifier}
                  submissions={mySubmissions}
                  onBackToDashboard={() => setStudentSubView('dashboard')}
                  onInspectAssessment={(asmId) => {
                    const found = mySubmissions.find((s) => s.assessment_id === asmId);
                    if (found) {
                      setEvaluationResult(found);
                    }
                    setInspectedAssessmentId(asmId);
                  }}
                />
              )
            )}
          </>
        )}

        {currentTab === 'teacher' && teacherSubView === 'dashboard' && analytics && (
          <TeacherDashboardView
            masterMap={masterMap}
            assessmentConfig={assessmentConfig}
            assessments={assessments.length > 0 ? assessments : [assessmentConfig]}
            analytics={analytics}
            currentUser={currentUser}
            onOpenMap={() => {
              setOpenAiDraftOnEditor(false);
              setTeacherSubView('map');
            }}
            onOpenCourses={() => setTeacherSubView('courses')}
            onOpenAssessments={() => setTeacherSubView('assessments')}
            onOpenWizard={() => setIsWizardOpen(true)}
            onOpenAnalytics={() => setCurrentTab('analytics')}
            onOpenAiDraft={() => {
              setOpenAiDraftOnEditor(true);
              setTeacherSubView('premiumMap');
            }}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'teacher' && teacherSubView === 'courses' && (
          <TeacherCoursesView
            assessments={assessments.length > 0 ? assessments : [assessmentConfig]}
            masterMap={masterMap}
            analytics={analytics || undefined}
            currentUser={currentUser}
            onNavigate={(item) => {
              if (item === 'Dashboard') {
                setTeacherSubView('dashboard');
              } else if (item === 'Courses') {
                setTeacherSubView('courses');
              } else if (item === 'Maps') {
                setOpenAiDraftOnEditor(false);
                setTeacherSubView('map');
              } else if (item === 'Assessments') {
                setTeacherSubView('assessments');
              } else {
                setCurrentTab('analytics');
              }
            }}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'teacher' && teacherSubView === 'assessments' && (
          <TeacherAssessmentsView
            assessments={assessments.length > 0 ? assessments : [assessmentConfig]}
            assessmentConfig={assessmentConfig}
            masterMap={masterMap}
            analytics={analytics || undefined}
            currentUser={currentUser}
            onNavigate={(item) => {
              if (item === 'Dashboard') {
                setTeacherSubView('dashboard');
              } else if (item === 'Courses') {
                setTeacherSubView('courses');
              } else if (item === 'Maps') {
                setOpenAiDraftOnEditor(false);
                setTeacherSubView('map');
              } else if (item === 'Assessments') {
                setTeacherSubView('assessments');
              } else {
                setCurrentTab('analytics');
              }
            }}
            onCreateAssessment={() => setIsWizardOpen(true)}
            onSaveAssessment={handleSaveAssessment}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'teacher' && (teacherSubView === 'map' || teacherSubView === 'premiumMap') && (
          <TeacherView
            key={`map-${mapVersion}`}
            masterMap={masterMap}
            assessmentConfig={assessmentConfig}
            backendOnline={backendOnline}
            currentUser={currentUser}
            onSaveMasterMap={handleSaveMasterMap}
            onSaveAssessment={handleSaveAssessment}
            initiallyOpenAIDraft={teacherSubView === 'premiumMap' || openAiDraftOnEditor}
            onInitialAIDraftOpenHandled={() => setOpenAiDraftOnEditor(false)}
            onBackToDashboard={() => {
              setOpenAiDraftOnEditor(false);
              setTeacherSubView('dashboard');
            }}
            onOpenCourses={() => setTeacherSubView('courses')}
            onOpenAssessments={() => setTeacherSubView('assessments')}
            onOpenAnalytics={() => setCurrentTab('analytics')}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            currentUser={currentUser}
            onNavigate={(item) => {
              if (item === 'Dashboard') {
                setCurrentTab('teacher');
                setTeacherSubView('dashboard');
              } else if (item === 'Courses') {
                setCurrentTab('teacher');
                setTeacherSubView('courses');
              } else if (item === 'Maps') {
                setCurrentTab('teacher');
                setOpenAiDraftOnEditor(false);
                setTeacherSubView('map');
              } else if (item === 'Assessments') {
                setCurrentTab('teacher');
                setTeacherSubView('assessments');
              }
            }}
            onLogout={handleLogout}
          />
        )}
      </div>

      {/* Cognitive Evaluation Modal (Only for non-student views or quick triggers) */}
      {currentTab !== 'student' && (
        <EvaluationModal result={evaluationResult} onClose={() => setEvaluationResult(null)} />
      )}

      {/* Multi-Role & Token Access Gateway Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialRole={authRole}
        onClose={() => setIsAuthModalOpen(false)}
        onEnterExamWithToken={handleEnterExamWithToken}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Dosen 4-Step Assessment Creation Wizard */}
      {isWizardOpen && (
        <CreateAssessmentWizard
          masterMap={masterMap}
          onSaveAssessment={handleSaveAssessment}
          onClose={() => setIsWizardOpen(false)}
          onAssessmentPublished={handleAssessmentPublished}
        />
      )}
    </main>
  );
}
