'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import {
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Layers,
  TrendingUp,
  Leaf,
  ShieldCheck,
  PlusCircle,
  UploadCloud,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/dashboard/summary');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load dashboard data');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || (loading && user)) {
    return (
      <div className="max-w-7xl mx-auto py-32 text-center">
        <div className="font-editorial text-2xl text-[#8A8276] italic">
          Compiling institutional circularity ledger...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center space-y-5">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
          Access Gateway
        </span>
        <h2 className="font-editorial text-4xl text-[#1C1B18]">Authentication Required</h2>
        <p className="text-[14px] text-[#7A746B] max-w-md mx-auto">
          Please authenticate with your student, department, or administrative account to view your operational dashboard.
        </p>
        <div className="pt-2">
          <Link href="/login" className="btn-woodwrights-primary px-8 py-3 inline-block">
            Sign In To Account
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="p-6 bg-[#FCE8E8] border border-[#E8B8B8] text-[#802B2B] space-y-3">
          <div className="font-medium text-[14px]">Unable to load dashboard</div>
          <p className="text-[13px]">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-woodwrights-outline px-4 py-2 text-[10px]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Editorial Welcome Header */}
      <div className="border-b border-[#E8E3DA] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#8F5338] font-semibold">
              Operational Command Center
            </span>
            <span className="text-[#DDD7CE]">•</span>
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#8A8276] font-medium">
              {user.role === 'department'
                ? user.departmentName || 'Academic Department'
                : user.role === 'admin'
                ? 'Institutional Governance'
                : `Roll No: ${user.collegeId || 'Student'}`}
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal tracking-tight">
            Welcome, {user.name}
          </h1>

          <p className="text-[13px] sm:text-[14px] text-[#615C53] max-w-2xl font-light">
            {user.role === 'student' &&
              'Monitor your active resource reservations, review physical pickup coordinates, and track personal expenditure avoided.'}
            {user.role === 'department' &&
              'Review student equipment requests, monitor laboratory surplus allocation, and certify physical handovers.'}
            {user.role === 'admin' &&
              'High-level audit metrics, resource velocity across campus sectors, and cross-departmental impact.'}
          </p>
        </div>

        {/* Global Quick Action based on role */}
        <div className="flex flex-wrap items-center gap-3">
          {user.role === 'student' && (
            <>
              <Link href="/" className="btn-woodwrights-outline px-4 py-2.5">
                Browse Catalogue
              </Link>
              <Link href="/resources/new" className="btn-woodwrights-primary px-4 py-2.5">
                + List Peer Item
              </Link>
            </>
          )}

          {user.role === 'department' && (
            <>
              <Link href="/resources/bulk-import" className="btn-woodwrights-outline px-4 py-2.5 flex items-center space-x-2">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Bulk CSV Import</span>
              </Link>
              <Link href="/resources/new" className="btn-woodwrights-primary px-4 py-2.5">
                + Post Lab Resource
              </Link>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Link href="/admin" className="btn-woodwrights-outline px-4 py-2.5 flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Governance Portal</span>
              </Link>
              <Link href="/impact" className="btn-woodwrights-primary px-4 py-2.5">
                Full Impact Ledger
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Action Required Banner Section (For Student & Department) */}
      {data?.actionItems && data.actionItems.length > 0 && (
        <section className="bg-[#EEF6F9] border border-[#CDE1E8] p-6 space-y-4 shadow-wood">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#225163]">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[11px] tracking-[0.2em] uppercase font-bold">
                Action Required ({data.actionItems.length} {data.actionItems.length === 1 ? 'Task' : 'Tasks'} Awaiting Attention)
              </span>
            </div>
            <span className="text-[10px] tracking-[0.14em] uppercase text-[#4C7585]">
              Immediate Adjudication
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {data.actionItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#D5E6ED] p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[#1C1B18] leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 bg-[#E1EFF4] text-[#225163] border border-[#BEDAE3] font-medium whitespace-nowrap">
                      {item.type === 'decision_needed' ? 'Approval' : item.type === 'handover_pending' ? 'Handover' : 'Pickup'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6E675D] mt-1.5 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EBF4F7] flex items-center justify-between">
                  <span className="text-[10px] text-[#7595A3]">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Active'}
                  </span>
                  <Link
                    href={item.actionHref}
                    className="text-[10px] tracking-[0.14em] uppercase font-semibold text-[#1C1B18] hover:text-[#225163] inline-flex items-center space-x-1 transition-colors"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Role-Specific Dashboard Views */}
      {data?.role === 'student' && <StudentDashboardView data={data} />}
      {data?.role === 'department' && <DepartmentDashboardView data={data} />}
      {data?.role === 'admin' && <AdminDashboardView data={data} />}
    </div>
  );
}

// -------------------------------------------------------------
// STUDENT VIEW
// -------------------------------------------------------------
function StudentDashboardView({ data }) {
  const kpis = data.kpis || {};
  const recentRequests = data.recentRequests || [];

  return (
    <div className="space-y-12">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Active Requests
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#1C1B18]">
            {kpis.activeRequestsCount || 0}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            Awaiting decision or ready for pickup
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Items Received
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#2F442F]">
            {kpis.itemsReceivedCount || 0}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            Transfers verified and collected
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Personal Savings
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#1C1B18]">
            ₹{(kpis.savingsINR || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            Estimated procurement cost avoided
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            CO₂ Diverted
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#8F5338]">
            {(kpis.carbonKg || 0).toFixed(1)} <span className="text-xl font-sans font-light">kg</span>
          </div>
          <div className="text-[11px] text-[#6E675D]">
            Emissions averted via LCA benchmarking
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Requests & Fast Jump Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): My Recent Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
            <h3 className="font-editorial text-2xl text-[#1C1B18]">
              My Request Pipeline
            </h3>
            <Link
              href="/requests/my-requests"
              className="text-[11px] tracking-[0.14em] uppercase text-[#8A8276] hover:text-[#1C1B18] transition-colors font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="bg-white border border-[#E8E3DA] p-8 text-center space-y-3">
              <p className="text-[13px] text-[#7A746B]">
                You have not requested any campus equipment or study materials yet.
              </p>
              <Link href="/" className="btn-woodwrights-primary px-5 py-2 inline-block">
                Browse Campus Catalogue
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-[#E8E3DA] shadow-wood divide-y divide-[#E8E3DA]">
              {recentRequests.map((req) => (
                <div key={req._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[13px] font-semibold text-[#1C1B18]">
                        {req.resource?.title || 'Resource'}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="text-[12px] text-[#6E675D]">
                      Custodian: {req.resource?.owner?.departmentName || req.resource?.owner?.name || 'Department'} • Location: {req.resource?.location || 'Campus'}
                    </div>
                    <div className="text-[11px] text-[#8A8276]">
                      Requested Qty: {req.requestedQuantity} • {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <Link
                      href="/requests/my-requests"
                      className="btn-woodwrights-outline px-3 py-1.5 inline-block text-[10px]"
                    >
                      Track Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Peer Sharing & Shortcuts */}
        <div className="space-y-6">
          {/* Peer Sharing Card */}
          <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-4">
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold block">
              Peer-To-Peer Stewardship
            </span>
            <h4 className="font-editorial text-xl text-[#1C1B18]">
              Pass On Surplus Study Material
            </h4>
            <p className="text-[12px] text-[#6E675D] leading-relaxed">
              Have old semester textbooks, lab kits, or electronic peripherals? List them for peers rather than letting them gather dust.
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-[#F2ECE1]">
              <span className="text-[12px] text-[#1C1B18] font-medium">
                {kpis.myListingsCount || 0} Listed Items
              </span>
              <Link
                href="/resources/my-listings"
                className="text-[10px] tracking-[0.14em] uppercase text-[#8F5338] font-semibold hover:underline"
              >
                Manage Listings
              </Link>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-[#FAF8F5] border border-[#E8E3DA] p-6 space-y-3">
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold block">
              Quick Shortcuts
            </span>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link
                  href="/requests/incoming"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18] border-b border-[#E8E3DA]"
                >
                  <span>Inbound Peer Requests</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/impact"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18] border-b border-[#E8E3DA]"
                >
                  <span>Institutional Impact Ledger</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/new"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18]"
                >
                  <span>Post New Peer Listing</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DEPARTMENT VIEW
// -------------------------------------------------------------
function DepartmentDashboardView({ data }) {
  const kpis = data.kpis || {};
  const pendingQueue = data.pendingQueue || [];
  const recentCompleted = data.recentCompleted || [];

  return (
    <div className="space-y-12">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Lab Inventory
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#1C1B18]">
            {kpis.totalListings || 0}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            {kpis.availableUnits || 0} units currently unreserved
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Pending Reviews
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#8F5338]">
            {kpis.pendingReviewCount || 0}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            Student applications awaiting decision
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Completed Transfers
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#2F442F]">
            {kpis.unitsReusedCount || 0} <span className="text-xl font-sans font-light">units</span>
          </div>
          <div className="text-[11px] text-[#6E675D]">
            Mutual custody handovers verified
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Budget Savings Avoided
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#1C1B18]">
            ₹{(kpis.savingsINR || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            {(kpis.carbonKg || 0).toFixed(1)} kg CO₂ averted
          </div>
        </div>
      </div>

      {/* Main Section: Pending Requests Awaiting Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
            <h3 className="font-editorial text-2xl text-[#1C1B18]">
              Inbound Allocation Queue
            </h3>
            <Link
              href="/requests/incoming"
              className="text-[11px] tracking-[0.14em] uppercase text-[#8A8276] hover:text-[#1C1B18] transition-colors font-medium flex items-center space-x-1"
            >
              <span>Manage In Review</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="bg-white border border-[#E8E3DA] p-8 text-center space-y-2">
              <p className="text-[13px] text-[#7A746B]">
                All incoming student requests have been adjudicated. No pending items.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8E3DA] shadow-wood divide-y divide-[#E8E3DA]">
              {pendingQueue.map((req) => (
                <div key={req._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[13px] font-semibold text-[#1C1B18]">
                        {req.resource?.title || 'Resource'}
                      </span>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="text-[12px] text-[#6E675D]">
                      Applicant: {req.requester?.name} ({req.requester?.collegeId || req.requester?.email}) • Qty: {req.requestedQuantity}
                    </div>
                    <div className="text-[11px] text-[#8A8276] italic">
                      Purpose: "{req.purpose || 'Academic project'}"
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <Link
                      href="/requests/incoming"
                      className="btn-woodwrights-primary px-3 py-1.5 inline-block text-[10px]"
                    >
                      Adjudicate Request
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Handover Ledger */}
          <div className="pt-6 space-y-4">
            <h3 className="font-editorial text-2xl text-[#1C1B18] border-b border-[#E8E3DA] pb-3">
              Recent Verified Department Transfers
            </h3>

            {recentCompleted.length === 0 ? (
              <div className="bg-white border border-[#E8E3DA] p-6 text-center text-[13px] text-[#7A746B]">
                No completed transfers on record yet.
              </div>
            ) : (
              <div className="bg-white border border-[#E8E3DA] shadow-wood divide-y divide-[#E8E3DA]">
                {recentCompleted.map((t) => (
                  <div key={t._id} className="p-4 flex items-center justify-between text-[12px]">
                    <div>
                      <span className="font-medium text-[#1C1B18]">{t.resource?.title}</span>
                      <span className="text-[#8A8276] ml-2">({t.quantityTransferred} units to {t.receiver?.name})</span>
                    </div>
                    <div className="text-[#2F442F] font-semibold">
                      ₹{(t.impact?.estimatedSavingsINR || 0).toLocaleString()} Saved
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lab Surplus Operations */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-4">
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold block">
              Batch Ingestion Tool
            </span>
            <h4 className="font-editorial text-xl text-[#1C1B18]">
              Lab Surplus Bulk Importer
            </h4>
            <p className="text-[12px] text-[#6E675D] leading-relaxed">
              Have 10+ lab items, spare computer peripherals, or test components? Import them all in one click using the institutional CSV template.
            </p>
            <Link
              href="/resources/bulk-import"
              className="btn-woodwrights-outline w-full py-2.5 text-center block text-[10px]"
            >
              Open Bulk Importer
            </Link>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E8E3DA] p-6 space-y-3">
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold block">
              Department Controls
            </span>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link
                  href="/resources/my-listings"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18] border-b border-[#E8E3DA]"
                >
                  <span>My Active Inventory</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/requests/incoming"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18] border-b border-[#E8E3DA]"
                >
                  <span>Handover Verification Slips</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/resources/new"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18]"
                >
                  <span>Add Single Lab Item</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// ADMIN VIEW
// -------------------------------------------------------------
function AdminDashboardView({ data }) {
  const kpis = data.kpis || {};
  const categories = data.categoryDistribution || [];
  const recentTransfers = data.recentTransfers || [];

  return (
    <div className="space-y-12">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Institutional Users
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#1C1B18]">
            {kpis.totalUsers || 0}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            {kpis.studentsCount || 0} Students • {kpis.departmentsCount || 0} Depts
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Campus Inventory
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#1C1B18]">
            {kpis.totalResources || 0}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            {kpis.availableResources || 0} currently available
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Completed Transfers
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#2F442F]">
            {kpis.completedTransfersCount || 0}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            {kpis.totalUnitsReused || 0} total units exchanged
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-2">
          <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold">
            Campus Savings (INR)
          </span>
          <div className="font-editorial text-3xl sm:text-4xl text-[#8F5338]">
            ₹{(kpis.savingsINR || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-[#6E675D]">
            {(kpis.carbonKg || 0).toFixed(1)} kg CO₂ diverted
          </div>
        </div>
      </div>

      {/* Main Grid: Sector Distribution & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
            <h3 className="font-editorial text-2xl text-[#1C1B18]">
              Cross-Campus Audit Trail (Recent Transfers)
            </h3>
            <Link
              href="/admin"
              className="text-[11px] tracking-[0.14em] uppercase text-[#8A8276] hover:text-[#1C1B18] transition-colors font-medium flex items-center space-x-1"
            >
              <span>User Governance</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentTransfers.length === 0 ? (
            <div className="bg-white border border-[#E8E3DA] p-8 text-center text-[13px] text-[#7A746B]">
              No transfers verified on campus yet.
            </div>
          ) : (
            <div className="bg-white border border-[#E8E3DA] shadow-wood divide-y divide-[#E8E3DA]">
              {recentTransfers.map((t) => (
                <div key={t._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[13px] font-semibold text-[#1C1B18]">
                      {t.resource?.title} ({t.quantityTransferred} units)
                    </div>
                    <div className="text-[12px] text-[#6E675D]">
                      Donor: {t.giver?.departmentName || t.giver?.name} ➔ Recipient: {t.receiver?.name} ({t.receiver?.collegeId || t.receiver?.departmentName})
                    </div>
                    <div className="text-[11px] text-[#8A8276]">
                      Completed {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-[13px] font-semibold text-[#2F442F]">
                      ₹{(t.impact?.estimatedSavingsINR || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#8A8276]">
                      {(t.impact?.estimatedCarbonSavedKg || 0).toFixed(1)} kg CO₂
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Category Distribution & Governance Links */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E3DA] p-6 shadow-wood space-y-4">
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold block">
              Circularity By Sector
            </span>
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1C1B18] font-medium">{cat.name}</span>
                    <span className="text-[#8A8276]">{cat.unitsReused} units</span>
                  </div>
                  <div className="w-full bg-[#FAF8F5] border border-[#E8E3DA] h-1.5">
                    <div
                      className="bg-[#1C1B18] h-full"
                      style={{
                        width: `${Math.min(100, (cat.unitsReused / Math.max(1, kpis.totalUnitsReused || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E8E3DA] p-6 space-y-3">
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#8A8276] font-semibold block">
              Governance Actions
            </span>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link
                  href="/admin"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18] border-b border-[#E8E3DA]"
                >
                  <span>User Moderation (Activate/Suspend)</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
              <li>
                <Link
                  href="/impact"
                  className="flex items-center justify-between py-1.5 text-[#4A453D] hover:text-[#1C1B18]"
                >
                  <span>Institutional Impact Public Ledger</span>
                  <ArrowRight className="w-3 h-3 text-[#8A8276]" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
