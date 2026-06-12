/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileCode, 
  Map, 
  Settings, 
  Compass, 
  Activity, 
  ChevronsRight, 
  BookMarked,
  Layers,
  Sparkles
} from "lucide-react";

export default function DocPanel() {
  const [activeSubTab, setActiveSubTab] = useState<"architecture" | "usecase" | "activity" | "sequence" | "class" | "openapi">("architecture");

  return (
    <div className="space-y-6 text-slate-800">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCode className="h-6 w-6 text-indigo-600" />
          <span>Arsitektur Sistem & Spesifikasi UML Portal RPS OBE</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Dokumentasi formal, diagram arsitektur, dan model relasional database untuk standardisasi kurikulum nasional Outcome-Based Education (OBE).
        </p>
      </div>

      {/* Selector Sub tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap">
        {[
          { id: "architecture", label: "Prinsip Utama OBE" },
          { id: "usecase", label: "1. Use Case Diagram" },
          { id: "activity", label: "2. Activity Diagram" },
          { id: "sequence", label: "3. Sequence Diagram" },
          { id: "class", label: "4. Class Diagram ERD" },
          { id: "openapi", label: "OpenAPI endpoints Specification" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all duration-150 ${
              activeSubTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OBE PRINCIPLES */}
      {activeSubTab === "architecture" && (
        <div className="space-y-6 animate-fade-in font-sans leading-relaxed">
          <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
            <div className="bg-indigo-600 text-white p-3 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Metodologi Outcome-Based Education (OBE)</h3>
              <p className="text-slate-650 text-xs mt-1">
                Outcome-Based Education adalah pendekatan kurikulum yang berfokus pada apa yang mahasiswa dapat lakukan secara nyata di akhir masa studi mereka. Bukan sekadar apa yang diajarkan, melainkan **capaian hasil pembelajaran** yang dikukur secara empiris.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Layers className="h-4.5 w-4.5 text-sky-500" />
                <span>CPL (Capaian Pembelajaran Lulusan)</span>
              </div>
              <p className="text-xs text-slate-500">
                Standar kompetensi lulusan prodi yang ditargetkan untuk menyelaraskan kurikulum dengan keahlian industri, etika profesi, dan sains teoritik.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Compass className="h-4.5 w-4.5 text-emerald-500" />
                <span>CPMK (Capaian Pembelajaran MK)</span>
              </div>
              <p className="text-xs text-slate-500">
                Breakdown rinci dari CPL umum ke dalam ruang lingkup keilmuan spesifik mata kuliah yang diajarkan, didukung Taksonomi kognitif Bloom.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <BookMarked className="h-4.5 w-4.5 text-violet-500" />
                <span>Asesmen Terukur Berkelanjutan</span>
              </div>
              <p className="text-xs text-slate-500">
                Evaluasi tugas, UTS, UAS, atau portofolio project yang dihubungkan langsung ke kode CPMK, memastikan keabsahan kelulusan target OBE.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USE CASE DIAGRAM */}
      {activeSubTab === "usecase" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in text-center">
          <div className="text-left">
            <h3 className="font-bold text-slate-900 text-sm">UML Use Case Diagram - Portal RPS OBE</h3>
            <p className="text-xs text-slate-500 mt-1">Interaksi Aktor (Admin, Dosen, Kaprodi) dengan fungsionalitas utama sistem.</p>
          </div>

          <div className="inline-block bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* SVG USE CASE */}
            <svg width="650" height="420" viewBox="0 0 650 420" className="mx-auto max-w-full">
              {/* Actor Dosen */}
              <g transform="translate(50, 180)">
                <circle cx="30" cy="20" r="15" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
                <line x1="30" y1="35" x2="30" y2="75" stroke="#0284c7" strokeWidth="2" />
                <line x1="10" y1="45" x2="50" y2="45" stroke="#0284c7" strokeWidth="2" />
                <line x1="30" y1="75" x2="15" y2="105" stroke="#0284c7" strokeWidth="2" />
                <line x1="30" y1="75" x2="45" y2="105" stroke="#0284c7" strokeWidth="2" />
                <text x="30" y="125" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0369a1">Aktor Dosen</text>
              </g>

              {/* Actor Kaprodi */}
              <g transform="translate(560, 180)">
                <circle cx="30" cy="20" r="15" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                <line x1="30" y1="35" x2="30" y2="75" stroke="#d97706" strokeWidth="2" />
                <line x1="10" y1="45" x2="50" y2="45" stroke="#d97706" strokeWidth="2" />
                <line x1="30" y1="75" x2="15" y2="105" stroke="#d97706" strokeWidth="2" />
                <line x1="30" y1="75" x2="45" y2="105" stroke="#d97706" strokeWidth="2" />
                <text x="30" y="125" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#b45309">Aktor Kaprodi</text>
              </g>

              {/* Boundary System */}
              <rect x="180" y="20" width="280" height="380" rx="12" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
              <text x="320" y="40" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b" letterSpacing="1">PORTAL SYSTEM RPS OBE</text>

              {/* Use Cases */}
              {/* UC 1: Auth */}
              <g transform="translate(320, 80)">
                <ellipse cx="0" cy="0" rx="90" ry="22" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#334155">Masuk & Kredensial</text>
              </g>

              {/* UC 2: Drafting */}
              <g transform="translate(320, 150)">
                <ellipse cx="0" cy="0" rx="90" ry="22" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#5b21b6">Penyusunan RPS & CPMK</text>
              </g>

              {/* UC 3: AI Assistant */}
              <g transform="translate(320, 220)">
                <ellipse cx="0" cy="0" rx="90" ry="22" fill="#faf5ff" stroke="#a21caf" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#701a75">Generasi AI Gemini (OBE)</text>
              </g>

              {/* UC 4: Validation */}
              <g transform="translate(320, 290)">
                <ellipse cx="0" cy="0" rx="90" ry="22" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#14532d">Validasi & Verifikasi RPS</text>
              </g>

              {/* UC 5: Export */}
              <g transform="translate(320, 360)">
                <ellipse cx="0" cy="0" rx="90" ry="22" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#0c4a6e">Ekspor PDF, Excel, Word</text>
              </g>

              {/* Interaction Lines */}
              {/* Dosen connections */}
              <line x1="110" y1="210" x2="230" y2="85" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="3" />
              <line x1="110" y1="220" x2="230" y2="150" stroke="#0284c7" strokeWidth="1.2" />
              <line x1="110" y1="230" x2="230" y2="220" stroke="#0284c7" strokeWidth="1.2" />
              <line x1="110" y1="240" x2="230" y2="360" stroke="#0284c7" strokeWidth="1.2" />

              {/* Kaprodi connections */}
              <line x1="550" y1="210" x2="410" y2="85" stroke="#d97706" strokeWidth="1.2" strokeDasharray="3" />
              <line x1="550" y1="230" x2="410" y2="290" stroke="#d97706" strokeWidth="1.2" />
              <line x1="550" y1="240" x2="410" y2="360" stroke="#d97706" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVITY DIAGRAM */}
      {activeSubTab === "activity" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in text-center">
          <div className="text-left">
            <h3 className="font-bold text-slate-900 text-sm">UML Activity Diagram - Penyusunan RPS OBE</h3>
            <p className="text-xs text-slate-550 mt-1">Mengilustrasikan aliran proses penulisan RPS oleh Dosen hingga divalidasi Kaprodi.</p>
          </div>

          <div className="inline-block bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* SVG ACTIVITY */}
            <svg width="600" height="400" viewBox="0 0 600 400" className="mx-auto max-w-full">
              {/* Start Node */}
              <circle cx="300" cy="20" r="10" fill="#1e293b" />

              {/* Arrow and Action 1 */}
              <line x1="300" y1="30" x2="300" y2="60" stroke="#475569" strokeWidth="1.5" />
              <rect x="210" y="60" width="180" height="35" rx="8" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <text x="300" y="81" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#0f172a">Dosen pilih Mata Kuliah & CPL</text>

              {/* Arrow and Action 2 */}
              <line x1="300" y1="95" x2="300" y2="125" stroke="#475569" strokeWidth="1.5" />
              <rect x="210" y="125" width="180" height="35" rx="8" fill="#faf5ff" stroke="#a21caf" strokeWidth="1.5" />
              <text x="300" y="146" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#701a75">Gemini AI Formulasi Sesi & CPMK</text>

              {/* Arrow and Decision */}
              <line x1="300" y1="160" x2="300" y2="195" stroke="#475569" strokeWidth="1.5" />
              <polygon points="300,195 330,215 300,235 270,215" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
              <text x="345" y="218" fontSize="9" fontWeight="semibold" fill="#64748b">Apakah Sesuai?</text>

              {/* Reposition loop line to Action 1 if not sesuai */}
              <path d="M 270 215 L 150 215 L 150 78 L 210 78" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="3" />
              <text x="120" y="140" fontSize="9" fontWeight="semibold" fill="#e11d48">Tidak (Ubah/Regen)</text>

              {/* Arrow and Action 3 (Sesuai) */}
              <line x1="300" y1="235" x2="300" y2="265" stroke="#475569" strokeWidth="1.5" />
              <text x="310" y="252" fontSize="9" fontWeight="semibold" fill="#16a34a">Ya (Kirim)</text>
              <rect x="210" y="265" width="180" height="35" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
              <text x="300" y="286" textAnchor="middle" fontSize="10" fontWeight="semibold" fill="#14532d">Kaprodi Menilai Detail RPS</text>

              {/* Arrow and Decision 2 */}
              <line x1="300" y1="300" x2="300" y2="330" stroke="#475569" strokeWidth="1.5" />
              <polygon points="300,330 330,345 300,360 270,345" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
              <text x="345" y="348" fontSize="9" fontWeight="semibold" fill="#64748b">Disetujui?</text>

              {/* Loop to edit if rejected */}
              <path d="M 270 345 L 80 345 L 80 142 L 210 142" fill="none" stroke="#e11d48" strokeWidth="1.5" />
              <text x="45" y="250" fontSize="9" fontWeight="semibold" fill="#e11d48">Revisi</text>

              {/* End Node */}
              <line x1="300" y1="360" x2="300" y2="385" stroke="#475569" strokeWidth="1.5" />
              <circle cx="300" cy="385" r="8" fill="none" stroke="#1e293b" strokeWidth="2" />
              <circle cx="300" cy="385" r="4" fill="#1e293b" />
            </svg>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SEQUENCE DIAGRAM */}
      {activeSubTab === "sequence" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in text-center">
          <div className="text-left">
            <h3 className="font-bold text-slate-900 text-sm">UML Sequence Diagram - Generasi RPS via Gemini API</h3>
            <p className="text-xs text-slate-550 mt-1">Interaksi sekuensial antar entitas Frontend, Backend Server, Database, dan Google GenAI.</p>
          </div>

          <div className="inline-block bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* SVG SEQUENCE */}
            <svg width="600" height="400" viewBox="0 0 600 400" className="mx-auto max-w-full">
              {/* Actors lifelines */}
              <line x1="80" y1="40" x2="80" y2="360" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4" />
              <line x1="240" y1="40" x2="240" y2="360" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4" />
              <line x1="400" y1="40" x2="400" y2="360" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4" />
              <line x1="540" y1="40" x2="540" y2="360" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4" />

              {/* Titles of objects */}
              <rect x="30" y="10" width="100" height="30" rx="4" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
              <text x="80" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">Dosen (Client)</text>

              <rect x="190" y="10" width="100" height="30" rx="4" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
              <text x="240" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0369a1">Express Server</text>

              <rect x="350" y="10" width="100" height="30" rx="4" fill="#faf5ff" stroke="#a21caf" strokeWidth="1.5" />
              <text x="400" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#701a75">Gemini AI Client</text>

              <rect x="490" y="10" width="100" height="30" rx="4" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
              <text x="540" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#14532d">Database / JSON</text>

              {/* Msg 1: Request from Dosen */}
              <line x1="80" y1="80" x2="230" y2="80" stroke="#000" strokeWidth="1.2" />
              <polygon points="240,80 230,76 230,84" fill="#000" />
              <text x="160" y="74" textAnchor="middle" fontSize="9" fill="#000">1. Klik "Generate RPS"</text>

              {/* Msg 2: Server constructs prompt */}
              <line x1="240" y1="120" x2="390" y2="120" stroke="#4a044e" strokeWidth="1.2" />
              <polygon points="400,120 390,116 390,124" fill="#4a044e" />
              <text x="320" y="114" textAnchor="middle" fontSize="9" fill="#4a044e">2. Kirim parameter prompt</text>

              {/* Msg 3: Gemini processes & returns CPL-related JSON */}
              <line x1="400" y1="170" x2="250" y2="170" stroke="#4a044e" strokeWidth="1.2" strokeDasharray="3" />
              <polygon points="240,170 250,166 250,174" fill="#4a044e" />
              <text x="320" y="164" textAnchor="middle" fontSize="9" fill="#4a044e">3. Kembalikan Berkas JSON</text>

              {/* Msg 4: Server write to database */}
              <line x1="240" y1="220" x2="530" y2="220" stroke="#14532d" strokeWidth="1.2" />
              <polygon points="540,220 530,216 530,224" fill="#14532d" />
              <text x="390" y="214" textAnchor="middle" fontSize="9" fill="#14532d">4. Autosave draf instan (v1)</text>

              {/* Msg 5: Database returns saved record confirmation */}
              <line x1="540" y1="260" x2="250" y2="260" stroke="#14532d" strokeWidth="1.2" strokeDasharray="3" />
              <polygon points="240,260 250,256 250,264" fill="#14532d" />
              <text x="390" y="254" textAnchor="middle" fontSize="9" fill="#14532d">5. Sukses Simpan</text>

              {/* Msg 6: Send back to Dosen component */}
              <line x1="240" y1="310" x2="90" y2="310" stroke="#000" strokeWidth="1.2" strokeDasharray="3" />
              <polygon points="80,310 90,306 90,314" fill="#000" />
              <text x="160" y="304" textAnchor="middle" fontSize="9" fill="#000">6. Render Visual ke Table</text>
            </svg>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CLASS DIAGRAM / RELATIONAL ERD */}
      {activeSubTab === "class" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in text-center">
          <div className="text-left">
            <h3 className="font-bold text-slate-900 text-sm">UML Class Diagram & ERD - Struktur Basis Data</h3>
            <p className="text-xs text-slate-550 mt-1">Menggambarkan relasi data antar User, Kurikulum CPL, Mata Kuliah, Plotting Mengajar, dan Rencana OBE (RPS).</p>
          </div>

          <div className="inline-block bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* SVG CLASS DIAGRAM */}
            <svg width="650" height="380" viewBox="0 0 650 380" className="mx-auto max-w-full">
              {/* Box 1: User Class */}
              <g transform="translate(20, 20)">
                <rect width="160" height="110" rx="6" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                <rect width="160" height="25" rx="6" fill="#64748b" />
                <text x="80" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">User (Staf Dosen/Admin)</text>
                <text x="10" y="42" fontSize="9" fontFamily="monospace" fill="#334155">+ id: uuid [PK]</text>
                <text x="10" y="55" fontSize="9" fontFamily="monospace" fill="#334155">+ username: string</text>
                <text x="10" y="68" fontSize="9" fontFamily="monospace" fill="#334155">+ email: string</text>
                <text x="10" y="81" fontSize="9" fontFamily="monospace" fill="#334155">+ role: UserRole</text>
                <text x="10" y="94" fontSize="9" fontFamily="monospace" fill="#334155">+ isActive: boolean</text>
              </g>

              {/* Box 2: Course Class */}
              <g transform="translate(260, 20)">
                <rect width="180" height="110" rx="6" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                <rect width="180" height="25" rx="6" fill="#0284c7" />
                <text x="90" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">Course (Mata Kuliah)</text>
                <text x="10" y="42" fontSize="9" fontFamily="monospace" fill="#334155">+ id: uuid [PK]</text>
                <text x="10" y="55" fontSize="9" fontFamily="monospace" fill="#334155">+ code: string [Unique]</text>
                <text x="10" y="68" fontSize="9" fontFamily="monospace" fill="#334155">+ name: string</text>
                <text x="10" y="81" fontSize="9" fontFamily="monospace" fill="#334155">+ sks: integer</text>
                <text x="10" y="94" fontSize="9" fontFamily="monospace" fill="#334155">+ cplIds: array_uuid [FK]</text>
              </g>

              {/* Box 3: CPL Class */}
              <g transform="translate(480, 20)">
                <rect width="150" height="110" rx="6" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2" />
                <rect width="150" height="25" rx="6" fill="#16a34a" />
                <text x="75" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">CPL (Capaian Mutu)</text>
                <text x="10" y="42" fontSize="9" fontFamily="monospace" fill="#334155">+ id: uuid [PK]</text>
                <text x="10" y="55" fontSize="9" fontFamily="monospace" fill="#334155">+ code: string</text>
                <text x="10" y="68" fontSize="9" fontFamily="monospace" fill="#334155">+ description: text</text>
                <text x="10" y="81" fontSize="9" fontFamily="monospace" fill="#334155">+ category: string</text>
                <text x="10" y="94" fontSize="9" fontFamily="monospace" fill="#334155">+ isActive: boolean</text>
              </g>

              {/* Box 4: Plotting Class */}
              <g transform="translate(20, 200)">
                <rect width="160" height="110" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                <rect width="160" height="25" rx="6" fill="#d97706" />
                <text x="80" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">LecturerAssignment (Plotting)</text>
                <text x="10" y="42" fontSize="9" fontFamily="monospace" fill="#334155">+ id: uuid [PK]</text>
                <text x="10" y="55" fontSize="9" fontFamily="monospace" fill="#334155">+ lecturerId: uuid [FK]</text>
                <text x="10" y="68" fontSize="9" fontFamily="monospace" fill="#334155">+ courseId: uuid [FK]</text>
                <text x="10" y="81" fontSize="9" fontFamily="monospace" fill="#334155">+ periodId: uuid [FK]</text>
              </g>

              {/* Box 5: RPS (Rencana Pembelajaran Semester) Class */}
              <g transform="translate(260, 200)">
                <rect width="370" height="150" rx="6" fill="#faf5ff" stroke="#a21caf" strokeWidth="2" />
                <rect width="370" height="25" rx="6" fill="#a21caf" />
                <text x="185" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">RPS (Rencana Pembelajaran Semester OBE)</text>
                <text x="10" y="42" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ id: uuid [PK] | courseId: uuid [FK]</text>
                <text x="10" y="55" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ courseName: string | courseCode: string</text>
                <text x="10" y="68" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ sks: integer | jumlah_pertemuan: integer</text>
                <text x="10" y="81" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ status: "DRAFT" | "MENUGGU_VALIDASI" | "DISETUJUI"</text>
                <text x="10" y="94" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ cpmk: Array&lt;CPMK&gt; {"{ code, description, linkedCplCode }"}</text>
                <text x="10" y="107" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ materi_pembelajaran: Array&lt;Meeting&gt; {"{ pertemuan, topik, metode ... }"}</text>
                <text x="10" y="120" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ rubrik: Array&lt;RubrikKriteria&gt; {"{ kriteria, sangatBaik, kurang ... }"}</text>
                <text x="10" y="133" fontSize="9" fontFamily="monospace" fill="#5b21b6">+ version: integer | notes: string (Kaprodi feedback)</text>
              </g>

              {/* Connections with notation formatting */}
              {/* User 1 --- * Plotting */}
              <line x1="100" y1="130" x2="100" y2="200" stroke="#475569" strokeWidth="1.5" />
              <text x="88" y="150" fontSize="8" fill="#475569">1</text>
              <text x="88" y="190" fontSize="8" fill="#475569">*</text>

              {/* Course 1 --- * Plotting */}
              <line x1="260" y1="75" x2="180" y2="255" stroke="#475569" strokeWidth="1.2" strokeDasharray="2" />

              {/* Course 1 --- 1 RPS */}
              <line x1="350" y1="130" x2="350" y2="200" stroke="#0284c7" strokeWidth="1.5" />
              <text x="338" y="152" fontSize="8" fill="#0284c7">1</text>
              <text x="338" y="192" fontSize="8" fill="#0284c7">1</text>

              {/* Course * --- * CPL (N:M relation mapping via cplIds array) */}
              <line x1="440" y1="75" x2="480" y2="75" stroke="#16a34a" strokeWidth="1.5" />
              <text x="445" y="68" fontSize="8" fill="#16a34a">*</text>
              <text x="470" y="68" fontSize="8" fill="#16a34a">*</text>

            </svg>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OPENAPI SPEC */}
      {activeSubTab === "openapi" && (
        <div className="bg-slate-900 rounded-xl p-5 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-lg space-y-4 max-h-[480px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-[10px] text-sky-400 font-bold tracking-widest leading-none uppercase">API REST SUITE STANDARD / SPECIFICATION</span>
            <span className="text-[9px] text-slate-500">OPENAPI 3.0.0</span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-emerald-400 font-bold">GET</span> <span className="text-white font-semibold">/api/master/users</span>
              <p className="text-slate-450 text-[10px] pl-4 mt-0.5">// List database users, roles, password defaults and security parameters.</p>
            </div>

            <div>
              <span className="text-emerald-400 font-bold">GET</span> <span className="text-white font-semibold">/api/master/periods</span>
              <p className="text-slate-450 text-[10px] pl-4 mt-0.5">// Retrieve state-level academic periods (Ganjil/Genap) including toggling status.</p>
            </div>

            <div>
              <span className="text-emerald-400 font-bold">GET</span> <span className="text-white font-semibold">/api/master/cpl</span>
              <p className="text-slate-450 text-[10px] pl-4 mt-0.5">// List or query structural Capaian CPL for technical outcome mapping.</p>
            </div>

            <div>
              <span className="text-amber-500 font-bold">POST</span> <span className="text-white font-semibold">/api/gemini/generate-rps</span>
              <p className="text-slate-455 text-[10px] pl-4 mt-0.5">// Main pipeline connecting Google GenAI client inside server.ts with strict prompt templates.</p>
              <div className="pl-6 text-slate-500 bg-slate-950 p-2 rounded mt-1 max-w-lg">
                <strong>Payload:</strong> {"{ courseName: string, sks: number, jumlahPertemuan: number, selectedCPL: [] }"}
              </div>
            </div>

            <div>
              <span className="text-amber-500 font-bold">POST</span> <span className="text-white font-semibold">/api/gemini/regenerate-section</span>
              <p className="text-slate-455 text-[10px] pl-4 mt-0.5">// Sub-Regenerate pipeline targeting cpmk, materi, rubrik or references exclusively.</p>
            </div>

            <div>
              <span className="text-amber-500 font-bold">POST</span> <span className="text-white font-semibold">/api/gemini/generate-questions</span>
              <p className="text-slate-455 text-[10px] pl-4 mt-0.5">// AI questions generation based on competency criteria and target Bloom Levels.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
