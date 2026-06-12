/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, 
  AcademicPeriod, 
  BloomVerb, 
  LearningMethod, 
  AssessmentType, 
  AuditLog, 
  UserRole 
} from "../types";
import { 
  UserPlus, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Check, 
  ShieldAlert, 
  Plus, 
  Calendar, 
  Brain, 
  Flame, 
  CheckCircle, 
  Search,
  BookMarked
} from "lucide-react";

interface AdminPanelProps {
  users: User[];
  periods: AcademicPeriod[];
  bloom: BloomVerb[];
  methods: LearningMethod[];
  assessmentTypes: AssessmentType[];
  auditLogs: AuditLog[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onResetPassword: (id: string) => void;
  onAddPeriod: (p: Partial<AcademicPeriod>) => void;
  onUpdatePeriod: (id: string, updates: Partial<AcademicPeriod>) => void;
  onAddMethod: (m: Partial<LearningMethod>) => void;
  onUpdateMethod: (id: string, updates: Partial<LearningMethod>) => void;
  onAddAssessmentType: (a: Partial<AssessmentType>) => void;
  onUpdateAssessmentType: (id: string, updates: Partial<AssessmentType>) => void;
}

export default function AdminPanel({
  users,
  periods,
  bloom,
  methods,
  assessmentTypes,
  auditLogs,
  onAddUser,
  onUpdateUser,
  onResetPassword,
  onAddPeriod,
  onUpdatePeriod,
  onAddMethod,
  onUpdateMethod,
  onAddAssessmentType,
  onUpdateAssessmentType
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"users" | "periods" | "bloom" | "methods" | "assessments" | "audit">("users");

  // User Forms
  const [userForm, setUserForm] = useState({ name: "", email: "", role: UserRole.DOSEN });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Period Form
  const [periodForm, setPeriodForm] = useState({ year: "2026/2027", semester: "GANJIL" as "GANJIL" | "GENAP" });
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);

  // Method Form
  const [methodForm, setMethodForm] = useState({ name: "", description: "" });
  const [isAddingMethod, setIsAddingMethod] = useState(false);

  // Assessment Form
  const [assessmentForm, setAssessmentForm] = useState({ name: "", description: "", defaultWeight: 15 });
  const [isAddingAssessment, setIsAddingAssessment] = useState(false);

  // Filter audit logs
  const [auditSearch, setAuditSearch] = useState("");

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;
    onAddUser(userForm);
    setUserForm({ name: "", email: "", role: UserRole.DOSEN });
    setIsAddingUser(false);
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPeriod(periodForm);
    setIsAddingPeriod(false);
  };

