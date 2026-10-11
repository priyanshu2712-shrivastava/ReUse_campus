'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const {
    isOpen,
    toggleSidebar,
    isMobileOpen,
    closeMobileSidebar,
  } = useSidebar();

  if (!user) {
    return null;
  }

  const isActiveRoute = (path) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const subnavItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      badge: 'Hub',
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'My Requests',
      href: '/dashboard/requests/my-requests',
      badge: 'Requisitions',
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      name: 'Incoming Review',
      href: '/dashboard/requests/incoming',
      badge: 'Review',
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4.5a1.5 1.5 0 00-1.5 1.5v.5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-.5a1.5 1.5 0 00-1.5-1.5H4"
          />
        </svg>
      ),
    },
    {
      name: 'My Inventory',
      href: '/dashboard/resources/my-listings',
      badge: 'Listings',
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      name: 'List Resource',
      href: '/dashboard/resources/new',
      badge: 'New',
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ];

  if (user.role === 'admin') {
    subnavItems.push({
      name: 'Governance',
      href: '/admin',
      badge: 'Admin',
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0 text-[#8F5338]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    });
  }

  const campusLinks = [
    {
      name: 'Catalogue',
      href: '/catalogue',
      icon: (
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      name: 'Check Surplus',
      href: '/check-surplus',
      icon: (
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Impact Ledger',
      href: '/impact',
      icon: (
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP STICKY SIDEBAR (Pinned on Left)                */}
      {/* ======================================================== */}
      <aside
        className={`hidden md:block flex-shrink-0 bg-[#FAF8F5] border-r border-[#E8E3DA] transition-all duration-300 z-30 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto ${
          isOpen ? 'w-64 xl:w-72' : 'w-16'
        }`}
      >
        <div className="min-h-full flex flex-col justify-between p-3.5 lg:p-4">
          <div className="space-y-6">
            {/* User Profile Card */}
            {isOpen ? (
              <div className="p-3.5 bg-[#F4EFEA] border border-[#E8E3DA] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#7A746B] font-semibold">
                    Workspace
                  </span>
                  <span
                    className={`text-[9px] tracking-wider uppercase font-semibold px-1.5 py-0.5 border ${
                      user.role === 'admin'
                        ? 'border-[#8F5338] text-[#8F5338] bg-[#FDF6F2]'
                        : 'border-[#4C5847] text-[#4C5847] bg-[#F3F6F2]'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#1C1B18] text-[#FAF8F5] font-editorial text-lg flex items-center justify-center flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-[#1C1B18] truncate leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] tracking-wider uppercase text-[#8A8276] truncate mt-0.5">
                      {user.departmentName || user.collegeId || user.email}
                    </div>
                  </div>
                </div>

                {/* Primary Quick Action Button -> Navigate to new resource page */}
                <Link
                  href="/dashboard/resources/new"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1C1B18] hover:bg-[#38342E] text-[#FAF8F5] text-[10px] tracking-[0.14em] uppercase font-semibold transition-all shadow-xs"
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
              </div>
            ) : (
              /* Collapsed Avatar and Action */
              <div className="flex flex-col items-center space-y-3 pt-1">
                <div
                  className="w-9 h-9 rounded-full bg-[#1C1B18] text-[#FAF8F5] font-editorial text-lg flex items-center justify-center"
                  title={`${user.name} (${user.departmentName || user.role})`}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <Link
                  href="/dashboard/resources/new"
                  title="List New Resource"
                  className="w-9 h-9 bg-[#1C1B18] hover:bg-[#38342E] text-[#FAF8F5] flex items-center justify-center rounded-xs transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Subnavigation Section -> Nested Dashboard Routes */}
            <div className="space-y-1.5">
              {isOpen && (
                <div className="px-2 pb-1 text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
                  Resource Stewardship
                </div>
              )}
              <nav className="space-y-1">
                {subnavItems.map((item) => {
                  const active = isActiveRoute(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!isOpen ? item.name : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.08em] uppercase font-medium transition-all text-left ${
                        isOpen ? 'rounded-xs' : 'justify-center rounded-xs px-2'
                      } ${
                        active
                          ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs'
                          : 'text-[#58534C] hover:text-[#1C1B18] hover:bg-[#EDE7DE]'
                      }`}
                    >
                      <span className={active ? 'text-[#FAF8F5]' : 'text-[#7A746B]'}>
                        {item.icon}
                      </span>
                      {isOpen && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.name}</span>
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FAF8F5] flex-shrink-0"></span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Secondary Campus Exchange Navigation */}
            <div className="space-y-1.5 pt-3 border-t border-[#E8E3DA]">
              {isOpen && (
                <div className="px-2 pb-1 text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
                  Campus Exchange
                </div>
              )}
              <nav className="space-y-1">
                {campusLinks.map((item) => {
                  const active = isActiveRoute(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!isOpen ? item.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2 text-[11px] tracking-[0.08em] uppercase font-medium transition-colors ${
                        isOpen ? 'rounded-xs' : 'justify-center rounded-xs px-2'
                      } ${
                        active
                          ? 'text-[#1C1B18] font-bold bg-[#E8E3DA]/60'
                          : 'text-[#7A746B] hover:text-[#1C1B18] hover:bg-[#EDE7DE]'
                      }`}
                    >
                      <span className="text-[#8A8276]">{item.icon}</span>
                      {isOpen && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="pt-4 border-t border-[#E8E3DA] space-y-2">
            <button
              onClick={logout}
              title={!isOpen ? 'Sign Out' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] tracking-[0.14em] uppercase text-[#7A746B] hover:text-[#B91C1C] hover:bg-[#FDF2F2] rounded-xs transition-colors cursor-pointer ${
                isOpen ? '' : 'justify-center px-2'
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {isOpen && <span className="font-semibold">Sign Out</span>}
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={toggleSidebar}
              title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[9px] tracking-[0.18em] uppercase text-[#8A8276] hover:text-[#1C1B18] hover:bg-[#EDE7DE] rounded-xs transition-colors cursor-pointer ${
                isOpen ? 'justify-between' : 'justify-center px-2'
              }`}
            >
              {isOpen && <span>Collapse Sidebar</span>}
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOpen ? '' : 'rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER SIDEBAR                                  */}
      {/* ======================================================== */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />

          <div className="relative w-72 sm:w-80 max-w-[85vw] bg-[#FAF8F5] border-r border-[#E8E3DA] h-full shadow-2xl flex flex-col justify-between p-5 overflow-y-auto z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DA]">
                <div>
                  <span className="font-editorial text-xl font-medium tracking-tight text-[#1C1B18]">
                    ReUse Campus
                  </span>
                </div>
                <button
                  onClick={closeMobileSidebar}
                  className="p-1.5 text-[#1C1B18] hover:bg-[#E8E3DA] rounded-xs cursor-pointer"
                  aria-label="Close Sidebar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-3.5 bg-[#F4EFEA] border border-[#E8E3DA] space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#1C1B18] text-[#FAF8F5] font-editorial text-lg flex items-center justify-center flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#1C1B18] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] tracking-wider uppercase text-[#8A8276] truncate">
                      {user.departmentName || user.collegeId || user.role}
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard/resources/new"
                  onClick={closeMobileSidebar}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1C1B18] hover:bg-[#38342E] text-[#FAF8F5] text-[11px] tracking-[0.14em] uppercase font-semibold transition-all shadow-xs"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>List New Resource</span>
                </Link>
              </div>

              {/* Subnavigation Section */}
              <div className="space-y-2">
                <div className="px-2 text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
                  Resource Stewardship
                </div>
                <nav className="space-y-1">
                  {subnavItems.map((item) => {
                    const active = isActiveRoute(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileSidebar}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-[0.1em] uppercase font-medium rounded-xs transition-all text-left ${
                          active
                            ? 'bg-[#1C1B18] text-[#FAF8F5]'
                            : 'text-[#58534C] hover:text-[#1C1B18] hover:bg-[#EDE7DE]'
                        }`}
                      >
                        <span className={active ? 'text-[#FAF8F5]' : 'text-[#7A746B]'}>
                          {item.icon}
                        </span>
                        <div className="flex-1 flex items-center justify-between">
                          <span>{item.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-xs ${
                              active
                                ? 'bg-[#FAF8F5]/20 text-[#FAF8F5]'
                                : 'bg-[#E8E3DA] text-[#615C53]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Campus Links */}
              <div className="space-y-2 pt-3 border-t border-[#E8E3DA]">
                <div className="px-2 text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
                  Campus Exchange
                </div>
                <nav className="space-y-1">
                  {campusLinks.map((item) => {
                    const active = isActiveRoute(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileSidebar}
                        className={`flex items-center gap-3 px-3 py-2 text-[11px] tracking-[0.1em] uppercase font-medium rounded-xs transition-colors ${
                          active
                            ? 'text-[#1C1B18] font-bold bg-[#E8E3DA]'
                            : 'text-[#7A746B] hover:text-[#1C1B18] hover:bg-[#EDE7DE]'
                        }`}
                      >
                        <span className="text-[#8A8276]">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-[#E8E3DA] space-y-3">
              <button
                onClick={() => {
                  closeMobileSidebar();
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-[#E8E3DA] hover:border-[#B91C1C] text-[11px] tracking-[0.14em] uppercase font-medium text-[#7A746B] hover:text-[#B91C1C] transition-colors rounded-xs cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
