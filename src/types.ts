/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "ADMIN",
  KAPRODI = "KAPRODI",
  DOSEN = "DOSEN"
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AcademicPeriod {
  id: string;
  year: string; // e.g., "2025/2026"
  semester: "GANJIL" | "GENAP";
  isActive: boolean;
}

export interface BloomVerb {
  id: string;
  level: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  verba: string[]; // Kata Kerja Operasional
  description: string;
}

export interface LearningMethod {
  id: string;
  name: string; // Ceramah, Case Method, Project-Based Learning, etc.
  description: string;
}

export interface AssessmentType {
  id: string;
  name: string; // Tugas, Quiz, Portofolio, UTS, UAS, etc.
  description: string;
  defaultWeight: number;
}

export interface CPL {
  id: string;
  code: string; // e.g. "CPL-01"
  description: string;
  category: "Sikap" | "Pengetahuan" | "Keterampilan Umum" | "Keterampilan Khusus";
  isActive: boolean;
}

export interface Course {
  id: string;
  code: string; // e.g. "INF-101"
  name: string;
  sks: number;
  semester: number;
  curriculum: string;
  cplIds: string[]; // Linked CPLs
}

export interface LecturerAssignment {
  id: string;
  lecturerId: string;
  courseId: string;
  periodId: string;
}

export interface CPMK {
  code: string; // e.g. "CPMK-1"
  description: string;
  linkedCplCode: string; // CPL code linked to this CPMK
}

export interface SubCPMK {
  code: string; // e.g. "Sub-CPMK-1.1"
  description: string;
  linkedCpmkCode: string;
}

export interface MeetingPlan {
  pertemuan: number;
  topik: string;
  sub_topik: string;
  cpmk: string; // Linked CPMK code(s) (e.g. "CPMK-1")
  metode: string;
  aktivitas_mahasiswa: string;
  indikator_penilaian: string;
  asesmen: string;
}

export interface AssessmentOBE {
  name: string;
  percentage: number;
  cpmkCode: string;
  method: string;
}

export interface RubrikKriteria {
  kriteria: string;
  sangatBaik: string;
  baik: string;
  cukup: string;
  kurang: string;
}

export interface RPS {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  sks: number;
  jumlah_pertemuan: number;
  cplIds: string[];
  status: "DRAFT" | "MENUGGU_VALIDASI" | "DISETUJUI" | "DIREVISI";
  cpmk: CPMK[];
  sub_cpmk: SubCPMK[];
  mapping_cpl_cpmk: { cplCode: string; cpmkCode: string }[];
  materi_pembelajaran: MeetingPlan[];
  asesmen: AssessmentOBE[];
  rubrik: RubrikKriteria[];
  referensi: string[];
  notes?: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface RPSVersion {
  id: string;
  rpsId: string;
  version: number;
  editorName: string;
  status: RPS["status"];
  timestamp: string;
  meta: string; // JSON string of old vs new brief or full payload
  data: string; // Complete serialized RPS state
}

export interface QuestionItem {
  id: string;
  cpmkCode: string;
  bloomLevel: string; // C1-C6
  type: "TUGAS" | "QUIZ" | "UTS" | "UAS";
  question: string;
  answerKey: string;
  weight: number;
}

export interface TaskPlan {
  id: string;
  cpmkCode: string;
  name: string;
  objective: string;
  rubric: string; // text explanation/specification
  weight: number;
}

export interface ExamPlan {
  id: string;
  type: "UTS" | "UAS";
  cpmkCode: string;
  kisiKisi: string;
  weight: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
}
