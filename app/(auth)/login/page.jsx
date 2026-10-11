'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Campus@123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      {/* Editorial Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
          Access Gateway
        </span>
        <h1 className="font-editorial text-4xl text-[#1C1B18] font-normal">
          Campus Sign In
        </h1>
        <p className="text-[13px] text-[#6E675D]">
          Authenticate using your institutional credentials
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#FCE8E8] text-[#802B2B] text-[13px] border border-[#E8B8B8]">
          {error}
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white border border-[#E8E3DA] p-8 shadow-wood space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. cse.lab@campus.edu or student@campus.edu"
              required
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-woodwrights-primary w-full py-3.5 text-center text-[11px] tracking-[0.16em]"
            >
              {loading ? 'Authenticating...' : 'Sign In To Account'}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E8E3DA] text-center text-[12px] text-[#7A746B]">
          New to campus?{' '}
          <Link href="/register" className="text-[#1C1B18] font-semibold underline underline-offset-4">
            Register Here
          </Link>
        </div>
      </div>

      {/* Fast Demo Credentials for Evaluation */}
      <div className="bg-[#FAF8F5] border border-[#E8E3DA] p-6 space-y-3">
        <div className="text-[10px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold text-center">
          Evaluator Quick-Select (Password: Campus@123)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleQuickDemo('priya.student@campus.edu')}
            className="p-2 bg-white border border-[#E8E3DA] text-[11px] text-[#332F2A] hover:border-[#1C1B18] text-center transition-colors"
          >
            <div className="font-semibold">User</div>
            <div className="text-[9px] text-[#8A8276]">Priya Sundaram</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin@campus.edu')}
            className="p-2 bg-white border border-[#E8E3DA] text-[11px] text-[#332F2A] hover:border-[#1C1B18] text-center transition-colors"
          >
            <div className="font-semibold text-[#8F5338]">Admin</div>
            <div className="text-[9px] text-[#8A8276]">Dr. Evelyn Vance</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-24 text-center text-[#8A8276] font-editorial text-xl italic">
          Loading sign in gateway...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
