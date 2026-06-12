/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { 
  UserRole, 
  User, 
  AcademicPeriod, 
  BloomVerb, 
  LearningMethod, 
  AssessmentType, 
  CPL, 
  Course, 
  LecturerAssignment, 
  RPS, 
  RPSVersion,
  AuditLog,
  QuestionItem,
  TaskPlan,
  ExamPlan
} from "./src/types.js";

dotenv.config();

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
app.use(express.json());
const PORT = 3005;

// ==========================================
// SIMULATED DATABASE INTEGRATION (IN-MEMORY)
// ==========================================

const INITIAL_USERS: User[] = [
  { id: "usr-1", username: "admin", name: "Rizky Ramadhan, M.T.", email: "admin@unive.ac.id", role: UserRole.ADMIN, isActive: true, createdAt: "2026-06-01" },
  { id: "usr-2", username: "kaprodi", name: "Prof. Dr. Ir. H. Ahmad Fauzi", email: "yusuflust365@gmail.com", role: UserRole.KAPRODI, isActive: true, createdAt: "2026-06-01" }, // Defaulted to user email from rules
  { id: "usr-3", username: "dosen1", name: "Dr. Maria Ulfa, S.Kom., M.Cs.", email: "maria.ulfa@unive.ac.id", role: UserRole.DOSEN, isActive: true, createdAt: "2026-06-02" },
  { id: "usr-4", username: "dosen2", name: "Budi Santoso, M.Kom.", email: "budi@unive.ac.id", role: UserRole.DOSEN, isActive: true, createdAt: "2026-06-02" },
];

const INITIAL_PERIODS: AcademicPeriod[] = [
  { id: "prd-1", year: "2025/2026", semester: "GANJIL", isActive: true },
  { id: "prd-2", year: "2024/2025", semester: "GENAP", isActive: false },
];

const INITIAL_BLOOM: BloomVerb[] = [
  { id: "bl-1", level: "C1", verba: ["Mengingat", "Menyebutkan", "Menunjukkan", "Menuliskan", "Menghafal"], description: "Kemampuan memanggil kembali memori tentang informasi." },
  { id: "bl-2", level: "C2", verba: ["Memahami", "Menjelaskan", "Mengidentifikasi", "Mengonversi", "Menguraikan"], description: "Kemampuan memahami arti, makna, dan menginterpretasi data." },
  { id: "bl-3", level: "C3", verba: ["Menerapkan", "Menggunakan", "Mengimplementasikan", "Menghitung", "Membuat"], description: "Kemampuan memilah dan menggunakan konsep di situasi baru." },
  { id: "bl-4", level: "C4", verba: ["Menganalisis", "Membandingkan", "Membedakan", "Memecahkan", "Menguji"], description: "Kemampuan memecah informasi menjadi kompenen detail." },
  { id: "bl-5", level: "C5", verba: ["Mengevaluasi", "Menilai", "Mengkritik", "Memilih", "Memvalidasi"], description: "Kemampuan membuat penilaian berdasarkan kriteria internal/eksternal." },
  { id: "bl-6", level: "C6", verba: ["Menciptakan", "Merancang", "Membangun", "Membuat", "Memformulasikan"], description: "Kemampuan menyusun komponen baru menjadi struktur yang unik." },
];

const INITIAL_METHODS: LearningMethod[] = [
  { id: "met-1", name: "Case Method", description: "Pembelajaran berbasis kasus nyata, berdiskusi dan mengambil keputusan." },
  { id: "met-2", name: "Project Based Learning (PjBL)", description: "Pembelajaran berbasis proyek kolaboratif untuk menghasilkan produk/solusi nyata." },
  { id: "met-3", name: "Problem Based Learning (PBL)", description: "Pembelajaran dimulai dengan masalah kompleks terstruktur untuk mengarahkan kajian." },
  { id: "met-4", name: "Ceramah & Diskusi", description: "Penyampaian teori interaktif didampingi sesi tanya jawab mendalam." },
  { id: "met-5", name: "Cooperative Learning", description: "Kelompok belajar kecil untuk saling bekerja sama menyelesaikan kompetensi." },
  { id: "met-6", name: "Praktikum Mandiri", description: "Eksperimen tatap muka langsung di laboratorium computer/lapangan." },
];

const INITIAL_ASSESSMENT_TYPES: AssessmentType[] = [
  { id: "as-1", name: "Tugas Mandiri / Studi Kasus", description: "Analisis solusi dari studi kasus yang diberikan dosen.", defaultWeight: 15 },
  { id: "as-2", name: "Project Akhir", description: "Pembuatan prototipe software, desain arsitektur, atau studi lengkap.", defaultWeight: 30 },
  { id: "as-3", name: "Quiz / Ujian Kecil", description: "Evaluasi teori berkala.", defaultWeight: 10 },
  { id: "as-4", name: "Ujian Tengah Semester (UTS)", description: "Evaluasi capaian pembelajaran setengah semester pertama.", defaultWeight: 20 },
  { id: "as-5", name: "Ujian Akhir Semester (UAS)", description: "Evaluasi capaian pembelajaran akhir semester.", defaultWeight: 25 },
];

