/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Course, 
  CPL, 
  RPS, 
  RPSVersion, 
  QuestionItem, 
  TaskPlan, 
  ExamPlan,
  MeetingPlan,
  CPMK,
  SubCPMK,
  RubrikKriteria,
  AssessmentOBE
} from "../types";
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  FileDown, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  History, 
  HelpCircle, 
  FileCheck,
  Award,
  BookMarked,
  Printer,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  X
} from "lucide-react";

interface DosenPanelProps {
  courses: Course[];
  cplList: CPL[];
  rpsList: RPS[];
  questions: QuestionItem[];
  tasks: TaskPlan[];
  exams: ExamPlan[];
  versions: RPSVersion[];
  currentUserName: string;
  onSaveRPS: (rps: RPS) => Promise<RPS>;
  onAddRPS: (rps: Partial<RPS>) => Promise<RPS>;
  onGenerateRPS: (payload: { courseName: string; sks: number; jumlahPertemuan: number; selectedCPL: string[] }) => Promise<any>;
  onRegenerateSection: (payload: { section: string; courseName: string; sks: number; currentRps: any; selectedCPL: string[] }) => Promise<any>;
  onGenerateQuestions: (payload: { cpmkDesc: string; bloomLevel: string; type: string; count: number; courseName: string }) => Promise<any>;
  onGenerateTask: (payload: { cpmkCode: string; cpmkDesc: string; courseName: string }) => Promise<any>;
  onGenerateExam: (payload: { type: "UTS" | "UAS"; cpmkCode: string; cpmkDesc: string; courseName: string }) => Promise<any>;
}

