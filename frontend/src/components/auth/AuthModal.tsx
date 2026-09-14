import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, LogIn, UserPlus, BookMarked, ArrowRight } from 'lucide-react';
import { loginApi, registerApi } from '../../api/client';
import type { UserProfile } from '../../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('Umair');
  const [email, setEmail] = useState<string>('umair@tradejournal.com');
  const [password, setPassword] = useState<string>('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await registerApi(name, email, password);
        onLoginSuccess(res.user);
      } else {
        const res = await loginApi(email, password);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginUmair = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginApi('umair@tradejournal.com', 'password123');
      onLoginSuccess(res.user);
    } catch (err: any) {
      // If default user doesn't exist yet, register default user
      try {
        const regRes = await registerApi('Umair', 'umair@tradejournal.com', 'password123');
        onLoginSuccess(regRes.user);
      } catch (regErr: any) {
        setError(regErr.message || 'Failed to sign in as Umair.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="desk-card max-w-md w-full p-6 sm:p-8 space-y-6 border border-[#252930] shadow-2xl relative">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#14171B] border border-[#252930] text-emerald-400 mb-1">
            <BookMarked className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#f0f1f4] tracking-tight">
            {isRegister ? 'Create Trading Account' : 'Personal Trading Desk'}
          </h2>
          <p className="text-sm text-[#8a8f9d]">
            {isRegister
              ? 'Sign up to secure and isolate your trading journal data'
              : 'Sign in to access your private trades and performance metrics'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Quick Access Pill for Umair */}
        {!isRegister && (
          <div className="p-3 rounded bg-[#14171B] border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                U
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#f0f1f4]">Log in as Umair</div>
                <div className="text-[11px] text-[#8a8f9d]">umair@tradejournal.com</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickLoginUmair}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              <span>Instant Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8a8f9d]">First Name / Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#5e6370] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Umair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full desk-input pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8a8f9d]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5e6370] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full desk-input pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8a8f9d]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5e6370] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full desk-input pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer mt-2"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="pt-2 border-t border-[#252930] text-center text-xs text-[#8a8f9d]">
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            {isRegister ? 'Sign In' : 'Register Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
