import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import type { Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: (role: Role) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('Thanjavur');
  const [language, setLanguageChoice] = useState('en');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let authenticatedRole: Role;
      if (mode === 'login') {
        const user = await login({ email, password });
        authenticatedRole = user.role;
      } else {
        const user = await register({
          email,
          password,
          full_name: fullName,
          district,
          preferred_language: language,
          state: 'Tamil Nadu'
        });
        authenticatedRole = user.role;
      }
      onSuccess?.(authenticatedRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('login');
    setError(null);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" aria-describedby="auth-modal-description" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 id="auth-modal-title" className="font-bold text-slate-900 text-lg">
              {mode === 'login' ? 'Sign in to Arohan AI' : 'Create an Arohan Account'}
            </h3>
            <p id="auth-modal-description" className="text-sm text-slate-600">
              {mode === 'login' ? 'Access your saved roadmaps and opportunities' : 'Create a student account. Staff and mentor access is provisioned by an administrator.'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close authentication dialog" className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Logins Pill Bar */}
        <div className="my-3 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Instant Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('student@arohan.org', 'student123')}
              className="text-[11px] font-medium bg-white hover:bg-blue-100 text-blue-700 py-1 px-2 rounded-lg border border-blue-200 text-left transition"
            >
              🎓 Student (Kavitha)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('teacher@arohan.org', 'teacher123')}
              className="text-[11px] font-medium bg-white hover:bg-blue-100 text-blue-700 py-1 px-2 rounded-lg border border-blue-200 text-left transition"
            >
              👩‍🏫 Teacher (Sundaram)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('mentor@arohan.org', 'mentor123')}
              className="text-[11px] font-medium bg-white hover:bg-blue-100 text-blue-700 py-1 px-2 rounded-lg border border-blue-200 text-left transition"
            >
              🤝 Mentor (Dr. Anand)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('donor@arohan.org', 'donor123')}
              className="text-[11px] font-medium bg-white hover:bg-blue-100 text-blue-700 py-1 px-2 rounded-lg border border-blue-200 text-left transition"
            >
              📚 Book Donor (Meera)
            </button>
          </div>
        </div>

        {error && (
          <div id="auth-error" role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="auth-full-name" className="block text-sm font-semibold text-slate-800 mb-1">Full Name</label>
                <input
                  id="auth-full-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kavitha Selvam"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="auth-district" className="block text-sm font-semibold text-slate-800 mb-1">District</label>
                  <input
                    id="auth-district"
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Thanjavur"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="auth-language" className="block text-sm font-semibold text-slate-800 mb-1">Preferred Language</label>
                  <select
                    id="auth-language"
                    value={language}
                    onChange={(e) => setLanguageChoice(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-semibold text-slate-800 mb-1">Email Address</label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'auth-error' : undefined}
              placeholder="name@example.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-semibold text-slate-800 mb-1">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'auth-error' : undefined}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