const INITIAL_CPL: CPL[] = [
  { id: "cpl-1", code: "CPL-01", description: "Mampu menerapkan prinsip keagamaan, etika profesi, dan tanggung jawab moral dalam kehidupan bermasyarakat dan bernegara.", category: "Sikap", isActive: true },
  { id: "cpl-2", code: "CPL-02", description: "Mampu menjelaskan konsep dasar rekayasa perangkat lunak, algoritma, serta teknologi komputer mutakhir secara sistematis.", category: "Pengetahuan", isActive: true },
  { id: "cpl-3", code: "CPL-03", description: "Mampu merancang dan menganalisis solusi algoritma yang efektif, efisien, dan andal berdasarkan spesifikasi perangkat lunak modern.", category: "Keterampilan Khusus", isActive: true },
  { id: "cpl-4", code: "CPL-04", description: "Mampu bekerja sama dalam tim lintas disiplin, berkomunikasi secara asertif, dan beradaptasi terhadap perubahan metodologi teknologi informasi.", category: "Keterampilan Umum", isActive: true },
];

const INITIAL_COURSES: Course[] = [
  { id: "crs-1", code: "INF-201", name: "Rekayasa Perangkat Lunak (Software Engineering)", sks: 3, semester: 4, curriculum: "Kurikulum Merdeka OBE 2024", cplIds: ["cpl-2", "cpl-3"] },
  { id: "crs-2", code: "INF-202", name: "Desain dan Analisis Algoritma", sks: 4, semester: 3, curriculum: "Kurikulum Merdeka OBE 2024", cplIds: ["cpl-3"] },
  { id: "crs-3", code: "INF-301", name: "Kecerdasan Buatan (Artificial Intelligence)", sks: 3, semester: 5, curriculum: "Kurikulum Merdeka OBE 2024", cplIds: ["cpl-2", "cpl-3"] },
  { id: "crs-4", code: "INF-401", name: "Pemrograman Web Lanjut (Full-Stack Dev)", sks: 3, semester: 4, curriculum: "Kurikulum Merdeka OBE 2024", cplIds: ["cpl-3", "cpl-4"] },
];

const INITIAL_ASSIGNMENTS: LecturerAssignment[] = [
  { id: "asg-1", lecturerId: "usr-3", courseId: "crs-1", periodId: "prd-1" },
  { id: "asg-2", lecturerId: "usr-3", courseId: "crs-3", periodId: "prd-1" },
  { id: "asg-3", lecturerId: "usr-4", courseId: "crs-2", periodId: "prd-1" },
  { id: "asg-4", lecturerId: "usr-4", courseId: "crs-4", periodId: "prd-1" },
];

