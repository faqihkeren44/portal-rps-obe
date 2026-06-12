/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  FileCode,
  LogOut,
  Users,
  FolderLock
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  currentRole: UserRole | "DOCS";
  currentUserName: string;
  onRoleChange: (role: UserRole | "DOCS") => void;
  onLogout: () => void;
}

export default function Sidebar({
  currentRole,
  currentUserName,
  onRoleChange,
  onLogout
}: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between h-full border-r border-slate-800">
      <div className="p-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-indigo-500 text-white p-2 rounded-lg shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight leading-none text-white">
              Sistem RPS OBE
            </h1>
            <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase">
              Enterprise Portal
            </span>
          </div>
        </div>

        {/* User Context */}
        <div className="bg-slate-800/40 rounded-xl p-4 mb-6 border border-slate-800/60">
          <div className="text-xs font-mono text-slate-400">Pengguna Aktif:</div>
          <div className="text-sm font-semibold truncate text-white">{currentUserName}</div>
          <div className="mt-2 inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-indigo-500/20">
            {currentRole === "DOCS" ? "DOCS HUB" : currentRole}
          </div>
        </div>

        {/* Role Switcher Menu */}
        <div className="space-y-1">
          <div className="text-[10px] items-center font-mono font-bold text-slate-500 tracking-widest uppercase mb-2 block">
            PILIH ROLE SIMULASI
          </div>

          <button
            id="nav-admin"
            onClick={() => onRoleChange(UserRole.ADMIN)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentRole === UserRole.ADMIN
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>1. Admin Master</span>
          </button>

          <button
            id="nav-kaprodi"
            onClick={() => onRoleChange(UserRole.KAPRODI)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentRole === UserRole.KAPRODI
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>2. Kepala Prodi</span>
          </button>

          <button
            id="nav-dosen"
            onClick={() => onRoleChange(UserRole.DOSEN)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
              currentRole === UserRole.DOSEN
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>3. Dosen Pengampu</span>
          </button>

          <div className="pt-6">
            <div className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase mb-2 block">
              BLUEPRINTS & UML
            </div>
            <button
              id="nav-docs"
              onClick={() => onRoleChange("DOCS")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                currentRole === "DOCS"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <FileCode className="h-4 w-4" />
              <span>Arsitektur & UML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Log out */}
      <div className="p-6 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Ganti Pengguna</span>
        </button>
        <div className="mt-4 text-[9px] font-mono text-slate-650 flex items-center gap-1">
          <FolderLock className="h-3 w-3" />
          <span>Enterprise Mode Enabled</span>
        </div>
      </div>
    </aside>
  );
}
