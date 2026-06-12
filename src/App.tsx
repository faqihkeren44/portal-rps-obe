/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  User, 
  AcademicPeriod, 
  BloomVerb, 
  LearningMethod, 
  AssessmentType, 
  AuditLog, 
  CPL, 
  Course, 
  LecturerAssignment, 
  RPS, 
  RPSVersion, 
  QuestionItem, 
  TaskPlan, 
  ExamPlan, 
  UserRole 
} from "./types";

import Sidebar from "./components/Sidebar";
import AdminPanel from "./components/AdminPanel";
import KaprodiPanel from "./components/KaprodiPanel";
import DosenPanel from "./components/DosenPanel";
import DocPanel from "./components/DocPanel";

import { 
  GraduationCap, 
  KeyRound, 
  ArrowRight, 
  Users, 
  BrainCircuit, 
  FolderSync
} from "lucide-react";

export default function App() {
  // Authentication Context State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | "DOCS">("DOCS");

  // Database States (loaded from Server REST API)
  const [users, setUsers] = useState<User[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [bloomVerbs, setBloomVerbs] = useState<BloomVerb[]>([]);
  const [methods, setMethods] = useState<LearningMethod[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<LecturerAssignment[]>([]);
  const [rpsList, setRpsList] = useState<RPS[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [tasks, setTasks] = useState<TaskPlan[]>([]);
  const [exams, setExams] = useState<ExamPlan[]>([]);
  const [versions, setVersions] = useState<RPSVersion[]>([]);

  // App initialization loaders
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Auto load all data from Node/Express backend on mount
  const loadAllData = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all([
        fetch("/api/master/users").then(res => res.json()),
        fetch("/api/master/periods").then(res => res.json()),
        fetch("/api/master/bloom").then(res => res.json()),
        fetch("/api/master/methods").then(res => res.json()),
        fetch("/api/master/assessments").then(res => res.json()),
        fetch("/api/audit-logs").then(res => res.json()),
        fetch("/api/kaprodi/cpl").then(res => res.json()),
        fetch("/api/kaprodi/courses").then(res => res.json()),
        fetch("/api/kaprodi/assignments").then(res => res.json()),
        fetch("/api/dosen/rps").then(res => res.json()),
        fetch("/api/dosen/questions").then(res => res.json()),
        fetch("/api/dosen/tasks").then(res => res.json()),
        fetch("/api/dosen/exams").then(res => res.json()),
        fetch("/api/dosen/versions").then(res => res.json())
      ]);

      setUsers(responses[0]);
      setPeriods(responses[1]);
      setBloomVerbs(responses[2]);
      setMethods(responses[3]);
      setAssessmentTypes(responses[4]);
      setAuditLogs(responses[5]);
      setCplList(responses[6]);
      setCourses(responses[7]);
      setAssignments(responses[8]);
      setRpsList(responses[9]);
      setQuestions(responses[10]);
      setTasks(responses[11]);
      setExams(responses[12]);
      setVersions(responses[13]);
      
      setApiError("");
    } catch (err: any) {
      console.error("Gagal melakukan sinkronisasi dengan endpoint backend:", err);
      setApiError("Gagal berasosiasi dengan server Express. Harap pastikan dev server berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync state helpers on role shift
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN) setCurrentRole(UserRole.ADMIN);
      else if (currentUser.role === UserRole.KAPRODI) setCurrentRole(UserRole.KAPRODI);
      else if (currentUser.role === UserRole.DOSEN) setCurrentRole(UserRole.DOSEN);
    }
  }, [currentUser]);

  // LOGIN FLOW HELPERS
  const handleQuickLogin = (role: UserRole) => {
    let matchedUser = users.find(u => u.role === role && u.isActive);
    if (!matchedUser) {
      // Create lazy fallback if users not populated
      matchedUser = {
        id: role.toLowerCase() + "-1",
        name: "Simulasi " + role,
        username: role.toLowerCase(),
        email: role.toLowerCase() + "@universitas.ac.id",
        role: role,
        isActive: true
      };
    }
    setCurrentUser(matchedUser);
  };

  // POST CALL REUSABLE PIPELINE
  const executePostAction = async (endpoint: string, body: any, successMessage?: string) => {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, actorName: currentUser?.name || "Sistem" })
      });
      if (!res.ok) {
        const errObj = await res.json();
        throw new Error(errObj.error || "Gagal melakukan aksi.");
      }
      // Re-load to stay perfectly in sync
      await loadAllData();
      if (successMessage) alert(successMessage);
    } catch (err: any) {
      alert("Operasi Gagal: " + err.message);
      throw err;
    }
  };

  // MASTER USERS
  const handleAddUser = async (userPayload: Partial<User>) => {
    await executePostAction("/api/master/users", userPayload);
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    await executePostAction(`/api/master/users/${id}`, updates);
  };

  const handleResetPassword = async (id: string) => {
    await executePostAction(`/api/master/users/${id}/reset-password`, {});
  };

  // PERIODS
  const handleAddPeriod = async (payload: Partial<AcademicPeriod>) => {
    await executePostAction("/api/master/periods", payload);
  };

  const handleUpdatePeriod = async (id: string, updates: Partial<AcademicPeriod>) => {
    await executePostAction(`/api/master/periods/${id}`, updates);
  };

  // METHODS
  const handleAddMethod = async (payload: Partial<LearningMethod>) => {
    await executePostAction("/api/master/methods", payload);
  };

  const handleUpdateMethod = async (id: string, updates: Partial<LearningMethod>) => {
    await executePostAction(`/api/master/methods/${id}`, updates);
  };

  // ASESMEN
  const handleAddAssessmentType = async (payload: Partial<AssessmentType>) => {
    await executePostAction("/api/master/assessments", payload);
  };

  const handleUpdateAssessmentType = async (id: string, updates: Partial<AssessmentType>) => {
    await executePostAction(`/api/master/assessments/${id}`, updates);
  };

  // CPL
  const handleAddCPL = async (payload: Partial<CPL>) => {
    await executePostAction("/api/kaprodi/cpl", payload);
  };

  const handleUpdateCPL = async (id: string, updates: Partial<CPL>) => {
    await executePostAction(`/api/kaprodi/cpl/${id}`, updates);
  };

  const handleDeleteCPL = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus CPL ini?")) {
      await executePostAction(`/api/kaprodi/cpl/${id}/delete`, {});
    }
  };

  // COURSES
  const handleAddCourse = async (payload: Partial<Course>) => {
    await executePostAction("/api/kaprodi/courses", payload);
  };

  const handleUpdateCourse = async (id: string, updates: Partial<Course>) => {
    await executePostAction(`/api/kaprodi/courses/${id}`, updates);
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm("Hapus mata kuliah ini dari data kurikulum prodi?")) {
      await executePostAction(`/api/kaprodi/courses/${id}/delete`, {});
    }
  };

  // ASSIGNMENTS
  const handleAddAssignment = async (payload: Partial<LecturerAssignment>) => {
    await executePostAction("/api/kaprodi/assignments", payload);
  };

  const handleDeleteAssignment = async (id: string) => {
    await executePostAction(`/api/kaprodi/assignments/${id}/delete`, {});
  };

  // VALIDATION BY KAPRODI
  const handleValidateRPS = async (id: string, status: RPS["status"], notes: string) => {
    await executePostAction(`/api/kaprodi/rps/${id}/validate`, { status, notes }, `RPS berhasil diperbarui menjadi ${status}!`);
  };

  // DOSEN ACTIONS
  const handleAddRPS = async (payload: Partial<RPS>) => {
    await executePostAction("/api/dosen/rps", payload);
    // Find newly saved
    const updatedRes = await fetch("/api/dosen/rps").then(res => res.json());
    return updatedRes.find((r: RPS) => r.courseId === payload.courseId);
  };

  const handleSaveRPS = async (payload: RPS) => {
    await executePostAction(`/api/dosen/rps/${payload.id}`, payload);
    // Find updated
    const updatedRes = await fetch("/api/dosen/rps").then(res => res.json());
    return updatedRes.find((r: RPS) => r.id === payload.id);
  };

  // GEMINI AI INTEGRATION CONNECTORS
  const handleGenerateRPSViaAI = async (payload: any) => {
    const res = await fetch("/api/gemini/generate-rps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal AI");
    }
    return res.json();
  };

  const handleRegenerateRpsSectionViaAI = async (payload: any) => {
    const res = await fetch("/api/gemini/regenerate-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal AI regenerasi");
    }
    return res.json();
  };

  const handleGenerateQuestionsViaAI = async (payload: any) => {
    const res = await fetch("/api/gemini/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal AI Bank Soal");
    }
    const data = await res.json();
    await loadAllData();
    return data;
  };

  const handleGenerateTaskViaAI = async (payload: any) => {
    const res = await fetch("/api/gemini/generate-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal AI Rencana Tugas");
    }
    const data = await res.json();
    await loadAllData();
    return data;
  };

  const handleGenerateExamViaAI = async (payload: any) => {
    const res = await fetch("/api/gemini/generate-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal AI Kisi Ujian");
    }
    const data = await res.json();
    await loadAllData();
    return data;
  };

  // LOGOUT
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole("DOCS");
  };

  // RENDER APP
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-slate-950 p-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-sm text-center space-y-4 shadow-sm">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full inline-block animate-bounce">
            <GraduationCap className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Portal Smart RPS-OBE</h2>
            <p className="text-xs text-slate-500 mt-1">Menyelaraskan data penjaminan akademik dengan asisten cerdas Gemini AI...</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full animate-progress animate-pulse" style={{ width: "60%" }}></div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2">
          
          {/* Decorative left art panel */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col justify-between text-slate-300 relative border-r border-slate-100">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase">
                <BrainCircuit className="h-4 w-4 animate-pulse" />
                <span>Next-Gen Academic Engine</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none font-sans">
                Portal Kurikulum & RPS berbasis OBE
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart integrated platform untuk penyusunan Rencana Pembelajaran Semester (RPS) Outcome-Based Education (OBE) cerdas, tersetifikasi instan menggunakan Google Gemini AI.
              </p>
            </div>

            <div className="space-y-2 mt-8 md:mt-0 text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <FolderSync className="h-4 w-4 text-emerald-500" />
                <span>Express Server REST Pipeline Sync</span>
              </div>
              <div>Standardisasi Kurikulum Nasional DIKTI</div>
            </div>
          </div>

          {/* Login Workspaces selection */}
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-6 bg-white">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Log Masuk Akun Simulasi</h2>
              <p className="text-xs text-slate-500">Pilih salah satu aktor prodi di bawah ini untuk menguji hak akses platform:</p>
            </div>

            <div className="space-y-3">
              <button
                id="login-admin"
                onClick={() => handleQuickLogin(UserRole.ADMIN)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg border border-indigo-100">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-indigo-600 uppercase leading-none mb-1">USER 1. ADMINISTRATOR</h4>
                    <span className="text-xs font-bold text-slate-800">Budi Santoso, M.T.</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                id="login-kaprodi"
                onClick={() => handleQuickLogin(UserRole.KAPRODI)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-600 uppercase leading-none mb-1">USER 2. KEPALA PRODI</h4>
                    <span className="text-xs font-bold text-slate-800">Dr. Ratna Sari</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                id="login-dosen"
                onClick={() => handleQuickLogin(UserRole.DOSEN)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg border border-amber-100">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-amber-600 uppercase leading-none mb-1">USER 3. DOSEN PENGAMPU</h4>
                    <span className="text-xs font-bold text-slate-800">Setyo Handoyo, Ph.D.</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setCurrentUser({ id: "guest", name: "Guest Reviewer", username: "guest", email: "guest@guest.com", role: UserRole.DOSEN, isActive: true })}
                className="text-[11px] font-mono text-slate-500 hover:text-indigo-600 hover:underline"
              >
                Lanjutkan Tanpa Sandi &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Role Switcher */}
      <Sidebar
        currentRole={currentRole}
        currentUserName={currentUser.name}
        onRoleChange={(role) => setCurrentRole(role)}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc] relative">
        {apiError && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 font-mono text-xs rounded-lg mb-6">
            <strong>Gagal Koneksi: </strong> {apiError}
          </div>
        )}

        {/* View Router */}
        {currentRole === UserRole.ADMIN && (
          <AdminPanel
            users={users}
            periods={periods}
            bloom={bloomVerbs}
            methods={methods}
            assessmentTypes={assessmentTypes}
            auditLogs={auditLogs}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onResetPassword={handleResetPassword}
            onAddPeriod={handleAddPeriod}
            onUpdatePeriod={handleUpdatePeriod}
            onAddMethod={handleAddMethod}
            onUpdateMethod={handleUpdateMethod}
            onAddAssessmentType={handleAddAssessmentType}
            onUpdateAssessmentType={handleUpdateAssessmentType}
          />
        )}

        {currentRole === UserRole.KAPRODI && (
          <KaprodiPanel
            cpl={cplList}
            courses={courses}
            users={users}
            periods={periods}
            assignments={assignments}
            rpsList={rpsList}
            onAddCPL={handleAddCPL}
            onUpdateCPL={handleUpdateCPL}
            onDeleteCPL={handleDeleteCPL}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onAddAssignment={handleAddAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onValidateRPS={handleValidateRPS}
          />
        )}

        {currentRole === UserRole.DOSEN && (
          <DosenPanel
            courses={courses}
            cplList={cplList}
            rpsList={rpsList}
            questions={questions}
            tasks={tasks}
            exams={exams}
            versions={versions}
            currentUserName={currentUser.name}
            onSaveRPS={handleSaveRPS}
            onAddRPS={handleAddRPS}
            onGenerateRPS={handleGenerateRPSViaAI}
            onRegenerateSection={handleRegenerateRpsSectionViaAI}
            onGenerateQuestions={handleGenerateQuestionsViaAI}
            onGenerateTask={handleGenerateTaskViaAI}
            onGenerateExam={handleGenerateExamViaAI}
          />
        )}

        {currentRole === "DOCS" && <DocPanel />}
      </main>
    </div>
  );
}