// Seeded RPS Data (Mock)
const INITIAL_RPS: RPS[] = [
  {
    id: "rps-1",
    courseId: "crs-1",
    courseName: "Rekayasa Perangkat Lunak (Software Engineering)",
    courseCode: "INF-201",
    sks: 3,
    jumlah_pertemuan: 8,
    cplIds: ["cpl-2", "cpl-3"],
    status: "DISETUJUI",
    cpmk: [
      { code: "CPMK-1", description: "Mahasiswa mampu menjelaskan prinsip, siklus hidup perangkat lunak (SDLC), dan paradigma pengembangan perangkat lunak modern.", linkedCplCode: "CPL-02" },
      { code: "CPMK-2", description: "Mahasiswa mampu menyusun dokumen kebutuhan spesifikasi (SRS) serta merancang arsitektur sistem berbasis diagram UML terukur.", linkedCplCode: "CPL-03" }
    ],
    sub_cpmk: [
      { code: "Sub-CPMK-1.1", description: "Mampu menjelaskan latar belakang krisis perangkat lunak beserta solusinya.", linkedCpmkCode: "CPMK-1" },
      { code: "Sub-CPMK-1.2", description: "Mampu menganalisis komparasi model SDLC (Waterfall, Agile, SCRUM) yang efisien.", linkedCpmkCode: "CPMK-1" },
      { code: "Sub-CPMK-2.1", description: "Mampu menyusun spesifikasi kebutuhan sistem fungsional dan non-fungsional dengan standard IEEE 830.", linkedCpmkCode: "CPMK-2" },
      { code: "Sub-CPMK-2.2", description: "Mampu membuat diagram UML (Use Case, Class, Sequence) secara runut.", linkedCpmkCode: "CPMK-2" }
    ],
    mapping_cpl_cpmk: [
      { cplCode: "CPL-02", cpmkCode: "CPMK-1" },
      { cplCode: "CPL-03", cpmkCode: "CPMK-2" }
    ],
    materi_pembelajaran: [
      { pertemuan: 1, topik: "Pengantar Rekayasa Perangkat Lunak", sub_topik: "Krisis software, pengertian RPL, perbedaan ilmu komputer vs RPL", cpmk: "CPMK-1", metode: "Ceramah & Diskusi", aktivitas_mahasiswa: "Mempelajari slide dan melakukan telaah krisis software dalam kelompok kecil.", indikator_penilaian: "Kelancaran argumentasi mendefinisikan krisis RPL.", asesmen: "Tanya Jawab Lisan" },
      { pertemuan: 2, topik: "Software Development Life Cycle (SDLC)", sub_topik: "Waterfall, Prototype, Spiral, Agile & Scrum", cpmk: "CPMK-1", metode: "Case Method", aktivitas_mahasiswa: "Menganalisis studi kasus startup yang menggunakan Scrum.", indikator_penilaian: "Ketepatan pemilihan metodologi SDLC.", asesmen: "Diskusi & Paper mini" },
      { pertemuan: 3, topik: "Analisis Kebutuhan Perangkat Lunak", sub_topik: "Kebutuhan fungsional & non-fungsional, elisitasi kebutuhan", cpmk: "CPMK-2", metode: "Case Method", aktivitas_mahasiswa: "Elisitasi kebutuhan untuk sistem pendaftaran online.", indikator_penilaian: "Ketajaman membedakan fungsional vs non-fungsional.", asesmen: "Draft SRS" },
      { pertemuan: 4, topik: "Spesifikasi IEEE 830", sub_topik: "Pembuatan dokumen SRS standar internasional", cpmk: "CPMK-2", metode: "Cooperative Learning", aktivitas_mahasiswa: "Bekerjasama menyusun Bab 2 & 3 dokumen SRS.", indikator_penilaian: "Kesesuaian format standar IEEE 830.", asesmen: "Tugas Kelompok SRS" },
      { pertemuan: 5, topik: "Pemodelan Berorientasi Objek - Use Case Diagram", sub_topik: "Aktor, Use Case dan Relasi Include/Extend", cpmk: "CPMK-2", metode: "Praktikum Mandiri", aktivitas_mahasiswa: "Menggambar use case UML di editor visual.", indikator_penilaian: "Kebenaran notasi relasi include & extend.", asesmen: "Laporan Praktikum" },
      { pertemuan: 6, topik: "Pemodelan Berorientasi Objek - Class Diagram", sub_topik: "Class, attribute, method, asosiasi, pewarisan", cpmk: "CPMK-2", metode: "Praktikum Mandiri", aktivitas_mahasiswa: "Menerjemahkan kode domain menjadi diagram kelas.", indikator_penilaian: "Keakuratan relasi kardinalitas model sistem.", asesmen: "Uji Kelas Diagram" },
      { pertemuan: 7, topik: "Ulasan UTS & Persiapan Proyek", sub_topik: "Refleksi capaian materi pertemuan 1-6", cpmk: "CPMK-1, CPMK-2", metode: "Ceramah & Diskusi", aktivitas_mahasiswa: "Review bersama dosen dan pemetaan bobot proyek lulusan.", indikator_penilaian: "Partisipasi diskusi kelas.", asesmen: "Quiz UTS" },
      { pertemuan: 8, topik: "Evaluasi Akhir RPS", sub_topik: "Presentasi rancangan final kebutuhan dan model system", cpmk: "CPMK-2", metode: "Project Based Learning (PjBL)", aktivitas_mahasiswa: "Mempresentasikan hasil proyek kelompok depan client/kelas.", indikator_penilaian: "Kelengkapan dan keandalan prototipe rancangan.", asesmen: "Presentasi Kelompok" }
    ],
    asesmen: [
      { name: "Tugas Mandiri / Studi Kasus", percentage: 20, cpmkCode: "CPMK-1", method: "Mini Paper & Draft SRS" },
      { name: "Project Akhir", percentage: 40, cpmkCode: "CPMK-2", method: "Dokumen SRS & Diagram UML Lengkap" },
      { name: "Ujian Akhir Semester (UAS)", percentage: 40, cpmkCode: "CPMK-1, CPMK-2", method: "Ujian Tertulis" }
    ],
    rubrik: [
      { kriteria: "Ketepatan Analisis Kebutuhan", sangatBaik: "Analisis super tajam, memisahkan fungsional/non-fungsional secara komprehensif tanpa cacat.", baik: "Analisis tajam, fungsional/non-fungsional terpisah rapi dengan minor typo.", cukup: "Menyebutkan kebutuhan dasar namun fungsional bercampur aduk.", kurang: "Gagal mendefinisikan fungsional dasar dari studi kasus." },
      { kriteria: "Kelengkapan Diagram UML", sangatBaik: "Semua diagram (Use case, class, sequence) tepat sesuai notasi standard UML 2.0 dan sinkron.", baik: "Diagram lengkap dengan sedikit kesalahan notasi pada relasi khusus.", cukup: "Hanya menyertakan use case diagram tanpa detail class diagram pendukung.", kurang: "Diagram acak-acakan tidak sesuai standar notasi." }
    ],
    referensi: [
      "Pressman, R. S. (2019). Software Engineering: A Practitioner's Approach. McGraw-Hill.",
      "Sommerville, I. (2018). Software Engineering. Addison-Wesley.",
      "IEEE Standard 830-1998 - Recommended Practice for Software Requirements Specifications."
    ],
    version: 1,
    notes: "Sudah divalidasi dan disesuaikan kurikulum OBE DIKTI.",
    updatedBy: "usr-2",
    updatedAt: "2026-06-11T12:00:00Z"
  }
];

// Memory databases
let dbUsers: User[] = [...INITIAL_USERS];
let dbPeriods: AcademicPeriod[] = [...INITIAL_PERIODS];
let dbBloom: BloomVerb[] = [...INITIAL_BLOOM];
let dbMethods: LearningMethod[] = [...INITIAL_METHODS];
let dbAssessmentTypes: AssessmentType[] = [...INITIAL_ASSESSMENT_TYPES];
let dbCPL: CPL[] = [...INITIAL_CPL];
let dbCourses: Course[] = [...INITIAL_COURSES];
let dbAssignments: LecturerAssignment[] = [...INITIAL_ASSIGNMENTS];
let dbRPS: RPS[] = [...INITIAL_RPS];
let dbVersions: RPSVersion[] = [];
let dbQuestions: QuestionItem[] = [
  { id: "q-1", cpmkCode: "CPMK-1", bloomLevel: "C2", type: "TUGAS", question: "Jelaskan perbedaan mendasar antara model SDLC Waterfall dengan model Agile/Scrum, serta berikan kondisi yang tepat bagi masing-masing pengembangan perangkat lunak tersebut!", answerKey: "Waterfall untuk requirements stabil dan sistem kritis, Agile untuk dinamis dan iteratif pasang cepat.", weight: 15 }
];
let dbTasks: TaskPlan[] = [
  { id: "t-1", cpmkCode: "CPMK-2", name: "Rancangan Dokumen SRS IEEE-830", objective: "Membentuk kemampuan mahasiswa menyusun spesifikasi kebutuhan standar rekayasa perangkat lunak secara profesional kolaboratif.", rubric: "Kriteria: Ketepatan format (25%), Kelogisan Use Case (25%), Klasifikasi Kebutuhan non-fungsional (50%)", weight: 20 }
];
let dbExams: ExamPlan[] = [
  { id: "e-1", type: "UTS", cpmkCode: "CPMK-1", kisiKisi: "Teori SDLC, elisitasi kebutuhan sistem, pemetaan studi kasus ke sistem analitik.", weight: 30 }
];
let dbAuditLogs: AuditLog[] = [
  { id: "log-1", timestamp: "2026-06-11T10:00:00Z", userName: "Admin", userRole: "ADMIN", action: "SEED_DATA", details: "Menginisialisasi seluruh master data kurikulum OBE dan Bloom." }
];