  const handleCreateMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodForm.name) return;
    onAddMethod(methodForm);
    setMethodForm({ name: "", description: "" });
    setIsAddingMethod(false);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentForm.name) return;
    onAddAssessmentType(assessmentForm);
    setAssessmentForm({ name: "", description: "", defaultWeight: 15 });
    setIsAddingAssessment(false);
  };

  const filteredLogs = auditLogs.filter(log => 
    log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
          Admin Master Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Simulasi dashboard Administrator untuk mengelola data master kurikulum, user, periode, metode, dan audit aktivitas.
        </p>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">Total Users</span>
            <div className="text-2xl font-bold font-sans text-slate-950 mt-1">{users.length}</div>
          </div>
          <div className="text-sky-500 bg-sky-50 p-2 rounded-lg">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">Periode Aktif</span>
            <div className="text-sm font-bold font-sans text-slate-950 mt-1">
              {periods.find(p => p.isActive) ? `${periods.find(p => p.isActive)?.year} - ${periods.find(p => p.isActive)?.semester}` : "N/A"}
            </div>
          </div>
          <div className="text-amber-500 bg-amber-50 p-2 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">Metode Belajar</span>
            <div className="text-2xl font-bold font-sans text-slate-950 mt-1">{methods.length}</div>
          </div>
          <div className="text-emerald-500 bg-emerald-50 p-2 rounded-lg">
            <Brain className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase">Audit Log</span>
            <div className="text-2xl font-bold font-sans text-slate-950 mt-1">{auditLogs.length}</div>
          </div>
          <div className="text-violet-500 bg-violet-50 p-2 rounded-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "users", label: "Master Users" },
          { id: "periods", label: "Periode Akademik" },
          { id: "bloom", label: "Taksonomi Bloom" },
          { id: "methods", label: "Metode OBE" },
          { id: "assessments", label: "Tipe Asesmen" },
          { id: "audit", label: "Audit Logs System" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all duration-150 border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Management Master User</h3>
              <p className="text-xs text-slate-500">Buat user baru, nonaktifkan, atau reset keamanan kredensial.</p>
            </div>
            <button
              id="btn-add-user"
              onClick={() => setIsAddingUser(!isAddingUser)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>Tambah User Baru</span>
            </button>
          </div>

          {isAddingUser && (
            <form onSubmit={handleCreateUser} className="bg-slate-55 p-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Budi Santoso, M.T."
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Alamat Email Institusi</label>
                <input
                  type="email"
                  required
                  placeholder="budi@unive.ac.id"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Role Otoritas</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value as UserRole})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                >
                  <option value={UserRole.ADMIN}>ADMIN</option>
                  <option value={UserRole.KAPRODI}>KEPALA PRODI</option>
                  <option value={UserRole.DOSEN}>DOSEN PENGAMPU</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs p-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Simpan Akun
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs py-2.5 px-3 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] font-bold tracking-wider uppercase">
                  <th className="p-4">Identitas Dosen / Staff</th>
                  <th className="p-4">Username / Email</th>
                  <th className="p-4">Peran Sistem</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 leading-tight">{user.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {user.id}</div>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <div>{user.username}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        user.role === UserRole.ADMIN 
                          ? "bg-rose-50 text-rose-600 border border-rose-100" 
                          : user.role === UserRole.KAPRODI 
                            ? "bg-amber-50 text-amber-600 border border-amber-100" 
                            : "bg-sky-50 text-sky-600 border border-sky-100"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onUpdateUser(user.id, { isActive: !user.isActive })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                        <span>{user.isActive ? "Aktif" : "Nonaktif"}</span>
                      </button>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        title="Reset Password ke default"
                        onClick={() => onResetPassword(user.id)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-2 py-1 rounded text-xs transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Reset Pass</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content Academic Periods */}
      {activeTab === "periods" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Master Periode Akademik</h3>
              <p className="text-xs text-slate-500">Tambahkan tahun akademik universitas dan tandai yang aktif.</p>
            </div>
            <button
              onClick={() => setIsAddingPeriod(!isAddingPeriod)}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Tambah Periode</span>
            </button>
          </div>

          {isAddingPeriod && (
            <form onSubmit={handleCreatePeriod} className="bg-slate-55 p-5 border-b border-slate-200 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Tahun Akademik</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 2026/2027"
                  value={periodForm.year}
                  onChange={(e) => setPeriodForm({...periodForm, year: e.target.value})}
                  className="text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Semester</label>
                <select
                  value={periodForm.semester}
                  onChange={(e) => setPeriodForm({...periodForm, semester: e.target.value as any})}
                  className="text-sm border border-slate-250 p-2 rounded-lg bg-white"
                >
                  <option value="GANJIL">GANJIL</option>
                  <option value="GENAP">GENAP</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg"
                >
                  Simpan Periode
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingPeriod(false)}
                  className="bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-100">
            {periods.map((period) => (
              <div key={period.id} className="p-4 flex items-center justify-between hover:bg-slate-50/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${period.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Tahun Akademik {period.year}</div>
                    <div className="text-xs text-slate-500">Semester {period.semester}</div>
                  </div>
                </div>
                <div>
                  {period.isActive ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-100">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Periode Aktif</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onUpdatePeriod(period.id, { isActive: true })}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                    >
                      Aktifkan Periode
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content Bloom Taxonomy */}
      {activeTab === "bloom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bloom.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2">
                  <span className="text-sm bg-indigo-50 text-indigo-700 font-mono font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                    {b.level}
                  </span>
                  <h4 className="font-sans font-bold text-slate-900">{b.description}</h4>
                </div>
                <Flame className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <div className="text-xs text-slate-500 mb-2">Kata Kerja Operasional (KKO) Pendukung:</div>
              <div className="flex flex-wrap gap-1.5">
                {b.verba.map((verb, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium">
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content Methods */}
      {activeTab === "methods" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Master Metode Pembelajaran OBE</h3>
              <p className="text-xs text-slate-500">Konfigurasi metode pembelajaran berstandar nasional DIKTI (Case Method, PjBL, etc).</p>
            </div>
            <button
              onClick={() => setIsAddingMethod(!isAddingMethod)}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Tambah Metode</span>
            </button>
          </div>

          {isAddingMethod && (
            <form onSubmit={handleCreateMethod} className="bg-slate-55 p-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Nama Metode Pembelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Case Method"
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({...methodForm, name: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Uraian / Deskripsi Pendek</label>
                <input
                  type="text"
                  required
                  placeholder="Pembelajaran berbasis analisis kasus nyata mandiri"
                  value={methodForm.description}
                  onChange={(e) => setMethodForm({...methodForm, description: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs p-2.5 rounded-lg"
                >
                  Simpan Metode
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingMethod(false)}
                  className="bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-100">
            {methods.map((m) => (
              <div key={m.id} className="p-4 hover:bg-slate-50/20">
                <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                <div className="text-xs text-slate-500 mt-1">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content Assessment Types */}
      {activeTab === "assessments" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Master Model/Tipe Asesmen OBE</h3>
              <p className="text-xs text-slate-500">Asesmen standar CPMK dengan bobot default rencana evaluasi pembelajaran.</p>
            </div>
            <button
              onClick={() => setIsAddingAssessment(!isAddingAssessment)}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Tambah Tipe Asesmen</span>
            </button>
          </div>

          {isAddingAssessment && (
            <form onSubmit={handleCreateAssessment} className="bg-slate-55 p-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Nama Jenis Evaluasi</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Portofolio Tugas"
                  value={assessmentForm.name}
                  onChange={(e) => setAssessmentForm({...assessmentForm, name: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  required
                  placeholder="Evaluasi portofolio projek akhir semester"
                  value={assessmentForm.description}
                  onChange={(e) => setAssessmentForm({...assessmentForm, description: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Bobot Nilai Default (%)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="100"
                  value={assessmentForm.defaultWeight}
                  onChange={(e) => setAssessmentForm({...assessmentForm, defaultWeight: parseInt(e.target.value) || 15})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs p-2.5 rounded-lg"
                >
                  Simpan Tipe
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAssessment(false)}
                  className="bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] font-bold tracking-wider uppercase">
                  <th className="p-4">Jenis Asesmen</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4 text-center">Bobot Default kuliah (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {assessmentTypes.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{a.name}</td>
                    <td className="p-4 text-slate-500 text-xs">{a.description}</td>
                    <td className="p-4 text-center text-slate-900 font-semibold">{a.defaultWeight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content Audit Log */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Audit Keamanan & Logger Sistem</h3>
              <p className="text-xs text-slate-500">Melihat pelacakan audit real-time dari seluruh pergerakan sistem, validasi, dan transaksi AI.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari kata kunci log..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-250 rounded-lg bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] font-bold tracking-wider uppercase">
                  <th className="p-4">Waktu Kejadian</th>
                  <th className="p-4">Aktor Pengguna</th>
                  <th className="p-4">Kode Transaksi</th>
                  <th className="p-4">Rincian Perubahan Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">Tidak ada audit log yang sesuai kunci pencarian.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-slate-400 truncate max-w-[150px]">{new Date(log.timestamp).toLocaleString("id-ID")}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">{log.userRole}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.action.includes("AI_") 
                            ? "bg-purple-100 text-purple-700" 
                            : log.action.includes("VALIDATE") 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-slate-100 text-slate-700"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 whitespace-pre-wrap">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
