'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;
  const isLandingPage = pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md hairline-bottom">
      {/* Top Announcement Bar */}
      <div className="bg-[#1C1B18] text-[#FAF8F5] text-[10px] tracking-[0.22em] uppercase py-2 px-4 text-center font-medium">
        A Circular Campus Exchange — Minimizing Academic Resource Waste
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex flex-col group">
            <span className="font-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1B18] group-hover:opacity-80 transition-opacity">
              ReUse Campus
            </span>
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#8A8276] -mt-1 font-sans">
              Inter-Departmental Stewardship
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {/* <nav className="hidden md:flex items-center space-x-7">
            <Link
              href="/catalogue"
              className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                isActive('/catalogue')
                  ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1 font-semibold'
                  : 'text-[#6B655C] hover:text-[#1C1B18]'
              }`}
            >
              Catalogue
            </Link>

            <Link
              href="/check-surplus"
              className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/check-surplus')
                  ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1 font-semibold'
                  : 'text-[#6B655C] hover:text-[#1C1B18]'
              }`}
            >
              <span>Check Surplus</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4C5847]"></span>
            </Link>

            <Link
              href="/impact"
              className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                isActive('/impact')
                  ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1 font-semibold'
                  : 'text-[#6B655C] hover:text-[#1C1B18]'
              }`}
            >
              Impact Ledger
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1' : 'text-[#6B655C] hover:text-[#1C1B18]'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/requests/my-requests"
                  className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                    isActive('/requests/my-requests') ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1' : 'text-[#6B655C] hover:text-[#1C1B18]'
                  }`}
                >
                  My Requests
                </Link>

                <Link
                  href="/requests/incoming"
                  className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                    isActive('/requests/incoming') ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1' : 'text-[#6B655C] hover:text-[#1C1B18]'
                  }`}
                >
                  Incoming Review
                </Link>

                <Link
                  href="/resources/my-listings"
                  className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                    isActive('/resources/my-listings') ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1' : 'text-[#6B655C] hover:text-[#1C1B18]'
                  }`}
                >
                  My Inventory
                </Link>

                {(user?.role === 'department' || user?.role === 'admin') && (
                  <Link
                    href="/resources/bulk-import"
                    className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                      isActive('/resources/bulk-import') ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1' : 'text-[#6B655C] hover:text-[#1C1B18]'
                    }`}
                  >
                    Bulk Import
                  </Link>
                )}
              </>
            )}

            {user?.role === 'admin' && (
              <Link
                href="/dashboard"
                className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1 font-semibold'
                    : 'text-[#6B655C] hover:text-[#1C1B18]'
                }`}
              >
                <span>Dashboard</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8F5338]"></span>
              </Link>
            )}
          </nav> */}

          {/* Action Area: Post Resource / Account Controls */}
          {/* <div className="hidden md:flex items-center space-x-5">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/resources/new"
                  className={`text-[11px] tracking-[0.16em] uppercase font-medium transition-colors ${
                    isActive('/resources/new')
                      ? 'text-[#1C1B18] border-b border-[#1C1B18] pb-1'
                      : 'text-[#6B655C] hover:text-[#1C1B18]'
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>List Resource</span>
                </Link>

                <div className="h-6 w-[1px] bg-[#E8E3DA]"></div>

                <Link href="/dashboard" className="text-right group">
                  <div className="text-[12px] font-medium text-[#1C1B18] group-hover:underline leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[9px] tracking-[0.14em] uppercase text-[#8A8276]">
                    {user.departmentName || user.collegeId || user.role}
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="text-[10px] tracking-[0.14em] uppercase text-[#8A8276] hover:text-[#B91C1C] transition-colors underline underline-offset-4"
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-[11px] tracking-[0.16em] uppercase font-medium text-[#1C1B18] hover:opacity-75 transition-opacity"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-woodwrights-primary px-4 py-2.5 inline-flex items-center justify-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div> */}

          {/* Mobile Navigation Controls */}
          <div className="md:hidden flex items-center space-x-2">
            {user && !isLandingPage && (
              <button
                onClick={toggleMobileSidebar}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] tracking-[0.12em] uppercase font-semibold bg-[#1C1B18] text-[#FAF8F5] rounded-xs"
                aria-label="Open Workspace Sidebar"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
                </svg>
                {/* <span>Workspace</span> */}
              </button>
            )}

            {/* <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#1C1B18] p-2 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <span className="block w-6 h-[1px] bg-[#1C1B18] mb-1.5"></span>
              <span className="block w-6 h-[1px] bg-[#1C1B18] mb-1.5"></span>
              <span className="block w-4 h-[1px] bg-[#1C1B18]"></span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {/* {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] hairline-top px-6 py-6 space-y-4">
          <Link
            href="/catalogue"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[12px] tracking-[0.18em] uppercase font-medium text-[#1C1B18]"
          >
            Catalogue
          </Link>
          <Link
            href="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[12px] tracking-[0.18em] uppercase font-medium text-[#1C1B18]"
          >
            Impact Ledger
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[12px] tracking-[0.18em] uppercase font-medium text-[#1C1B18]"
              >
                Dashboard
              </Link>
              <Link
                href="/requests/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[12px] tracking-[0.18em] uppercase font-medium text-[#1C1B18]"
              >
                My Requests
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[12px] tracking-[0.18em] uppercase font-semibold text-[#8F5338]"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleMobileSidebar();
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 bg-[#F4EFEA] border border-[#E8E3DA] text-[11px] tracking-[0.14em] uppercase font-semibold text-[#1C1B18]"
              >
                <span>Open Workspace Sidebar</span>
                <span>→</span>
              </button>

              <Link
                href="/resources/bulk-import"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[12px] tracking-[0.18em] uppercase font-medium text-[#1C1B18]"
              >
                Bulk CSV Import
              </Link>
              <Link
                href="/resources/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[12px] tracking-[0.18em] uppercase font-medium text-[#1C1B18]"
              >
                List Resource
              </Link>

              <div className="pt-4 hairline-top flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-[#1C1B18]">{user.name}</div>
                  <div className="text-[10px] tracking-[0.14em] uppercase text-[#8A8276]">
                    {user.departmentName || user.collegeId || user.role}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-[11px] tracking-[0.14em] uppercase text-[#8A8276] hover:text-[#B91C1C]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block btn-woodwrights-outline text-center py-2.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block btn-woodwrights-primary text-center py-2.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )} */}
    </header>
  );
}