// Helper to log audit activity
function addAuditLog(userName: string, userRole: string, action: string, details: string) {
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userName,
    userRole,
    action,
    details
  };
  dbAuditLogs.unshift(newLog); // newer first
}

// Ensure first seeded version is stored or can be simulated
dbRPS.forEach(r => {
  dbVersions.push({
    id: `v-${Date.now()}-${r.id}`,
    rpsId: r.id,
    version: r.version,
    editorName: "Kaprodi (Prof. Fauzi)",
    status: r.status,
    timestamp: r.updatedAt,
    meta: "Inisialisasi RPS Pertama",
    data: JSON.stringify(r)
  });
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Global state fetch for dashboards
app.get("/api/state", (req, res) => {
  res.json({
    totalUsers: dbUsers.length,
    users: dbUsers,
    totalLecturers: dbUsers.filter(u => u.role === UserRole.DOSEN).length,
    totalCPL: dbCPL.length,
    totalCourses: dbCourses.length,
    totalRPS: dbRPS.length,
    rps: dbRPS,
    cpl: dbCPL,
    courses: dbCourses,
    periods: dbPeriods,
    bloom: dbBloom,
    methods: dbMethods,
    assessmentTypes: dbAssessmentTypes,
    assignments: dbAssignments,
    questions: dbQuestions,
    tasks: dbTasks,
    exams: dbExams,
    versions: dbVersions,
    auditLogs: dbAuditLogs
  });
});

// Auth Simulator
app.post("/api/auth/login", (req, res) => {
  const { username } = req.body;
  const user = dbUsers.find(u => u.username === username || u.email === username);
  if (!user) {
    return res.status(401).json({ error: "Akun login tidak ditemukan!" });
  }
  return res.json({ success: true, user });
});

// Users REST
app.post("/api/users", (req, res) => {
  const { name, username, email, role, actorName } = req.body;
  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    username: username || name.toLowerCase().replace(/\s+/g, ""),
    email,
    role,
    isActive: true,
    createdAt: new Date().toISOString().split("T")[0]
  };
  dbUsers.push(newUser);
  addAuditLog(actorName || "Admin", "ADMIN", "CREATE_USER", `Pendaftaran user baru: ${name} (${role})`);
  res.json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, role, isActive, actorName } = req.body;
  const idx = dbUsers.findIndex(u => u.id === id);
  if (idx !== -1) {
    dbUsers[idx] = { ...dbUsers[idx], name, email, role, isActive };
    addAuditLog(actorName || "Admin", "ADMIN", "UPDATE_USER", `Mengubah profil user: ${name}`);
    return res.json(dbUsers[idx]);
  }
  res.status(404).json({ error: "User tidak ditemukan" });
});

app.post("/api/users/:id/reset-password", (req, res) => {
  const { id } = req.params;
  const { actorName } = req.body;
  const user = dbUsers.find(u => u.id === id);
  if (user) {
    addAuditLog(actorName || "Admin", "ADMIN", "RESET_PASSWORD", `Mereset password user: ${user.name}`);
    return res.json({ success: true, message: `Password ${user.name} berhasil direset ke nilai default!` });
  }
  res.status(404).json({ error: "User tidak ditemukan" });
});

// CPL REST
app.post("/api/cpl", (req, res) => {
  const { code, description, category, actorName } = req.body;
  const newItem: CPL = {
    id: `cpl-${Date.now()}`,
    code,
    description,
    category,
    isActive: true
  };
  dbCPL.push(newItem);
  addAuditLog(actorName || "Kaprodi", "KAPRODI", "CREATE_CPL", `Menambah Capaian Pembelajaran Lulusan: ${code}`);
  res.json(newItem);
});

app.put("/api/cpl/:id", (req, res) => {
  const { id } = req.params;
  const { code, description, category, isActive, actorName } = req.body;
  const idx = dbCPL.findIndex(c => c.id === id);
  if (idx !== -1) {
    dbCPL[idx] = { ...dbCPL[idx], code, description, category, isActive };
    addAuditLog(actorName || "Kaprodi", "KAPRODI", "UPDATE_CPL", `Mengubah CPL: ${code}`);
    return res.json(dbCPL[idx]);
  }
  res.status(404).json({ error: "CPL tidak ditemukan" });
});

app.delete("/api/cpl/:id", (req, res) => {
  const { id } = req.params;
  const idx = dbCPL.findIndex(c => c.id === id);
  if (idx !== -1) {
    const code = dbCPL[idx].code;
    dbCPL.splice(idx, 1);
    addAuditLog("Kaprodi", "KAPRODI", "DELETE_CPL", `Menghapus CPL: ${code}`);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "CPL tidak ditemukan" });
});

