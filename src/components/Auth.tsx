import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, RefreshCw } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (userId: string, isNewUser: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup' && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const endpoint = mode === 'signup' ? '/api/auth/signup' : 
                       mode === 'login' ? '/api/auth/login' :
                       mode === 'forgot' ? '/api/auth/forgot-password' :
                       '/api/auth/reset-password';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, newPassword: password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (mode === 'login' || mode === 'signup') {
        onAuthSuccess(data.userId, data.is_new_user);
      } else if (mode === 'forgot') {
        setMode('reset');
        alert("Check your email for verification (mocked)");
      } else {
        setMode('login');
        alert("Password reset successful!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-2">Path & Pulse</h1>
          <p className="text-[#5A5A40] opacity-80">
            {mode === 'login' ? 'Welcome back! Please login.' :
             mode === 'signup' ? 'Create your account to start.' :
             mode === 'forgot' ? 'Reset your password.' : 'Set a new password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
              placeholder="your@email.com"
            />
          </div>

          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
                <Lock className="w-4 h-4" /> {mode === 'reset' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5A5A40]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
                <Lock className="w-4 h-4" /> Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-[#F5F5F0] border-none rounded-2xl focus:ring-2 focus:ring-[#5A5A40] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#5A5A40] text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition-colors shadow-lg shadow-[#5A5A40]/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
              <>
                {mode === 'login' ? 'Login' : mode === 'signup' ? 'Sign Up' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('signup')} className="text-sm text-[#5A5A40] hover:underline">
                Don't have an account? Sign Up
              </button>
              <br />
              <button onClick={() => setMode('forgot')} className="text-sm text-gray-400 hover:underline">
                Forgot Password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => setMode('login')} className="text-sm text-[#5A5A40] hover:underline">
              Already have an account? Login
            </button>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <button onClick={() => setMode('login')} className="text-sm text-[#5A5A40] hover:underline">
              Back to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
