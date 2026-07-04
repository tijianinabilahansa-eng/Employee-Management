/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Hardcoded credentials for functional login validation
      const isValidAdmin = username === 'admin' && password === 'admin123';
      const isValidManager = username === 'manager' && password === 'manager123';

      if (isValidAdmin || isValidManager) {
        onLoginSuccess(username);
      } else {
        setError('Username atau Password salah. Silakan coba lagi.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        id="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-200/60"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 id="login-heading" className="text-2xl font-bold text-slate-900 tracking-tight">
            EmpowerHR Portal
          </h2>
          <p className="mt-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Clean Minimalist Employee Workspace
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              id="login-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 text-slate-900 transition-all bg-gray-50/50"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 text-slate-900 transition-all bg-gray-50/50"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              id="login-button"
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Masuk'
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper Card */}
        <div id="demo-credentials" className="mt-6 p-4 bg-slate-55 bg-gray-50 rounded-xl border border-gray-200/80 text-xs text-slate-700 space-y-1.5">
          <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Kredensial Demo (Hardcoded):</p>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>
              <p className="font-semibold text-[10px] uppercase tracking-wider text-blue-600">Administrator</p>
              <p>User: <strong className="font-semibold text-slate-900">admin</strong></p>
              <p>Pass: <strong className="font-semibold text-slate-900">admin123</strong></p>
            </div>
            <div>
              <p className="font-semibold text-[10px] uppercase tracking-wider text-blue-600">Manager</p>
              <p>User: <strong className="font-semibold text-slate-900">manager</strong></p>
              <p>Pass: <strong className="font-semibold text-slate-900">manager123</strong></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