// Courses REST
app.post("/api/courses", (req, res) => {
  const { code, name, sks, semester, curriculum, cplIds, actorName } = req.body;
  const newItem: Course = {
    id: `crs-${Date.now()}`,
    code,
    name,
    sks: parseInt(sks) || 3,
    semester: parseInt(semester) || 1,
    curriculum: curriculum || "Kurikulum Merdeka 2026",
    cplIds: cplIds || []
  };
  dbCourses.push(newItem);
  addAuditLog(actorName || "Kaprodi", "KAPRODI", "CREATE_COURSE", `Menambah Mata Kuliah Baru: ${name} (${code})`);
  res.json(newItem);
});

app.put("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  const { code, name, sks, semester, curriculum, cplIds, actorName } = req.body;
  const idx = dbCourses.findIndex(c => c.id === id);
  if (idx !== -1) {
    dbCourses[idx] = { 
      ...dbCourses[idx], 
      code, 
      name, 
      sks: parseInt(sks), 
      semester: parseInt(semester), 
      curriculum, 
      cplIds 
    };
    addAuditLog(actorName || "Kaprodi", "KAPRODI", "UPDATE_COURSE", `Mengubah Mata Kuliah: ${name} (${code})`);
    return res.json(dbCourses[idx]);
  }
  res.status(404).json({ error: "Mata kuliah tidak ditemukan" });
});

app.delete("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  const idx = dbCourses.findIndex(c => c.id === id);
  if (idx !== -1) {
    const name = dbCourses[idx].name;
    dbCourses.splice(idx, 1);
    addAuditLog("Kaprodi", "KAPRODI", "DELETE_COURSE", `Menghapus Mata Kuliah: ${name}`);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Mata kuliah tidak ditemukan" });
});

// Assign Dosen REST
app.post("/api/assignments", (req, res) => {
  const { lecturerId, courseId, periodId, actorName } = req.body;
  const newItem: LecturerAssignment = {
    id: `asg-${Date.now()}`,
    lecturerId,
    courseId,
    periodId
  };
  dbAssignments.push(newItem);
  const dose = dbUsers.find(u => u.id === lecturerId)?.name || lecturerId;
  const cour = dbCourses.find(c => c.id === courseId)?.name || courseId;
  addAuditLog(actorName || "Kaprodi", "KAPRODI", "ASSIGN_LECTURER", `Plotting dosen ${dose} untuk ${cour}`);
  res.json(newItem);
});

app.delete("/api/assignments/:id", (req, res) => {
  const { id } = req.params;
  const idx = dbAssignments.findIndex(a => a.id === id);
  if (idx !== -1) {
    dbAssignments.splice(idx, 1);
    addAuditLog("Kaprodi", "KAPRODI", "REMOVE_ASSIGNMENT", "Menghapus plotting pengajar dosen");
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Plotting tidak ditemukan" });
});

// RPS CRUD
app.post("/api/rps", (req, res) => {
  const rpsData: RPS = req.body;
  const rpsId = `rps-${Date.now()}`;
  const preparedRPS: RPS = {
    ...rpsData,
    id: rpsId,
    status: rpsData.status || "DRAFT",
    version: 1,
    updatedAt: new Date().toISOString()
  };
  dbRPS.push(preparedRPS);
  
  dbVersions.push({
    id: `v-${Date.now()}-${rpsId}`,
    rpsId,
    version: 1,
    editorName: rpsData.updatedBy || "Dosen Pengampu",
    status: preparedRPS.status,
    timestamp: preparedRPS.updatedAt,
    meta: "Pembuatan Draf Baru RPS",
    data: JSON.stringify(preparedRPS)
  });

  addAuditLog(preparedRPS.updatedBy, "DOSEN", "CREATE_RPS", `Membuat draft RPS baru untuk ${preparedRPS.courseName}`);
  res.json(preparedRPS);
});

app.put("/api/rps/:id", (req, res) => {
  const { id } = req.params;
  const updatedData: RPS = req.body;
  const idx = dbRPS.findIndex(r => r.id === id);
  
  if (idx !== -1) {
    const oldData = dbRPS[idx];
    const newVersion = oldData.version + 1;
    
    const fullyUpdatedRPS: RPS = {
      ...updatedData,
      id,
      version: newVersion,
      updatedAt: new Date().toISOString()
    };
    
    dbRPS[idx] = fullyUpdatedRPS;
    
    dbVersions.push({
      id: `v-${Date.now()}-${id}`,
      rpsId: id,
      version: newVersion,
      editorName: updatedData.updatedBy || "Dosen Pengampu",
      status: fullyUpdatedRPS.status,
      timestamp: fullyUpdatedRPS.updatedAt,
      meta: `Pembaruan data ke Versi ${newVersion}`,
      data: JSON.stringify(fullyUpdatedRPS)
    });

    addAuditLog(fullyUpdatedRPS.updatedBy || "Dosen", "DOSEN", "UPDATE_RPS", `Menyimpan revisi RPS ${fullyUpdatedRPS.courseName} (v${newVersion})`);
    return res.json(fullyUpdatedRPS);
  }
  
  res.status(404).json({ error: "RPS tidak ditemukan" });
});

// Validate - Kaprodi approval
app.post("/api/rps/:id/validate", (req, res) => {
  const { id } = req.params;
  const { status, notes, actorName } = req.body; // status: DISETUJUI / DIREVISI
  const idx = dbRPS.findIndex(r => r.id === id);
  if (idx !== -1) {
    const r = dbRPS[idx];
    r.status = status;
    r.notes = notes;
    r.updatedAt = new Date().toISOString();
    r.version += 1;
    
    dbVersions.push({
      id: `v-${Date.now()}-${id}`,
      rpsId: id,
      version: r.version,
      editorName: actorName || "Kaprodi",
      status: status,
      timestamp: r.updatedAt,
      meta: `Proses Validasi Kaprodi: ${status}`,
      data: JSON.stringify(r)
    });

    addAuditLog(actorName || "Kaprodi", "KAPRODI", "VALIDATE_RPS", `Melakukan validasi RPS ${r.courseName} -> ${status}`);
    return res.json(r);
  }
  res.status(404).json({ error: "RPS tidak ditemukan" });
});

// Master Periods REST
app.post("/api/periods", (req, res) => {
  const { year, semester, actorName } = req.body;
  const newItem: AcademicPeriod = {
    id: `prd-${Date.now()}`,
    year,
    semester,
    isActive: false
  };
  dbPeriods.push(newItem);
  addAuditLog(actorName || "Admin", "ADMIN", "CREATE_PERIOD", `Menambah periode akademik: ${year} ${semester}`);
  res.json(newItem);
});

app.put("/api/periods/:id", (req, res) => {
  const { id } = req.params;
  const { year, semester, isActive, actorName } = req.body;
  const idx = dbPeriods.findIndex(p => p.id === id);
  if (idx !== -1) {
    if (isActive) {
      // Set others to false
      dbPeriods.forEach(p => p.isActive = false);
    }
    dbPeriods[idx] = { id, year, semester, isActive };
    addAuditLog(actorName || "Admin", "ADMIN", "UPDATE_PERIOD", `Mengubah periode akademik: ${year} ${semester} (Active: ${isActive})`);
    return res.json(dbPeriods[idx]);
  }
  res.status(404).json({ error: "Periode tidak ditemukan" });
});

// Master Methods REST
app.post("/api/methods", (req, res) => {
  const { name, description, actorName } = req.body;
  const newItem: LearningMethod = {
    id: `met-${Date.now()}`,
    name,
    description
  };
  dbMethods.push(newItem);
  addAuditLog(actorName || "Admin", "ADMIN", "CREATE_METHOD", `Menambah metode pembelajaran: ${name}`);
  res.json(newItem);
});

app.put("/api/methods/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, actorName } = req.body;
  const idx = dbMethods.findIndex(m => m.id === id);
  if (idx !== -1) {
    dbMethods[idx] = { id, name, description };
    addAuditLog(actorName || "Admin", "ADMIN", "UPDATE_METHOD", `Mengubah metode pembelajaran: ${name}`);
    return res.json(dbMethods[idx]);
  }
  res.status(404).json({ error: "Metode tidak ditemukan" });
});