export default function DosenPanel({
  courses,
  cplList,
  rpsList,
  questions,
  tasks,
  exams,
  versions,
  currentUserName,
  onSaveRPS,
  onAddRPS,
  onGenerateRPS,
  onRegenerateSection,
  onGenerateQuestions,
  onGenerateTask,
  onGenerateExam
}: DosenPanelProps) {
  // Dosen context: they can choose one of their asuhan courses
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [jumlahPertemuan, setJumlahPertemuan] = useState(12); // Flexible defaults
  const [activeRps, setActiveRps] = useState<RPS | null>(null);
  const [selectedCpls, setSelectedCpls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState<string | null>(null);
  const [errorText, setErrorText] = useState("");

  // Sub Section Tab inside Active RPS
  const [activeSubTab, setActiveSubTab] = useState<"materi" | "cpmk" | "rubrik" | "assets">("materi");

  // Filter & Search over meeting plans
  const [meetingFilterSearch, setMeetingFilterSearch] = useState("");

  // History / Versions Drawer
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCompareInfo, setHistoryCompareInfo] = useState<{ v1: string; v2: string } | null>(null);

  // Bank Soal interactive form
  const [selectedCpmkForAssets, setSelectedCpmkForAssets] = useState("");
  const [bloomSelectValue, setBloomSelectValue] = useState("C3");
  const [assetTypeSelect, setAssetTypeSelect] = useState<"TUGAS" | "QUIZ" | "UTS" | "UAS">("QS-GEN" as any); // also general tools
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);

  // Trigger loading relevant active RPS when course changes
  useEffect(() => {
    if (selectedCourseId) {
      const foundC = courses.find(c => c.id === selectedCourseId) || null;
      setSelectedCourse(foundC);
      if (foundC) {
        setSelectedCpls(foundC.cplIds || []);
        // Check if there is already an RPS for this course
        const existingRps = rpsList.find(r => r.courseId === foundC.id);
        setActiveRps(existingRps ? JSON.parse(JSON.stringify(existingRps)) : null); // deep clone
      }
    } else {
      setSelectedCourse(null);
      setActiveRps(null);
    }
    setErrorText("");
  }, [selectedCourseId, rpsList, courses]);

  // AI Generation driver
  const handleAIGenerateFullRPS = async () => {
    if (!selectedCourse) return;
    setIsGenerating(true);
    setErrorText("");
    try {
      const cplCodesList = selectedCpls.map(id => cplList.find(c => c.id === id)?.code || "").filter(Boolean);
      const aiResponse = await onGenerateRPS({
        courseName: selectedCourse.name,
        sks: selectedCourse.sks,
        jumlahPertemuan: jumlahPertemuan,
        selectedCPL: cplCodesList
      });

      // Prepare newly generated document to be saved
      const rawRps: Partial<RPS> = {
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        courseCode: selectedCourse.code,
        sks: selectedCourse.sks,
        jumlah_pertemuan: jumlahPertemuan,
        cplIds: selectedCpls,
        status: "DRAFT",
        cpmk: aiResponse.cpmk || [],
        sub_cpmk: aiResponse.sub_cpmk || [],
        mapping_cpl_cpmk: aiResponse.mapping_cpl_cpmk || [],
        materi_pembelajaran: aiResponse.materi_pembelajaran || [],
        asesmen: aiResponse.asesmen || [],
        rubrik: aiResponse.rubrik || [],
        referensi: aiResponse.referensi || [],
        version: 1,
        updatedBy: currentUserName
      };

      const result = await onAddRPS(rawRps);
      setActiveRps(JSON.parse(JSON.stringify(result)));
    } catch (err: any) {
      setErrorText(err.message || "Gagal melakukan asisten generator RPS.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Inline table edit handlers
  const handleMeetingCellChange = (num: number, field: keyof MeetingPlan, val: any) => {
    if (!activeRps) return;
    const updMateri = activeRps.materi_pembelajaran.map(m => {
      if (m.pertemuan === num) {
        return { ...m, [field]: val };
      }
      return m;
    });
    setActiveRps({ ...activeRps, materi_pembelajaran: updMateri });
  };

  const handleCreateMeetingRow = () => {
    if (!activeRps) return;
    const nextNum = activeRps.materi_pembelajaran.length + 1;
    const newRow: MeetingPlan = {
      pertemuan: nextNum,
      topik: "Topik Pembahasan Baru",
      sub_topik: "Rincian bahasan baru",
      cpmk: activeRps.cpmk[0]?.code || "CPMK-1",
      metode: "Ceramah & Diskusi",
      aktivitas_mahasiswa: "Berdialog aktif menyusun telaah",
      indikator_penilaian: "Kelancaran unjuk kerja",
      asesmen: "Pertanyaan lisan"
    };
    setActiveRps({
      ...activeRps,
      jumlah_pertemuan: nextNum,
      materi_pembelajaran: [...activeRps.materi_pembelajaran, newRow]
    });
  };

  const handleDeleteMeetingRow = (num: number) => {
    if (!activeRps) return;
    const filtered = activeRps.materi_pembelajaran.filter(m => m.pertemuan !== num);
    // Re-index meetings sequentially
    const sequential = filtered.map((m, idx) => ({ ...m, pertemuan: idx + 1 }));
    setActiveRps({
      ...activeRps,
      jumlah_pertemuan: sequential.length,
      materi_pembelajaran: sequential
    });
  };

  const handleMoveMeetingRow = (idx: number, direction: "up" | "down") => {
    if (!activeRps) return;
    const list = [...activeRps.materi_pembelajaran];
    if (direction === "up" && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === "down" && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }
    // Re-index
    const sequential = list.map((m, i) => ({ ...m, pertemuan: i + 1 }));
    setActiveRps({ ...activeRps, materi_pembelajaran: sequential });
  };

  const handleSaveActiveChanges = async () => {
    if (!activeRps) return;
    try {
      const result = await onSaveRPS({ ...activeRps, updatedBy: currentUserName });
      setActiveRps(JSON.parse(JSON.stringify(result)));
      alert("Perubahan RPS OBE berhasil disimpan secara otomatis ke dalam versi draf baru.");
    } catch (err: any) {
      alert("Gagal melakukan autosave: " + err.message);
    }
  };

  const handleSubmitToKaprodi = async () => {
    if (!activeRps) return;
    try {
      const preparedToSend = { ...activeRps, status: "MENUGGU_VALIDASI" as const, updatedBy: currentUserName };
      const result = await onSaveRPS(preparedToSend);
      setActiveRps(JSON.parse(JSON.stringify(result)));
      alert("RPS berhasil dikirimkan ke Kepala Program Studi (Kaprodi) untuk validasi formal!");
    } catch (err: any) {
      alert("Gagal mengirimkan validasi: " + err.message);
    }
  };

  // Section-wise AI Regenerator
  const handleRegenerateSubsection = async (section: "cpmk" | "materi" | "asesmen" | "rubrik") => {
    if (!selectedCourse || !activeRps) return;
    setIsRegeneratingSection(section);
    setErrorText("");
    try {
      const cplCodesList = selectedCpls.map(id => cplList.find(c => c.id === id)?.code || "").filter(Boolean);
      const aiResponse = await onRegenerateSection({
        section,
        courseName: selectedCourse.name,
        sks: selectedCourse.sks,
        currentRps: activeRps,
        selectedCPL: cplCodesList
      });

      // Update specific target section only!
      let updatedRps: RPS = { ...activeRps };
      if (section === "cpmk") {
        updatedRps.cpmk = aiResponse.cpmk || activeRps.cpmk;
        updatedRps.sub_cpmk = aiResponse.sub_cpmk || activeRps.sub_cpmk;
        updatedRps.mapping_cpl_cpmk = aiResponse.mapping_cpl_cpmk || activeRps.mapping_cpl_cpmk;
      } else if (section === "materi") {
        updatedRps.materi_pembelajaran = aiResponse.materi_pembelajaran || activeRps.materi_pembelajaran;
      } else if (section === "asesmen") {
        updatedRps.asesmen = aiResponse.asesmen || activeRps.asesmen;
      } else if (section === "rubrik") {
        updatedRps.rubrik = aiResponse.rubrik || activeRps.rubrik;
      }

      setActiveRps(updatedRps);
      alert(`AI Berhasil meregenerasi bab [${section.toUpperCase()}] tanpa merusak bab lainnya! Silakan simpan draf jika merasa sesuai.`);
    } catch (err: any) {
      setErrorText(`Gagal meregenerasi seksi ${section}: ` + err.message);
    } finally {
      setIsRegeneratingSection(null);
    }
  };

  // AI Educational Assets Generators
  const handleAIAssetGeneration = async (type: "bank-soal" | "rencana-tugas" | "rencana-ujian") => {
    if (!selectedCourse || !selectedCpmkForAssets) {
      alert("Harap pilih sasaran target CPMK terlebih dahulu sebagai acuan AI!");
      return;
    }
    const cpmkObj = activeRps?.cpmk.find(c => c.code === selectedCpmkForAssets);
    if (!cpmkObj) return;

    setIsGeneratingAssets(true);
    try {
      if (type === "bank-soal") {
        await onGenerateQuestions({
          cpmkDesc: `[${cpmkObj.code}] ${cpmkObj.description}`,
          bloomLevel: bloomSelectValue,
          type: assetTypeSelect,
          count: 2,
          courseName: selectedCourse.name
        });
        alert("Berhasil membuat pertanyaan soal berbasis kompetensi baru melalui Gemini API!");
      } else if (type === "rencana-tugas") {
        await onGenerateTask({
          cpmkCode: cpmkObj.code,
          cpmkDesc: cpmkObj.description,
          courseName: selectedCourse.name
        });
        alert("Rencana Tugas OBE baru berhasil diformulasikan!");
      } else if (type === "rencana-ujian") {
        await onGenerateExam({
          type: "UTS",
          cpmkCode: cpmkObj.code,
          cpmkDesc: cpmkObj.description,
          courseName: selectedCourse.name
        });
        alert("Kisi-kisi rancangan ujian berhasil disimpan!");
      }
    } catch (err: any) {
      alert("Kesalahan membuat asset evaluasi: " + err.message);
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  // Exporters formatting (Raw/Simulated)
  const downloadAsExcelCSV = () => {
    if (!activeRps) return;
    let csv = "Pertemuan,CPMK Sasaran,Topik,Sub Topik,Metode,Aktivitas Mahasiswa,Indikator Penilaian,Bentuk Asesmen\n";
    activeRps.materi_pembelajaran.forEach(m => {
      csv += `"${m.pertemuan}","${m.cpmk}","${m.topik.replace(/"/g, '""')}","${m.sub_topik.replace(/"/g, '""')}","${m.metode}","${m.aktivitas_mahasiswa.replace(/"/g, '""')}","${m.indikator_penilaian.replace(/"/g, '""')}","${m.asesmen}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RPS_OBE_EXCEL_${activeRps.courseCode}.csv`);
    link.click();
  };

  const downloadAsWordDoc = () => {
    if (!activeRps) return;
    let docContent = `
=============================================
RENCANA PEMBELAJARAN SEMESTER (RPS) OBE DIKTI
=============================================
Mata Kuliah: ${activeRps.courseName} (${activeRps.courseCode})
SKS: ${activeRps.sks} SKS | Sesi: ${activeRps.jumlah_pertemuan} Pertemuan
Kurikulum Keamanan Kemahasiswaan OBE DIKTI

CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK):
${activeRps.cpmk.map(c => `- [${c.code}]: ${c.description} (Linked: ${c.linkedCplCode})`).join("\n")}

MATERI PEMBELAJARAN:
${activeRps.materi_pembelajaran.map(m => `
Pertemuan ${m.pertemuan}:
- Topik: ${m.topik} (${m.sub_topik})
- CPMK: ${m.cpmk} | Metode: ${m.metode}
- Aktivitas: ${m.aktivitas_mahasiswa}
- Evaluasi: ${m.asesmen}
- Indikator: ${m.indikator_penilaian}
`).join("\n")}

REFERENSI RUJUKAN UTAMA:
${activeRps.referensi.map((r, i) => `${i+1}. ${r}`).join("\n")}
    `;
    const blob = new Blob([docContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `RPS_OBE_WORD_${activeRps.courseCode}.doc`);
    link.click();
  };

  const handleTriggerPrintPDF = () => {
    window.print();
  };

  // Filter meeting rows
  const filteredMeetings = activeRps 
    ? activeRps.materi_pembelajaran.filter(m => 
        m.topik.toLowerCase().includes(meetingFilterSearch.toLowerCase()) ||
        m.sub_topik.toLowerCase().includes(meetingFilterSearch.toLowerCase()) ||
        m.metode.toLowerCase().includes(meetingFilterSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Selector & Setup Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
            <span>Penyusunan RPS Berbasis CPL & CPMK (Outcome-Based Education)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pilihlah salah satu Mata Kuliah asuhan Anda untuk memulai penulisan draf kurikulum, melakukan asisten otomatis via AI Gemini, evaluasi bank soal, dsb.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 mb-2">Pilih Mata Kuliah Anda:</label>
            <select
              id="select-asuhan-mk"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white font-semibold text-slate-800"
            >
              <option value="">-- Silakan Pilih MK --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-2">SKS Penyeimbang:</label>
                <div className="bg-slate-100/80 text-slate-800 font-bold p-2 text-sm rounded-lg border border-slate-200">
                  {selectedCourse.sks} SKS Kursus
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-slate-600 mb-2">Jumlah Pertemuan Kerja:</label>
                <select
                  value={jumlahPertemuan}
                  onChange={(e) => setJumlahPertemuan(parseInt(e.target.value) || 12)}
                  className="w-full text-sm border border-slate-250 p-2 rounded-lg bg-white"
                >
                  <option value={8}>8 Pertemuan (SDA)</option>
                  <option value={10}>10 Pertemuan</option>
                  <option value={12}>12 Pertemuan (Standard)</option>
                  <option value={14}>14 Pertemuan</option>
                  <option value={16}>16 Pertemuan (Penuh)</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* CPL checkbox selection list */}
        {selectedCourse && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 animate-fade-in text-slate-800">
            <h4 className="text-xs font-mono font-bold text-slate-600">Standar CPL Lulusan Pendukung:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cplList.map(c => {
                const isLinkedByCourse = selectedCourse.cplIds.includes(c.id);
                return (
                  <div key={c.id} className="flex items-start gap-2 text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${isLinkedByCourse ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-100 text-slate-400"}`}>
                      {c.code}
                    </span>
                    <span className="text-slate-600">{c.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Generator Triggers */}
        {selectedCourse && !activeRps && (
          <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="space-y-1">
              <div className="font-bold text-orange-950 flex items-center gap-1.5 text-sm">
                <AlertCircle className="h-4.5 w-4.5 text-orange-600" />
                <span>Dokumen RPS Belum Terbuat!</span>
              </div>
              <p className="text-xs text-orange-700">gunakan teknologi kecerdasan buatan Gemini AI untuk menghasilkan kerangka RPS berstandar CPL & Taksonomi Bloom dalam hitungan detik.</p>
            </div>
            <button
              id="btn-gemini-full-rps"
              onClick={handleAIGenerateFullRPS}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-3 rounded-lg shadow-md transition-colors whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  <span>Generasi Otomatis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>AI Generate RPS (OBE No-1)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {errorText && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg flex items-start gap-2 font-mono">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* ============================================== */}
      {/* CENTRAL EDITOR WORKSPACE (WHEN RPS IS ACTIVE)  */}
      {/* ============================================== */}
      {selectedCourse && activeRps && (
        <div className="space-y-6 animate-fade-in text-slate-900">
          {/* Action Header bar */}
          <div className="bg-slate-100 border border-slate-250 p-4 rounded-xl flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                activeRps.status === "DISETUJUI" 
                  ? "bg-emerald-100 text-emerald-800" 
                  : activeRps.status === "MENUGGU_VALIDASI" 
                    ? "bg-amber-100 text-amber-800" 
                    : "bg-slate-200 text-slate-700"
              }`}>
                {activeRps.status}
              </span>
              <span className="text-xs text-slate-500 font-mono">Draf Versi: v{activeRps.version}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                id="btn-trigger-history"
                onClick={() => setIsHistoryOpen(true)}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
              >
                <History className="h-4 w-4" />
                <span>Riwayat v1-v3</span>
              </button>

              <button
                id="btn-autosave-rps"
                onClick={handleSaveActiveChanges}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-indigo-50/20 border border-slate-200 p-2 rounded-lg text-xs font-bold text-indigo-600 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Draf (v{activeRps.version})</span>
              </button>

              <button
                id="btn-submit-to-kaprodi"
                onClick={handleSubmitToKaprodi}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <FileCheck className="h-4 w-4" />
                <span>Kirim Validasi Kaprodi</span>
              </button>
            </div>
          </div>

          {/* Sub Workspace tab selection */}
          <div className="flex border-b border-slate-200">
            {[
              { id: "materi", label: "Pokok Bahasan Sesi Pertemuan" },
              { id: "cpmk", label: "Capaian CPMK & Mapping CPL" },
              { id: "rubrik", label: "Aspek & Rubrik Indikator" },
              { id: "assets", label: "Bank Soal & Penugasan AI" }
            ].map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
                  activeSubTab === subTab.id
                    ? "border-indigo-600 text-indigo-650"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {subTab.label}
              </button>
            ))}
          </div>

          {/* ======================================================== */}
          {/* MATERI PEMBELAJARAN: THE MAIN INLINE-EDITABLE TABLE      */}
          {/* ======================================================== */}
          {activeSubTab === "materi" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari pokok bahasan..."
                    value={meetingFilterSearch}
                    onChange={(e) => setMeetingFilterSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-250 rounded-lg bg-white"
                  />
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRegenerateSubsection("materi")}
                    disabled={!!isRegeneratingSection}
                    className="inline-flex items-center gap-1 font-semibold text-xs border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 p-2 rounded-lg transition-colors.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>AI Regenerate Pokok Bahasan</span>
                  </button>

                  <button
                    id="btn-add-meeting-row"
                    onClick={handleCreateMeetingRow}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs p-2 rounded-lg shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Baris Pertemuan</span>
                  </button>
                </div>
              </div>

              {/* The Editable table layout  */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3 w-28">CPMK Relevan</th>
                      <th className="p-3">Pokok Bahasan Utama (Tema)</th>
                      <th className="p-3">Rincian Sub Bahasan</th>
                      <th className="p-3 w-36">Metode</th>
                      <th className="p-3">Aktivitas Mahasiswa</th>
                      <th className="p-3">Asesmen Terukur</th>
                      <th className="p-3 text-center w-24">Urutan / Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredMeetings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400">Bagian pokok bahasan kosong/tidak ditemukan pencarian.</td>
                      </tr>
                    ) : (
                      filteredMeetings.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="p-2 text-center font-bold text-slate-550 bg-slate-50/50">{m.pertemuan}</td>
                          <td className="p-2">
                            <select
                              value={m.cpmk}
                              onChange={(e) => handleMeetingCellChange(m.pertemuan, "cpmk", e.target.value)}
                              className="w-full text-xs border border-slate-200 p-1.5 rounded-lg font-mono font-semibold text-indigo-600 bg-white"
                            >
                              {activeRps.cpmk.map((c, i) => (
                                <option key={i} value={c.code}>{c.code}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <textarea
                              rows={2}
                              value={m.topik}
                              onChange={(e) => handleMeetingCellChange(m.pertemuan, "topik", e.target.value)}
                              className="w-full text-xs border border-slate-200 p-1.5 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              rows={2}
                              value={m.sub_topik}
                              onChange={(e) => handleMeetingCellChange(m.pertemuan, "sub_topik", e.target.value)}
                              className="w-full text-xs border border-slate-200 p-1.5 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={m.metode}
                              onChange={(e) => handleMeetingCellChange(m.pertemuan, "metode", e.target.value)}
                              className="w-full text-xs border border-slate-200 p-1.5 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                          <td className="p-2">
                            <textarea
                              rows={2}
                              value={m.aktivitas_mahasiswa}
                              onChange={(e) => handleMeetingCellChange(m.pertemuan, "aktivitas_mahasiswa", e.target.value)}
                              className="w-full text-xs border border-slate-200 p-1.5 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={m.asesmen}
                              onChange={(e) => handleMeetingCellChange(m.pertemuan, "asesmen", e.target.value)}
                              className="w-full text-xs border border-slate-200 p-1.5 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                          <td className="p-2 text-center space-y-1">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleMoveMeetingRow(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                                title="Naikkan baris"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleMoveMeetingRow(idx, "down")}
                                disabled={idx === filteredMeetings.length - 1}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                                title="Turunkan baris"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteMeetingRow(m.pertemuan)}
                                className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 ml-1"
                                title="Hapus baris"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/* SEC TAB: CAPAIAN CPMK & MAPPING CPL                      */}
          {/* ======================================================== */}
          {activeSubTab === "cpmk" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Capain CPMK & Pemetaan Logis CPL Lulusan</h3>
                  <p className="text-xs text-slate-500">Mendefinisikan CPMK menggunakan Taksonomi Bloom kognitif mendalam.</p>
                </div>
                <button
                  onClick={() => handleRegenerateSubsection("cpmk")}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg font-bold"
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>AI Regenerate CPMK & Sub</span>
                </button>
              </div>

              {/* CPMK list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRps.cpmk.map((c, i) => {
                  const linkedSub = activeRps.sub_cpmk.filter(sub => sub.linkedCpmkCode === c.code);
                  return (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-md">
                          {c.code}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Linked CPL: {c.linkedCplCode}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-semibold">{c.description}</p>
                      
                      {/* Nested sub CPMK */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Anak Sub-CPMK:</div>
                        {linkedSub.map((sub, idx) => (
                          <div key={idx} className="bg-slate-50 p-2 rounded-lg text-xs leading-relaxed border border-slate-150">
                            <span className="font-mono text-sky-600 font-bold mr-1.5">{sub.code}</span>
                            {sub.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/* SEC TAB: ASPEK & RUBRIK INDIKATOR                        */}
          {/* ======================================================== */}
          {activeSubTab === "rubrik" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Formulasi Rubrik Penilaian & Pembobotan Asesmen OBE</h3>
                  <p className="text-xs text-slate-550">Metodologi pengukuran keandalan unjuk kerja penugasan mahasiswa.</p>
                </div>
                <button
                  onClick={() => handleRegenerateSubsection("rubrik")}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg font-bold"
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>AI Regenerate Rubrik</span>
                </button>
              </div>

              {/* Rubric list */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                      <th className="p-3 w-1/4">Kriteria Penilaian</th>
                      <th className="p-3 text-emerald-700 bg-emerald-50/50">Sangat Baik (A/AB)</th>
                      <th className="p-3 text-sky-700 bg-sky-50/50">Baik (B)</th>
                      <th className="p-3 text-amber-700 bg-amber-50/50">Cukup (C)</th>
                      <th className="p-3 text-rose-700 bg-rose-50/50">Kurang (D/E)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRps.rubrik.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/10">
                        <td className="p-3 font-bold text-slate-900 bg-slate-50/30">{r.kriteria}</td>
                        <td className="p-3 text-slate-600 leading-relaxed font-sans">{r.sangatBaik}</td>
                        <td className="p-3 text-slate-600 leading-relaxed font-sans">{r.baik}</td>
                        <td className="p-3 text-slate-600 leading-relaxed font-sans">{r.cukup}</td>
                        <td className="p-3 text-slate-600 leading-relaxed font-sans">{r.kurang}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/* SEC TAB: BANK SOAL & PENUGASAN AI                        */}
          {/* ======================================================== */}
          {activeSubTab === "assets" && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Creative Evaluasi Hub (AI Gen-Resources)</h3>
                  <p className="text-xs text-slate-550">Gunakan Gemini AI untuk memformulasikan pertanyaan Bank Soal, Rencana Tugas, atau rancangan Kisi-kisi Evaluasi Ujian berdasarkan target CPMK taksonomis Anda!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-white p-4 rounded-xl border border-slate-150 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-600 mb-2">1. Pilih CPMK Acuan:</label>
                    <select
                      value={selectedCpmkForAssets}
                      onChange={(e) => setSelectedCpmkForAssets(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg font-bold"
                    >
                      <option value="">-- Acuan CPMK --</option>
                      {activeRps.cpmk.map((c, i) => (
                        <option key={i} value={c.code}>[{c.code}] {c.description.substring(0, 45)}...</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-600 mb-2">2. Level Kognitif Bloom:</label>
                    <select
                      value={bloomSelectValue}
                      onChange={(e) => setBloomSelectValue(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg"
                    >
                      <option value="C1">C1 - Mengingat / Menghafal</option>
                      <option value="C2">C2 - Memahami / Menjelaskan</option>
                      <option value="C3">C3 - Menerapkan / Solusi Teknis</option>
                      <option value="C4">C4 - Menganalisis / Membedakan</option>
                      <option value="C5">C5 - Mengevaluasi / Kritik Model</option>
                      <option value="C6">C6 - Menciptakan (Proyek Akhir)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-600 mb-2">3. Jenis Evaluasi:</label>
                    <select
                      value={assetTypeSelect}
                      onChange={(e) => setAssetTypeSelect(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg"
                    >
                      <option value="QUIZ">QUIZ (Ujian Kecil)</option>
                      <option value="TUGAS">TUGAS MANDIRI / GROUP</option>
                      <option value="UTS">UJIAN TENGAH SEMESTER (UTS)</option>
                      <option value="UAS">UJIAN AKHIR SEMESTER (UAS)</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="btn-gen-soal"
                      onClick={() => handleAIAssetGeneration("bank-soal")}
                      disabled={isGeneratingAssets}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-3 rounded-lg shadow-sm transition-colors text-xs"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>AI Gen Soal</span>
                    </button>
                    <button
                      id="btn-gen-tugas"
                      onClick={() => handleAIAssetGeneration("rencana-tugas")}
                      disabled={isGeneratingAssets}
                      className="inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white p-2.5 rounded-lg border border-sky-600"
                      title="AI Gen Rencana Tugas"
                    >
                      <Award className="h-4 w-4" />
                    </button>
                    <button
                      id="btn-gen-ujian"
                      onClick={() => handleAIAssetGeneration("rencana-ujian")}
                      disabled={isGeneratingAssets}
                      className="inline-flex items-center justify-center bg-violet-500 hover:bg-violet-600 text-white p-2.5 rounded-lg border border-violet-600"
                      title="AI Gen Rencana Ujian"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Asset Results displaying from real db items filtered by Course code/context */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bank Soal list */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h4 className="font-sans font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-sm">
                    <BookMarked className="h-4.5 w-4.5 text-purple-600" />
                    <span>Bank Soal Kompetensi ({questions.filter(q => q.cpmkCode.startsWith("CPMK")).length})</span>
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
                    {questions.length === 0 ? (
                      <div className="text-slate-400 py-4 text-center">Soal belum terbuat. Gunakan generator di atas.</div>
                    ) : (
                      questions.map(q => (
                        <div key={q.id} className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-1.5 hover:shadow-xs transition-shadow">
                          <div className="flex justify-between font-mono text-[9px] font-bold">
                            <span className="text-sky-600">{q.cpmkCode}</span>
                            <span className="text-amber-600">{q.bloomLevel} | {q.type}</span>
                          </div>
                          <p className="font-sans text-slate-900 font-semibold">{q.question}</p>
                          <div className="bg-white p-2 rounded border border-slate-100 mt-1">
                            <strong className="text-slate-400 block text-[9px] font-mono leading-none tracking-wider uppercase mb-1">Ekspektasi Kunci Jawaban:</strong>
                            <p className="text-slate-600 line-clamp-3 leading-relaxed">{q.answerKey}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Rencana Tugas list */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h4 className="font-sans font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-sm">
                    <Award className="h-4.5 w-4.5 text-sky-600" />
                    <span>Rencana Tugas OBE ({tasks.length})</span>
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
                    {tasks.length === 0 ? (
                      <div className="text-slate-400 py-4 text-center">Rencana tugas belum dirumuskan.</div>
                    ) : (
                      tasks.map(t => (
                        <div key={t.id} className="bg-sky-50/40 border border-sky-100 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center bg-sky-100/50 p-1.5 rounded text-[10px] font-mono font-bold leading-none text-sky-700">
                            <span>{t.cpmkCode}</span>
                            <span>Bobot: {t.weight}%</span>
                          </div>
                          <h5 className="font-bold text-slate-900">{t.name}</h5>
                          <div>
                            <strong className="text-slate-400 text-[10px] block leading-none mb-1 font-mono uppercase">Sasaran Tugas:</strong>
                            <p className="text-slate-700 leading-relaxed font-sans">{t.objective}</p>
                          </div>
                          <div className="border-t border-sky-100/50 pt-1.5 text-slate-500 italic text-[10px]">
                            {t.rubric}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Rencana Ujian (Kisi-kisi) */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h4 className="font-sans font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5 text-sm">
                    <HelpCircle className="h-4.5 w-4.5 text-violet-600" />
                    <span>Rancangan Kisi-kisi Ujian ({exams.length})</span>
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
                    {exams.length === 0 ? (
                      <div className="text-slate-400 py-4 text-center">Kisi-kisi UTS/UAS kosong.</div>
                    ) : (
                      exams.map(e => (
                        <div key={e.id} className="bg-violet-50/30 border border-violet-100 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-[10px] font-mono font-bold text-violet-750">
                            <span>CPMK: {e.cpmkCode}</span>
                            <span className="uppercase">{e.type} | {e.weight}%</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{e.kisiKisi}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ============================================== */}
          {/* BOTTOM ACTIONS BAR & EXPORT PREVIEW DRAWER   */}
          {/* ============================================== */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-sans font-bold text-white text-base">Cetak Rencana Pembelajaran Berstandar DIKTI</h4>
              <p className="text-xs text-slate-400">Ekspor berkas pembelajaran lengkap hasil asuhan digital Anda ke berbagai format terstruktur.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                id="btn-export-excel"
                onClick={downloadAsExcelCSV}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs px-4 py-3 rounded-lg border border-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <FileDown className="h-4.5 w-4.5 text-emerald-400" />
                <span>Format Excel (CSV)</span>
              </button>

              <button
                id="btn-export-word"
                onClick={downloadAsWordDoc}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs px-4 py-3 rounded-lg border border-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <FileDown className="h-4.5 w-4.5 text-sky-400" />
                <span>Format Word (DOC)</span>
              </button>

              <button
                id="btn-export-pdf"
                onClick={handleTriggerPrintPDF}
                className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-3 rounded-lg shadow-md hover:shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Printer className="h-4.5 w-4.5" />
                <span>Cetak PDF Cetakan Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* HISTORIC SNAPSHOTS DRAWER / SIDE PANEL        */}
      {/* ============================================== */}
      {isHistoryOpen && activeRps && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in text-slate-805">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Kronologi Perubahan RPS (Versioning)</h3>
                <p className="text-[11px] text-slate-500">Log perubahan dan audit state transaksional.</p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {versions.filter(v => v.rpsId === activeRps.id).length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-xs">Belum ada snapshot historis pencatatan.</div>
              ) : (
                versions.filter(v => v.rpsId === activeRps.id).map((v) => (
                  <div key={v.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-sky-600">Draft Versi: v{v.version}</span>
                      <span className="text-[10px] text-slate-400">{new Date(v.timestamp).toLocaleString("id-ID")}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Penyunting: </span>
                      <span className="font-semibold text-slate-900">{v.editorName}</span>
                    </div>
                    <div className="bg-white p-2 border border-slate-150 rounded text-[11px] text-slate-650 leading-relaxed font-mono">
                      {v.meta}
                    </div>
                    <button
                      onClick={() => {
                        try {
                          const restored = JSON.parse(v.data);
                          setActiveRps(restored);
                          alert(`Berhasil merestorasi tampilan visual rps ke Versi ${v.version}! Harap klik Simpan untuk memperbarui database.`);
                        } catch(err) {
                          alert("Gagal merestorasi versi.");
                        }
                      }}
                      className="text-[10px] font-bold text-sky-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Kembalikan ke versi ini</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 text-center">
              <span className="text-[10px] font-mono text-slate-400">Standard audit trail v1.1.2 enabled</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
