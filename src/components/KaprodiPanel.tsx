/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CPL, 
  Course, 
  User, 
  AcademicPeriod, 
  LecturerAssignment, 
  RPS, 
  UserRole 
} from "../types";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  BookOpen, 
  CheckSquare, 
  UserPlus, 
  Eye, 
  X,
  FileCheck,
  AlertCircle,
  BarChart4,
  Briefcase,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck
} from "lucide-react";

interface KaprodiPanelProps {
  cpl: CPL[];
  courses: Course[];
  users: User[];
  periods: AcademicPeriod[];
  assignments: LecturerAssignment[];
  rpsList: RPS[];
  onAddCPL: (c: Partial<CPL>) => void;
  onUpdateCPL: (id: string, updates: Partial<CPL>) => void;
  onDeleteCPL: (id: string) => void;
  onAddCourse: (c: Partial<Course>) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onAddAssignment: (a: Partial<LecturerAssignment>) => void;
  onDeleteAssignment: (id: string) => void;
  onValidateRPS: (id: string, status: RPS["status"], notes: string) => void;
}

export default function KaprodiPanel({
  cpl,
  courses,
  users,
  periods,
  assignments,
  rpsList,
  onAddCPL,
  onUpdateCPL,
  onDeleteCPL,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddAssignment,
  onDeleteAssignment,
  onValidateRPS
}: KaprodiPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "cpl" | "courses" | "assignments" | "validation" | "reports">("dashboard");

  // Filter lists
  const [cplSearch, setCplSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // CPL Forms
  const [isAddingCPL, setIsAddingCPL] = useState(false);
  const [editingCplId, setEditingCplId] = useState<string | null>(null);
  const [cplForm, setCplForm] = useState({ code: "", description: "", category: "Pengetahuan" as CPL["category"] });

  // Course Forms
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({ code: "", name: "", sks: 3, semester: 1, curriculum: "Kurikulum Merdeka 2024", cplIds: [] as string[] });

  // Assignment Form
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedLecturerId, setAssignedLecturerId] = useState("");
  const [assignedCourseId, setAssignedCourseId] = useState("");

  // RPS Validation Drawer
  const [reviewRps, setReviewRps] = useState<RPS | null>(null);
  const [validationNotes, setValidationNotes] = useState("");

  // Accordion details
  const [expandedCourseRow, setExpandedCourseRow] = useState<string | null>(null);

  const lecturers = users.filter(u => u.role === UserRole.DOSEN && u.isActive);
  const activePeriod = periods.find(p => p.isActive) || periods[0];

  const handleCplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cplForm.code || !cplForm.description) return;
    if (editingCplId) {
      onUpdateCPL(editingCplId, cplForm);
      setEditingCplId(null);
    } else {
      onAddCPL(cplForm);
    }
    setCplForm({ code: "", description: "", category: "Pengetahuan" });
    setIsAddingCPL(false);
  };

  const startEditCpl = (item: CPL) => {
    setEditingCplId(item.id);
    setCplForm({ code: item.code, description: item.description, category: item.category });
    setIsAddingCPL(true);
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name) return;
    if (editingCourseId) {
      onUpdateCourse(editingCourseId, courseForm);
      setEditingCourseId(null);
    } else {
      onAddCourse(courseForm);
    }
    setCourseForm({ code: "", name: "", sks: 3, semester: 1, curriculum: "Kurikulum Merdeka 2024", cplIds: [] });
    setIsAddingCourse(false);
  };

  const startEditCourse = (item: Course) => {
    setEditingCourseId(item.id);
    setCourseForm({
      code: item.code,
      name: item.name,
      sks: item.sks,
      semester: item.semester,
      curriculum: item.curriculum,
      cplIds: item.cplIds || []
    });
    setIsAddingCourse(true);
  };

  const toggleCplInCourseForm = (cplId: string) => {
    const ids = [...courseForm.cplIds];
    const idx = ids.indexOf(cplId);
    if (idx === -1) {
      ids.push(cplId);
    } else {
      ids.splice(idx, 1);
    }
    setCourseForm({ ...courseForm, cplIds: ids });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedLecturerId || !assignedCourseId) return;
    onAddAssignment({
      lecturerId: assignedLecturerId,
      courseId: assignedCourseId,
      periodId: activePeriod?.id || ""
    });
    setAssignedLecturerId("");
    setAssignedCourseId("");
    setIsAssigning(false);
  };

  // Status counts
  const draftRpsCount = rpsList.filter(r => r.status === "DRAFT").length;
  const pendingRpsCount = rpsList.filter(r => r.status === "MENUGGU_VALIDASI").length;
  const approvedRpsCount = rpsList.filter(r => r.status === "DISETUJUI").length;
  const revisedRpsCount = rpsList.filter(r => r.status === "DIREVISI").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
            Dashboard Kepala Program Studi (Kaprodi)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Program Studi S1 Teknik Informatika - Tahun Akademik {activePeriod?.year || "N/A"} ({activePeriod?.semester || "N/A"})
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "dashboard", label: "Dashboard Ringkasan" },
          { id: "cpl", label: "Manajemen CPL" },
          { id: "courses", label: "Kurikulum Mata Kuliah" },
          { id: "assignments", label: "Plotting Dosen Pengajar" },
          { id: "validation", label: `Validasi RPS (${pendingRpsCount})` },
          { id: "reports", label: "Laporan OBE & CPL" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================================== */}
      {/* TAB CONTENT: DASHBOARD */}
      {/* ===================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Total CPL Terbit</span>
              <div className="text-3xl font-extrabold font-sans text-slate-900 mt-1">{cpl.length} CPL</div>
              <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <Layers className="h-3 w-3 text-sky-500" />
                <span>Mapping ke standar DIKTI</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Asuhan Mata Kuliah</span>
              <div className="text-3xl font-extrabold font-sans text-slate-900 mt-1">{courses.length} MK</div>
              <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-emerald-500" />
                <span>Assign sesuai SK Dekan</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Staff Dosen Aktif</span>
              <div className="text-3xl font-extrabold font-sans text-slate-900 mt-1">{lecturers.length} Orang</div>
              <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-violet-500" />
                <span>Sesuai data master SDM</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-400 block uppercase">Validasi Tertunda</span>
              <div className="text-3xl font-extrabold font-sans text-amber-600 mt-1">{pendingRpsCount} RPS</div>
              <div className="text-[11px] text-amber-500 mt-1.5 flex items-center gap-1 animate-pulse">
                <AlertCircle className="h-3 w-3" />
                <span>Butuh validasi segera</span>
              </div>
            </div>
          </div>

          {/* RPS Status Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-slate-900 text-lg">Distribusi Dokumen RPS Semester Ini</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-sm font-semibold text-slate-500 uppercase">Draft</div>
                <div className="text-2xl font-bold font-sans text-slate-800 mt-1">{draftRpsCount}</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-sm font-semibold text-amber-600 uppercase">Menunggu Validasi</div>
                <div className="text-2xl font-bold font-sans text-amber-700 mt-1">{pendingRpsCount}</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-sm font-semibold text-emerald-600 uppercase">Disetujui</div>
                <div className="text-2xl font-bold font-sans text-emerald-700 mt-1">{approvedRpsCount}</div>
              </div>
              <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                <div className="text-sm font-semibold text-rose-600 uppercase">Direvisi</div>
                <div className="text-2xl font-bold font-sans text-rose-700 mt-1">{revisedRpsCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* TAB CONTENT: MANAJEMEN CPL */}
      {/* ===================================== */}
      {activeTab === "cpl" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Manajemen Capaian Pembelajaran Lulusan (CPL)</h3>
              <p className="text-xs text-slate-500">Buat, ubah, dan hapus profil profil penjaminan mutu kompetensi dasar lulusan.</p>
            </div>
            <button
              id="btn-add-cpl"
              onClick={() => {
                setEditingCplId(null);
                setCplForm({ code: "", description: "", category: "Pengetahuan" });
                setIsAddingCPL(!isAddingCPL);
              }}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Standar CPL</span>
            </button>
          </div>

          {isAddingCPL && (
            <form onSubmit={handleCplSubmit} className="bg-slate-55 p-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end animate-fade-in">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Kode Unik CPL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CPL-01"
                  value={cplForm.code}
                  onChange={(e) => setCplForm({...cplForm, code: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Klasifikasi CPL</label>
                <select
                  value={cplForm.category}
                  onChange={(e) => setCplForm({...cplForm, category: e.target.value as any})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                >
                  <option value="Sikap">Sikap</option>
                  <option value="Pengetahuan">Pengetahuan</option>
                  <option value="Keterampilan Umum">Keterampilan Umum</option>
                  <option value="Keterampilan Khusus">Keterampilan Khusus</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Uraian Siklus / Kompetensi Lulusan</label>
                <input
                  type="text"
                  required
                  placeholder="Mempunyai kemampuan merancang sistem cerdas nirkabel..."
                  value={cplForm.description}
                  onChange={(e) => setCplForm({...cplForm, description: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs p-2.5 rounded-lg"
                >
                  {editingCplId ? "Simpan Perubahan" : "Simpan Baru"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCPL(false)}
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
                  <th className="p-4">Kode CPL</th>
                  <th className="p-4">Kategori Mutu</th>
                  <th className="p-4">Deskripsi Capaian Kompetensi Lulusan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cpl.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-sky-600">{item.code}</td>
                    <td className="p-4">
                      <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-sans max-w-sm">{item.description}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${item.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></div>
                        <span>{item.isActive ? "Berlaku" : "Arsip"}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => startEditCpl(item)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 p-1.5 rounded transition-colors border border-slate-100"
                        title="Ubah CPL"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCPL(item.id)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors border border-slate-100"
                        title="Hapus CPL"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* TAB CONTENT: KURIKULUM MK */}
      {/* ===================================== */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Kurikulum Mata Kuliah Program Studi</h3>
              <p className="text-xs text-slate-500">Kelola kurikulum, jumlah SKS kuliah, penempatan semester, dan integrasi target CPL prodi.</p>
            </div>
            <button
              id="btn-add-course"
              onClick={() => {
                setEditingCourseId(null);
                setCourseForm({ code: "", name: "", sks: 3, semester: 1, curriculum: "Kurikulum Merdeka 2024", cplIds: [] });
                setIsAddingCourse(!isAddingCourse);
              }}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Mata Kuliah</span>
            </button>
          </div>

          {isAddingCourse && (
            <form onSubmit={handleCourseSubmit} className="bg-slate-55 p-5 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Kode Mata Kuliah</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INF-244"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Nama Mata Kuliah</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teori Komputasi Lanjut"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Kurikulum Dokumen</label>
                <input
                  type="text"
                  required
                  value={courseForm.curriculum}
                  onChange={(e) => setCourseForm({...courseForm, curriculum: e.target.value})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Jumlah SKS Teori/Praktik</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="8"
                  value={courseForm.sks}
                  onChange={(e) => setCourseForm({...courseForm, sks: parseInt(e.target.value) || 3})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5 font-bold">Penempatan Semester</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="8"
                  value={courseForm.semester}
                  onChange={(e) => setCourseForm({...courseForm, semester: parseInt(e.target.value) || 1})}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                />
              </div>

              {/* Multiple selection CPL Checkboxes */}
              <div className="md:col-span-3 bg-white p-4 rounded-lg border border-slate-200">
                <label className="block text-xs font-mono font-bold text-slate-600 mb-2">Pilih Integrasi CPL Prodi Terkait:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cpl.map(c => (
                    <label key={c.id} className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={courseForm.cplIds.includes(c.id)}
                        onChange={() => toggleCplInCourseForm(c.id)}
                        className="mt-0.5"
                      />
                      <span><strong className="text-sky-600">{c.code}</strong>: {c.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 flex gap-2">
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg"
                >
                  {editingCourseId ? "Simpan Perubahan MK" : "Simpan MK Baru"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg"
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
                  <th className="p-4">Kode MK & Kurikulum</th>
                  <th className="p-4">Nama Mata Kuliah</th>
                  <th className="p-4 text-center">SKS</th>
                  <th className="p-4 text-center">Semester</th>
                  <th className="p-4">Target CPL OBE Pendukung</th>
                  <th className="p-4 text-center">Aksi Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {courses.map((item) => {
                  const isExpanded = expandedCourseRow === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/25">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">{item.code}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{item.curriculum}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-4 text-center font-bold text-slate-800">{item.sks}</td>
                      <td className="p-4 text-center">{item.semester}</td>
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {item.cplIds && item.cplIds.map(cId => {
                            const foundCpl = cpl.find(c => c.id === cId);
                            return foundCpl ? (
                              <span key={cId} title={foundCpl.description} className="bg-sky-50 text-sky-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-sky-100 cursor-help">
                                {foundCpl.code}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="p-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => startEditCourse(item)}
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 p-1.5 rounded border border-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCourse(item.id)}
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded border border-slate-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* TAB CONTENT: PLOTTING ASSIGNMENTS */}
      {/* ===================================== */}
      {activeTab === "assignments" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">Plotting Penugasan Pengajar Kuliah</h3>
              <p className="text-xs text-slate-500">Petakan asuhan Dosen Pengampu ke Mata Kuliah di semester berjalan.</p>
            </div>
            <button
              id="btn-assign-lecturer"
              onClick={() => setIsAssigning(!isAssigning)}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Plotting Baru</span>
            </button>
          </div>

          {isAssigning && (
            <form onSubmit={handleAssignSubmit} className="bg-slate-55 p-5 border-b border-slate-200 flex flex-wrap gap-4 items-end animate-fade-in">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Mata Kuliah Kurikulum</label>
                <select
                  required
                  value={assignedCourseId}
                  onChange={(e) => setAssignedCourseId(e.target.value)}
                  className="text-sm border border-slate-250 p-2 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Mata Kuliah --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Dosen Pengampu Utama</label>
                <select
                  required
                  value={assignedLecturerId}
                  onChange={(e) => setAssignedLecturerId(e.target.value)}
                  className="text-sm border border-slate-250 p-2 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Dosen Pengampu --</option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg"
                >
                  Simpan Plotting
                </button>
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5-3 px-3 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-slate-100">
            {assignments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Belum ada plotting dosen pengajar semester berjalan.</div>
            ) : (
              assignments.map((assignment) => {
                const foundDosen = users.find(u => u.id === assignment.lecturerId);
                const foundCourse = courses.find(c => c.id === assignment.courseId);
                return (
                  <div key={assignment.id} className="p-4 flex items-center justify-between hover:bg-slate-50/20">
                    <div className="flex items-center gap-4">
                      <div className="bg-sky-50 p-2 rounded-lg text-sky-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {foundCourse ? foundCourse.name : "Mata Kuliah Terhapus"}
                          <span className="font-mono text-xs text-sky-600 ml-2">[{foundCourse?.code || "N/A"}]</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Dosen: {foundDosen ? foundDosen.name : "Dosen Tidak Ditemukan"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteAssignment(assignment.id)}
                      className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg border border-rose-100 transition-colors"
                      title="Batalkan Plotting"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* TAB CONTENT: VALIDATION RPS QUEUE */}
      {/* ===================================== */}
      {activeTab === "validation" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Antrean Validasi Rencana Pembelajaran Semester (RPS)</h3>
            <p className="text-xs text-slate-550">Review detail kualitas implementasi kurikulum RPS OBE dosen sebelum melakukan persetujuan resmi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rpsList.map((rps) => {
              const matchingCourse = courses.find(c => c.id === rps.courseId);
              const matchingDosen = users.find(u => u.id === rps.updatedBy);
              return (
                <div key={rps.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase mb-1.5 ${
                        rps.status === "MENUGGU_VALIDASI" 
                          ? "bg-amber-100 text-amber-700 animate-pulse" 
                          : rps.status === "DISETUJUI" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : rps.status === "DIREVISI" 
                              ? "bg-rose-100 text-rose-700" 
                              : "bg-slate-100 text-slate-700"
                      }`}>
                        {rps.status}
                      </span>
                      <h4 className="font-sans font-bold text-slate-900 leading-snug">{rps.courseName}</h4>
                      <p className="text-xs font-mono text-slate-400 mt-1">Kode: {rps.courseCode} | {rps.sks} SKS | {rps.jumlah_pertemuan} Pertemuan</p>
                    </div>
                    <div className="text-xs text-slate-400 text-right">
                      <div>v{rps.version}</div>
                      <div>{new Date(rps.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="text-xs text-slate-600 line-clamp-2">
                    <strong>Penyusun:</strong> {matchingDosen?.name || "Dosen Pengampu"}
                  </div>

                  {rps.notes && (
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-mono">
                      <strong>Catatan Riwayat:</strong> {rps.notes}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      id={`btn-review-${rps.id}`}
                      onClick={() => {
                        setReviewRps(rps);
                        setValidationNotes(rps.notes || "");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 px-3 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <Eye className="h-4.5 w-4.5" />
                      <span>Review & Validasi RPS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Review Modal Detail */}
          {reviewRps && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
              <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-sky-600 block leading-none uppercase tracking-wider mb-1">PROGRAM INTERN VALIDASI</span>
                    <h3 className="text-xl font-bold text-slate-900">{reviewRps.courseName}</h3>
                  </div>
                  <button 
                    onClick={() => setReviewRps(null)}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
                  {/* Metadata info */}
                  <div className="bg-slate-100/50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Kode Kuliah:</span>
                      <strong className="text-slate-900">{reviewRps.courseCode}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Bobot SKS:</span>
                      <strong className="text-slate-900">{reviewRps.sks} SKS</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Jumlah Sesi:</span>
                      <strong className="text-slate-900">{reviewRps.jumlah_pertemuan} Pertemuan</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Status Validasi:</span>
                      <strong className="text-amber-600">{reviewRps.status}</strong>
                    </div>
                  </div>

                  {/* Section CPMK */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-slate-900 text-sm">1. Target Capaian Pembelajaran Mata Kuliah (CPMK)</h4>
                    <div className="space-y-2">
                      {reviewRps.cpmk.map((c, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                          <strong className="text-sky-600 font-mono">{c.code}</strong> (Linked {c.linkedCplCode}) : {c.description}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Sesi Pembelajaran */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-slate-900 text-sm">2. Sesi Pembelajaran Semester ({reviewRps.materi_pembelajaran.length} Sesi Terbimbing)</h4>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                            <th className="p-3 text-center">No</th>
                            <th className="p-3">Target CPMK</th>
                            <th className="p-3">Bahasan & Metode</th>
                            <th className="p-3">Aktivitas Mahasiswa</th>
                            <th className="p-3">Asesmen Pembuka</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {reviewRps.materi_pembelajaran.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/20">
                              <td className="p-3 text-center font-bold text-slate-500">{m.pertemuan}</td>
                              <td className="p-3 font-mono font-bold text-sky-600">{m.cpmk}</td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{m.topik}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{m.sub_topik}</div>
                                <div className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider mt-1">{m.metode}</div>
                              </td>
                              <td className="p-3 text-slate-500 max-w-xs">{m.aktivitas_mahasiswa}</td>
                              <td className="p-3 font-sans text-slate-650 font-medium">{m.asesmen}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Rubrik section */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-slate-900 text-sm">3. Aspek atau Rubrik Evaluasi OBE</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {reviewRps.rubrik.map((r, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1 text-xs">
                          <strong className="text-slate-900 block font-sans">{r.kriteria}</strong>
                          <div className="text-slate-500 line-clamp-2"><span className="text-emerald-600 font-semibold">Sangat Baik:</span> {r.sangatBaik}</div>
                          <div className="text-slate-500 line-clamp-2"><span className="text-rose-600 font-semibold">Kurang:</span> {r.kurang}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Validation panel controls */}
                <div className="p-6 border-t border-slate-250 bg-slate-50 space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">
                      Catatan atau Evaluasi Masukan Validasi Kaprodi
                    </label>
                    <textarea
                      id="txt-validation-notes"
                      rows={3}
                      placeholder="Tuliskan catatan revisi jika menolak, atau masukan penguat jika menyetujui..."
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-250 rounded-lg bg-white"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      id="btn-reject-rps"
                      onClick={() => {
                        onValidateRPS(reviewRps.id, "DIREVISI", validationNotes || "Perlu perbaikan mutu materi.");
                        setReviewRps(null);
                      }}
                      className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors"
                    >
                      <X className="h-4.5 w-4.5" />
                      <span>Kembalikan / Reject (Minta Revisi)</span>
                    </button>
                    <button
                      id="btn-approve-rps"
                      onClick={() => {
                        onValidateRPS(reviewRps.id, "DISETUJUI", validationNotes || "RPS memenuhi standar OBE.");
                        setReviewRps(null);
                      }}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors"
                    >
                      <FileCheck className="h-4.5 w-4.5" />
                      <span>Setujui & Terbitkan RPS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================== */}
      {/* TAB CONTENT: REPORTS */}
      {/* ===================================== */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-sky-500" />
              <span>Laporan Analitis Evaluasi OBE Program Studi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Melihat rekapitulasi CPL terdistribusi, CPMK pendukung proses akreditasi BAN-PT.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h4 className="font-sans font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm">Rekapitulasi CPL di Kurikulum</h4>
              <div className="space-y-3 text-xs">
                {cpl.map((c, idx) => {
                  // Count courses targeting this CPL
                  const courseCount = courses.filter(item => item.cplIds.includes(c.id)).length;
                  const percent = Math.min(100, Math.round((courseCount / (courses.length || 1)) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="font-mono text-sky-600 font-bold">{c.code} ({c.category})</span>
                        <span className="text-slate-500">{courseCount} Mata Kuliah ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h4 className="font-sans font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm">Status Dokumen RPS Mata Kuliah</h4>
              <div className="space-y-3.5 text-xs">
                {courses.map((course, idx) => {
                  const rps = rpsList.find(r => r.courseId === course.id);
                  const statusLabel = rps ? rps.status : "BELUM DIBUAT";
                  return (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <div>
                        <strong className="text-slate-900 font-sans block leading-none">{course.name}</strong>
                        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 inline-block">{course.code}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold leading-none uppercase ${
                        statusLabel === "DISETUJUI" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : statusLabel === "MENUGGU_VALIDASI" 
                            ? "bg-amber-100 text-amber-700" 
                            : statusLabel === "DIREVISI" 
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-150 text-slate-600"
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
