'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [phone, setPhone] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        password,
        role: 'user',
        departmentName,
        collegeId,
        phone,
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
          Institutional Onboarding
        </span>
        <h1 className="font-editorial text-4xl text-[#1C1B18] font-normal">
          Create Campus Account
        </h1>
        <p className="text-[13px] text-[#6E675D]">
          Register to list, discover, and exchange campus resources
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#FCE8E8] text-[#802B2B] text-[13px] border border-[#E8B8B8]">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E8E3DA] p-8 shadow-wood space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Patel or Prof. S. Sharma"
              required
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Campus Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@campus.edu"
              required
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Password * (Min 6 Characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Validate password on each change
                const pwd = e.target.value;
                const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;
                if (pwd.length === 0) {
                  setPasswordError('');
                } else if (!regex.test(pwd)) {
                  setPasswordError('Password must be at least 6 characters, include an uppercase letter and a special character');
                } else {
                  setPasswordError('');
                }
              }}
              placeholder="••••••••"
              required
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
            {passwordError && (
              <p className="text-xs text-red-600 mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Department / Facility Name (Optional)
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="e.g. Computer Science & Engineering, Physics Lab, SAC"
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Roll / Student Enrollment Number (Optional)
            </label>
            <input
              type="text"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder="e.g. 2024CSE045"
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
              Contact Phone (For Handover Pickups)
            </label>
            <input
              type="tel"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                setPhone(e.target.value);
                const ph = e.target.value.replace(/\D/g, ''); // strip non-digits
                const regex = /^[6-9]\d{9}$/;
                if (ph.length === 0) {
                  setPhoneError('');
                } else if (!regex.test(ph)) {
                  setPhoneError('Enter a valid 10‑digit Indian mobile number starting with 6‑9');
                } else {
                  setPhoneError('');
                }
              }}
              placeholder="+91 98765 43210"
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            />
            {phoneError && (
              <p className="text-xs text-red-600 mt-1">{phoneError}</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-woodwrights-primary w-full py-3.5 text-center text-[11px] tracking-[0.16em]"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#E8E3DA] text-center text-[12px] text-[#7A746B]">
          Already have a campus account?{' '}
          <Link href="/login" className="text-[#1C1B18] font-semibold underline underline-offset-4">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
