'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  KeyRound,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  IdCard
} from 'lucide-react';
import { loginUser, registerUser, verifyExamToken } from '../lib/api';

import { User } from '../types/maply';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: 'student' | 'teacher';
  onClose: () => void;
  onEnterExamWithToken: (token: string) => void;
  onLoginSuccess: (role: 'student' | 'teacher', userName: string, user?: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'student',
  onClose,
  onEnterExamWithToken,
  onLoginSuccess
}) => {
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'token'>('login');

  // Form states
  const [fullName, setFullName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [identifierInput, setIdentifierInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setRole(initialRole);
    setErrorMessage('');
    setSuccessMessage('');
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMessage('Masukkan 6-karakter token ujian (contoh: KBT-9428)');
      return;
    }
    const cleanToken = tokenInput.trim().toUpperCase();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const verifyRes = await verifyExamToken(cleanToken);
      if (!verifyRes.valid) {
        setErrorMessage(verifyRes.message || 'Token ujian tidak valid atau tidak terdaftar.');
        setIsLoading(false);
        return;
      }
      onEnterExamWithToken(cleanToken);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memverifikasi token ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        if (!emailInput || !passwordInput) {
          throw new Error('Email dan kata sandi wajib diisi.');
        }
        const res = await loginUser({ email: emailInput, password: passwordInput });
        setSuccessMessage(`Selamat datang kembali, ${res.user.full_name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user.role, res.user.full_name, res.user);
          onClose();
        }, 600);
      } else {
        // Register mode
        if (!fullName || !emailInput || !passwordInput) {
          throw new Error('Nama lengkap, email, dan kata sandi wajib diisi.');
        }
        if (passwordInput.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.');
        }
        const res = await registerUser({
          email: emailInput,
          password: passwordInput,
          full_name: fullName,
          role: role,
          identifier: identifierInput.trim() || undefined
        });
        setSuccessMessage(`Akun berhasil dibuat! Selamat datang, ${res.user.full_name}.`);
        setTimeout(() => {
          onLoginSuccess(res.user.role, res.user.full_name, res.user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1B1E]/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF7F2] rounded-3xl border-2 border-[#1B1B1E] shadow-[8px_8px_0px_#1B1B1E] overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-white border-b-2 border-[#1B1B1E] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0038D1] border-2 border-[#1B1B1E] flex items-center justify-center text-white font-serif font-black text-sm shadow-[2px_2px_0px_#1B1B1E]">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none mb-0.5">
                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-[#0038D1]">
                  Autentikasi Akun
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#EEF2FF] border border-[#C7D2FE] text-[9px] font-mono font-bold text-[#0038D1]">
                  Supabase DB
                </span>
              </div>
              <h3 className="text-base font-serif font-black text-[#1B1B1E] leading-tight">
                {role === 'student' ? 'Portal Mahasiswa' : 'Portal Dosen & Pengajar'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border-2 border-[#1B1B1E] flex items-center justify-center text-[#1B1B1E] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Toggle Selector */}
        <div className="px-5 pt-4 pb-2">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/70 border-2 border-[#1B1B1E]">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-[#1B1B1E] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]'
                  : 'text-[#666] hover:text-[#1B1B1E]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#0038D1]" />
              <span>Mahasiswa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                if (authMode === 'token') setAuthMode('login');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'teacher'
                  ? 'bg-white text-[#1B1B1E] border-2 border-[#1B1B1E] shadow-[2px_2px_0px_#1B1B1E]'
                  : 'text-[#666] hover:text-[#1B1B1E]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Dosen</span>
            </button>
          </div>
        </div>

        {/* Mode Switch Tabs (Login / Register / Token) */}
        <div className="px-5 pb-2">
          <div className="flex border-b-2 border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 ${
                authMode === 'login'
                  ? 'border-[#0038D1] text-[#0038D1]'
                  : 'border-transparent text-[#71717A] hover:text-[#1B1B1E]'
              }`}
            >
              Masuk Akun
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
              }}
              className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 ${
                authMode === 'register'
                  ? 'border-[#0038D1] text-[#0038D1]'
                  : 'border-transparent text-[#71717A] hover:text-[#1B1B1E]'
              }`}
            >
              Daftar Baru
            </button>

            {role === 'student' && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('token');
                  setErrorMessage('');
                }}
                className={`pb-2.5 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1 ${
                  authMode === 'token'
                    ? 'border-[#0038D1] text-[#0038D1]'
                    : 'border-transparent text-[#71717A] hover:text-[#1B1B1E]'
                }`}
              >
                <KeyRound className="w-3 h-3 text-[#D97706]" />
                <span>Token Ujian</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border-2 border-[#DA3437] text-xs font-bold text-[#DA3437] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border-2 border-[#059669] text-xs font-bold text-[#059669] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: TOKEN ACCESS */}
          {authMode === 'token' && role === 'student' && (
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#FFEAA7]/40 border-2 border-[#1B1B1E] text-xs space-y-1">
                <span className="font-black text-[#1B1B1E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  Akses Kilat Tanpa Akun
                </span>
                <p className="text-[11px] text-[#444655]">
                  Masukkan 6-karakter token ujian yang diberikan oleh dosen (contoh: <code>KBT-9428</code>) untuk langsung masuk ke sesi pengerjaan.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B1B1E] mb-1.5">
                  Kode Token / PIN Ujian
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  placeholder="KBT-9428"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#1B1B1E] bg-white font-mono font-bold text-center text-lg tracking-widest text-[#0038D1] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-serif font-black text-xs border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi Token...</span>
                ) : (
                  <>
                    <span>Mulai Pengerjaan Ujian</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: LOGIN & REGISTER */}
          {(authMode === 'login' || authMode === 'register') && (
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B1B1E] mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === 'student' ? 'Contoh: Ahmad Rizky' : 'Contoh: Dr. Ir. Herman Tolle'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#1B1B1E] bg-white text-xs font-bold text-[#1B1B1E] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                    />
                  </div>
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B1B1E] mb-1">
                    {role === 'student' ? 'Nomor Induk Mahasiswa (NIM)' : 'Nomor Induk Pegawai (NIP)'}
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={identifierInput}
                      onChange={(e) => setIdentifierInput(e.target.value)}
                      placeholder={role === 'student' ? 'Contoh: 225150201111048' : 'Contoh: 198205122008121003'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#1B1B1E] bg-white text-xs font-mono font-bold text-[#1B1B1E] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B1B1E] mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#1B1B1E] bg-white text-xs font-bold text-[#1B1B1E] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#1B1B1E] mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#1B1B1E] bg-white text-xs font-bold text-[#1B1B1E] focus:outline-none focus:ring-2 focus:ring-[#0038D1]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-[#0038D1] hover:bg-[#1A4BDB] text-white font-serif font-black text-xs border-2 border-[#1B1B1E] shadow-[3px_3px_0px_#1B1B1E] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span>{authMode === 'login' ? `Masuk sebagai ${role === 'student' ? 'Mahasiswa' : 'Dosen'}` : 'Daftarkan Akun Baru'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t-2 border-[#1B1B1E] text-center shrink-0">
          <p className="text-[10px] text-[#71717A] font-bold">
            Data tersimpan aman di PostgreSQL Supabase &bull; Maply Cognitive Lab
          </p>
        </div>
      </div>
    </div>
  );
};