// Master Asesmen REST
app.post("/api/assessment-types", (req, res) => {
  const { name, description, defaultWeight, actorName = "Admin" } = req.body;
  const newItem: AssessmentType = {
    id: `as-${Date.now()}`,
    name,
    description,
    defaultWeight: parseInt(defaultWeight) || 10
  };
  dbAssessmentTypes.push(newItem);
  addAuditLog(actorName, "ADMIN", "CREATE_ASSESSMENT_TYPE", `Menambah tipe asesmen: ${name}`);
  res.json(newItem);
});

app.put("/api/assessment-types/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, defaultWeight, actorName = "Admin" } = req.body;
  const idx = dbAssessmentTypes.findIndex(a => a.id === id);
  if (idx !== -1) {
    dbAssessmentTypes[idx] = { id, name, description, defaultWeight: parseInt(defaultWeight) };
    addAuditLog(actorName, "ADMIN", "UPDATE_ASSESSMENT_TYPE", `Mengubah tipe asesmen: ${name}`);
    return res.json(dbAssessmentTypes[idx]);
  }
  res.status(404).json({ error: "Tipe Asesmen tidak ditemukan" });
});

// Audit-Logs REST
app.get("/api/audit-logs", (req, res) => {
  res.json(dbAuditLogs);
});

// Asset managers: Questions / Tasks / Exams
app.post("/api/questions", (req, res) => {
  const q: QuestionItem = { id: `q-${Date.now()}`, ...req.body };
  dbQuestions.push(q);
  res.json(q);
});
app.post("/api/tasks", (req, res) => {
  const t: TaskPlan = { id: `t-${Date.now()}`, ...req.body };
  dbTasks.push(t);
  res.json(t);
});
app.post("/api/exams", (req, res) => {
  const e: ExamPlan = { id: `e-${Date.now()}`, ...req.body };
  dbExams.push(e);
  res.json(e);
});


// ==========================================
// GEMINI INTELLIGENT AI INTEGRATION
// ==========================================

// Full RPS Generation
app.post("/api/gemini/generate-rps", async (req, res) => {
  const { courseName, sks, jumlahPertemuan, selectedCPL = [], lecturerName = "Google AI Studio User" } = req.body;
  
  if (!geminiApiKey) {
    return res.status(500).json({ 
      error: "Kunci API Gemini (GEMINI_API_KEY) belum terkonfigurasi pada menu Settings > Secrets." 
    });
  }

  const prompt = `
    Nama Mata Kuliah: ${courseName}
    Jumlah SKS: ${sks}
    Jumlah Pertemuan: ${jumlahPertemuan}
    Daftar CPL Terpilih yang harus didukung oleh mata kuliah ini:
    ${JSON.stringify(selectedCPL, null, 2)}

    Buatkan RPS berbasis Outcome-Based Education (OBE) untuk program studi teknik komputer tingkat tinggi dengan mematuhi format format JSON di bawah.

    Ketentuan OBE penting:
    1. CPMK (Capaian Pembelajaran Mata Kuliah) harus diturunkan secara logis dari CPL di atas. Gunakan Kata Kerja Operasional Taksonomi Bloom (C1-C6). CPL wajib digabungkan dengan CPMK dalam mappingnya.
    2. Sub CPMK harus terperinci dan dapat diukur secara taksonomis.
    3. Hubungkan CPL dengan Kode CPMK secara eksplisit.
    4. Distribusikan materi pembelajaran persis sebanyak ${jumlahPertemuan} Pertemuan dan petakan CPMK, Metode, Aktivitas secara runut! Jangan mengarang atau memaksakan 16 minggu jika dosen mengetik ${jumlahPertemuan} pertemuan.
    5. Setiap pertemuan harus berisi Topik, Sub Topik yang logis (jangan menyisakan modul kosong).
    6. Tentukan rekomendasi daftar Asesmen OBE lengkap beserta persentase kontribusi nilainya (total persentase gabungan harus 100%).
    7. Berikan Rubrik Penilaian dengan Kriteria khusus berbentuk baris kriteria beserta indikator level (Sangat Baik, Baik, Cukup, Kurang) untuk mengukur CPMK utama.
    8. Berikan Referensi textbook resmi yang up-to-date.

    WAJIB menghasilkan tanggapan berformat JSON murni yang sesuai struktur ini tanpa markdown block code atau komentar di luar JSON:
    {
      "mata_kuliah": "${courseName}",
      "sks": ${sks},
      "jumlah_pertemuan": ${jumlahPertemuan},
      "cpmk": [
        { "code": "CPMK-1", "description": "Uraian capaian...", "linkedCplCode": "Kode CPL pendukung" }
      ],
      "sub_cpmk": [
        { "code": "Sub-CPMK-1.1", "description": "Uraian sub capaian...", "linkedCpmkCode": "CPMK-1" }
      ],
      "mapping_cpl_cpmk": [
        { "cplCode": "CPL-X", "cpmkCode": "CPMK-Y" }
      ],
      "materi_pembelajaran": [
        {
          "pertemuan": 1,
          "topik": "Topik bahasan...",
          "sub_topik": "Sub topik bahasan...",
          "cpmk": "Kode CPMK yg relevan (misal: CPMK-1)",
          "metode": "Misal: Case Method / Ceramah / PjBL",
          "aktivitas_mahasiswa": "Aktivitas pembelajaran mendalam mahasiswa dalam kelas...",
          "indikator_penilaian": "Indikator pembuktian kelulusan...",
          "asesmen": "Jenis evaluasi yang digunakan..."
        }
      ],
      "asesmen": [
        { "name": "Project Akhir", "percentage": 40, "cpmkCode": "CPMK-2", "method": "Kriteria unjuk kerja" }
      ],
      "rubrik": [
        { "kriteria": "Aspek penilaian...", "sangatBaik": "Deskripsi...", "baik": "Deskripsi...", "cukup": "Deskripsi...", "kurang": "Deskripsi..." }
      ],
      "referensi": [
        "Nama Penulis, Judul Buku, Penerbit, Tahun"
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const cleanText = response.text || "{}";
    const rpsJson = JSON.parse(cleanText.trim());
    
    addAuditLog(lecturerName, "DOSEN", "AI_GEN_RPS", `Berhasil men-generate dokumen RPS OBE via AI untuk MK: ${courseName}`);
    res.json(rpsJson);
  } catch (err: any) {
    console.error("Gemini Generate RPS error:", err);
    res.status(500).json({ error: "Gagal berinteraksi dengan Google Gemini API. Hambatan: " + err.message });
  }
});

// Specific Regenerate Tool
app.post("/api/gemini/regenerate-section", async (req, res) => {
  const { section, courseName, sks, currentRps, selectedCPL = [], lecturerName = "Lecturer" } = req.body;

  if (!geminiApiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY belum terkonfigurasi di panel Secrets." });
  }

  const prompt = `
    Anda adalah Senior AI Engineer Kurikulum DIKTI.
    Mata Kuliah: ${courseName} (${sks} SKS).
    Kami memiliki kerangka RPS saat ini sebagai berikut:
    ${JSON.stringify(currentRps, null, 2)}

    TUGAS ANDA:
    Lakukan modul regenerasi optimal khusus untuk bagian: "${section}".
    
    Instruksi:
    - Jika bagian adalah "cpmk", revisi CPMK & Sub CPMK menggunakan taksonomi Bloom (C1-C6) agar relevan dengan CPL: ${JSON.stringify(selectedCPL)}.
    - Jika bagian adalah "materi", perbaiki pertemuan pembelajaran tanpa memotong struktur rancangan baris dan pastikan integrasi target CPMK sinkron dengan materi baru yang bermutu tinggi.
    - Jika bagian adalah "asesmen", buat ulang skema pembobotan terarah (UTS, UAS, Tugas, dsb) dengan total kumulatif persis 100%.
    - Jika bagian adalah "rubrik", susun rubrik kriteria modern (Sangat baik, Baik, Cukup, Kurang) untuk mengukur capaian tugas OBE tersebut.
    
    Kembalikan HANYA array representasi objek baru untuk bagian yang dipilih tersebut berformat JSON murni.

    Misal jika section="cpmk", format output JSON wajib persis seperti:
    {
      "cpmk": [ ... array capaian baru ... ],
      "sub_cpmk": [ ... array sub baru ... ],
      "mapping_cpl_cpmk": [ ... ]
    }
    
    Misal jika section="materi", format output:
    {
      "materi_pembelajaran": [ ... array materi baru ... ]
    }

    Misala jika section="asesmen", format output:
    {
      "asesmen": [ ... array asesmen baru ... ]
    }

    Misal jika section="rubrik", format urutan:
    {
      "rubrik": [ ... array kriteria dsb ... ]
    }

    Output harus berformat JSON murni valid tanpa karakter pemformatan HTML/Markdown tambahan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const sectionJson = JSON.parse(response.text?.trim() || "{}");
    addAuditLog(lecturerName, "DOSEN", "AI_REGEN_SECTION", `Regenerasi modul RPS [${section}] via AI untuk MK: ${courseName}`);
    res.json(sectionJson);
  } catch (err: any) {
    console.error("Gemini Regenerate Section error:", err);
    res.status(500).json({ error: "Gagal memproses regenerasi seksi. Hambatan: " + err.message });
  }
});

// Generate Questions for Bank Soal
app.post("/api/gemini/generate-questions", async (req, res) => {
  const { cpmkDesc, bloomLevel, type, count = 3, courseName } = req.body;

  if (!geminiApiKey) {
    return res.status(500).json({ error: "Kunci API Gemini belum tersedia." });
  }

  const prompt = `
    Mata Kuliah: ${courseName}
    Target CPMK: ${cpmkDesc}
    Level Kognitif Bloom: ${bloomLevel}
    Jenis Evaluasi: ${type} (pilihlah antara TUGAS, QUIZ, UTS, UAS)
    Jumlah Soal: ${count}

    Buatkan ${count} butir soal akademik bermutu tinggi beserta rubrik kunci jawaban konkretnya yang selaras dengan level taksonomi kognitif Bloom yang diminta. Soal harus relevan, aplikatif, dan dapat diujikan di tingkat perkuliahan.

    Output wajib berupa objek JSON valid dengan struktur ini:
    {
      "questions": [
        {
          "question": "Kalimat pertanyaan soal...",
          "answerKey": "Kunci jawaban / ekspektasi pemecahan masalah...",
          "bloomLevel": "${bloomLevel}",
          "weight": 10
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const list = parsed.questions || [];
    
    // Save to simulated database
    const savedList = list.map((item: any) => {
      const q: QuestionItem = {
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        cpmkCode: cpmkDesc.split(" ")[0] || "CPMK-1",
        bloomLevel: item.bloomLevel || bloomLevel,
        type: type,
        question: item.question,
        answerKey: item.answerKey,
        weight: item.weight || 15
      };
      dbQuestions.push(q);
      return q;
    });

    addAuditLog("Sistem AI", "DOSEN", "AI_GEN_QUESTIONS", `Berhasil membuat ${savedList.length} draf soal baru untuk ${courseName}`);
    res.json(savedList);
  } catch (err: any) {
    console.error("Gemini Generate Questions error:", err);
    res.status(500).json({ error: "Gagal membuat soal. Hambatan: " + err.message });
  }
});

// Generate Task Plan
app.post("/api/gemini/generate-task", async (req, res) => {
  const { cpmkCode, cpmkDesc, courseName } = req.body;

  if (!geminiApiKey) {
    return res.status(500).json({ error: "Kunci API Gemini belum terkonfigurasi." });
  }

  const prompt = `
    Buatkan Rencana Tugas Mahasiswa berbasis Outcome-Based Education (OBE) untuk:
    Mata Kuliah: ${courseName}
    Capaian CPMK: [${cpmkCode}] ${cpmkDesc}

    Konversikan draf dalam bentuk JSON lengkap:
    {
      "name": "Nama Tugas (misal: Studi Kasus Analisis ...)",
      "objective": "Tujuan instruksional tugas...",
      "rubric": "Informasi/Kriteria rubrik penilaian dan indikator nilai...",
      "weight": 15
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    const t: TaskPlan = {
      id: `t-${Date.now()}`,
      cpmkCode,
      name: result.name || "Tugas OBE Baru",
      objective: result.objective || "Menganalisis materi terapan CPMK",
      rubric: result.rubric || "Kesesuaian rancangan dan analisa teknis",
      weight: result.weight || 10
    };
    dbTasks.push(t);
    addAuditLog("Sistem AI", "DOSEN", "AI_GEN_TASK", `Membuat Rencana Tugas OBE baru untuk: ${courseName}`);
    res.json(t);
  } catch (err: any) {
    console.error("Gemini Generate Task error:", err);
    res.status(500).json({ error: "Gagal memproses AI generator tugas. " + err.message });
  }
});

// Generate Exam Plan
app.post("/api/gemini/generate-exam", async (req, res) => {
  const { type, cpmkCode, cpmkDesc, courseName } = req.body;

  if (!geminiApiKey) {
    return res.status(500).json({ error: "Kunci API Gemini belum diset." });
  }

  const prompt = `
    Buatkan Kisi-Kisi dan Rencana ${type} (Ujian Tengah/Akhir Semester) berbasis OBE untuk:
    Mata Kuliah: ${courseName}
    Sasaran Capaian: [${cpmkCode}] ${cpmkDesc}

    Output JSON format:
    {
      "kisiKisi": "Uraian kisi-kisi teknis, rentang topik, sasarana keterampilan yang diujikan...",
      "weight": 30
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    const e: ExamPlan = {
      id: `e-${Date.now()}`,
      type,
      cpmkCode,
      kisiKisi: result.kisiKisi || "Kisi-kisi komparatif teruji dasar",
      weight: result.weight || 25
    };
    dbExams.push(e);
    addAuditLog("Sistem AI", "DOSEN", "AI_GEN_EXAM", `Membuat Kisi-kisi ${type} baru untuk: ${courseName}`);
    res.json(e);
  } catch (err: any) {
    console.error("Gemini Generate Exam error:", err);
    res.status(500).json({ error: "Gagal men-generate draf rencana ujian. " + err.message });
  }
});


// ==========================================
// STATIC & VITE MIDDLEWARE CONFIGURATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4 and below, we can use app.get('*', ...)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OBE Academic RPS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
