'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import HandoverSlipModal from '@/components/HandoverSlipModal';

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSlipReq, setActiveSlipReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests/my-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConfirmReceipt = async (requestId) => {
    setActionLoading(requestId);
    setMessage('');
    try {
      const res = await fetch('/api/transfers/confirm-receiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm receipt');
      setMessage(data.message);
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this transfer request?')) return;
    setActionLoading(requestId);
    setMessage('');
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel request');
      setMessage('Request has been cancelled.');
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => ['approved', 'ready_for_pickup'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
    closed: requests.filter((r) => ['rejected', 'cancelled'].includes(r.status)).length,
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return req.status === 'pending';
    if (statusFilter === 'approved') return ['approved', 'ready_for_pickup'].includes(req.status);
    if (statusFilter === 'completed') return req.status === 'completed';
    if (statusFilter === 'closed') return ['rejected', 'cancelled'].includes(req.status);
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All Requests' },
    { id: 'pending', label: 'Pending Review' },
    { id: 'approved', label: 'Approved / Handover' },
    { id: 'completed', label: 'Completed' },
    { id: 'closed', label: 'Declined / Cancelled' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E8E3DA] pb-8 space-y-2">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
          Acquisition Tracking
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal">
          My Resource Requests
        </h1>
        <p className="text-[13px] text-[#615C53]">
          Track status of items you have requested across campus, schedule pickups, and confirm receipts.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-[#EAF5EA] text-[#2C542C] text-[13px] border border-[#B8D8B8]">
          ✓ {message}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-editorial text-2xl text-[#8A8276] italic">
          Loading your request history...
        </div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E8E3DA] space-y-4 p-8">
          <h3 className="font-editorial text-2xl text-[#1C1B18]">No active requests found</h3>
          <p className="text-[13px] text-[#7A746B] max-w-md mx-auto">
            You haven't requested any campus items yet. Browse available textbooks, computing components, or lab apparatus.
          </p>
          <Link href="/" className="btn-woodwrights-primary px-6 py-2.5 inline-block">
            Explore Campus Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E3DA] pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 text-[11px] tracking-[0.14em] uppercase font-semibold transition-all flex items-center space-x-2 border ${
                  statusFilter === tab.id
                    ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18]'
                    : 'bg-white text-[#6B655C] border-[#E8E3DA] hover:border-[#1C1B18] hover:text-[#1C1B18]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    statusFilter === tab.id
                      ? 'bg-[#38342E] text-white'
                      : 'bg-[#FAF8F5] text-[#8A8276]'
                  }`}
                >
                  {counts[tab.id] || 0}
                </span>
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#E8E3DA] space-y-2 p-8">
              <h4 className="font-editorial text-2xl text-[#1C1B18]">No requests in this category</h4>
              <p className="text-[13px] text-[#7A746B]">
                There are no requests matching the selected status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((req) => {
                const resItem = req.resource;
                const transfer = req.transfer;
                const isApproved = req.status === 'approved' || req.status === 'ready_for_pickup';
                const isCompleted = req.status === 'completed';
                const hasReceiverConfirmed = transfer?.receiverConfirmedAt;
                const hasGiverConfirmed = transfer?.giverConfirmedAt;

                return (
              <div
                key={req._id}
                className="bg-white border border-[#E8E3DA] p-6 lg:p-8 space-y-6 hover:shadow-wood transition-shadow"
              >
                {/* Top Row: Status and Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE4] pb-4">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={req.status} />
                    <span className="text-[11px] text-[#8A8276]">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-[12px] font-medium text-[#1C1B18]">
                    Units Requested: <strong>{req.requestedQuantity}</strong>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-8 space-y-3">
                    <h3 className="font-editorial text-2xl text-[#1C1B18]">
                      <Link
                        href={`/resources/${resItem?._id}`}
                        className="hover:underline hover:text-[#7A502E]"
                      >
                        {resItem?.title || 'Unknown Resource'}
                      </Link>
                    </h3>

                    <div className="text-[13px] text-[#544F46] space-y-1">
                      <div>
                        <strong>Stated Purpose:</strong> {req.purpose}
                      </div>
                      <div>
                        <strong>Pickup Point:</strong> 📍 {resItem?.location}
                      </div>
                      <div>
                        <strong>Custodian:</strong> {resItem?.owner?.name} (
                        {resItem?.owner?.departmentName || 'Campus Member'}
                        ) {resItem?.owner?.phone && `• Tel: ${resItem?.owner?.phone}`}
                      </div>
                    </div>

                    {req.decisionNote && (
                      <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DA] text-[12px] text-[#696156]">
                        <strong>Custodian Note:</strong> {req.decisionNote}
                      </div>
                    )}

                    {req.pickupScheduledAt && (
                      <div className="text-[12px] text-[#2F442F] font-medium">
                        🗓️ Scheduled Pickup: {new Date(req.pickupScheduledAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Right Handover Status / Actions */}
                  <div className="md:col-span-4 bg-[#FAF8F5] border border-[#E8E3DA] p-5 space-y-4">
                    <span className="text-[10px] tracking-[0.18em] uppercase text-[#8A8276] font-semibold block">
                      Handover Protocol
                    </span>

                    {/* Checkmarks */}
                    <div className="space-y-2 text-[12px]">
                      <div className="flex items-center space-x-2">
                        <span className={hasGiverConfirmed ? 'text-[#2F442F]' : 'text-[#8A8276]'}>
                          {hasGiverConfirmed ? '✓' : '○'}
                        </span>
                        <span className={hasGiverConfirmed ? 'text-[#2F442F] font-medium' : 'text-[#7A746B]'}>
                          {hasGiverConfirmed
                            ? `Donor Handover Confirmed (${new Date(transfer.giverConfirmedAt).toLocaleDateString()})`
                            : 'Awaiting Donor Handover'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={hasReceiverConfirmed ? 'text-[#2F442F]' : 'text-[#8A8276]'}>
                          {hasReceiverConfirmed ? '✓' : '○'}
                        </span>
                        <span
                          className={hasReceiverConfirmed ? 'text-[#2F442F] font-medium' : 'text-[#7A746B]'}
                        >
                          {hasReceiverConfirmed
                            ? `Receipt Confirmed by You (${new Date(transfer.receiverConfirmedAt).toLocaleDateString()})`
                            : 'Your Receipt Confirmation Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {isApproved && !hasReceiverConfirmed && (
                      <button
                        onClick={() => handleConfirmReceipt(req._id)}
                        disabled={actionLoading === req._id}
                        className="btn-woodwrights-primary w-full py-3 text-center text-[11px]"
                      >
                        {actionLoading === req._id ? 'Confirming...' : 'I Have Received This Item'}
                      </button>
                    )}

                    {isCompleted && (
                      <div className="p-3 bg-[#EAF5EA] text-[#2F442F] text-[11px] font-medium text-center border border-[#CFE6CF]">
                        ✓ Transfer Complete & Impact Recorded
                      </div>
                    )}

                    {(isApproved || isCompleted) && (
                      <button
                        onClick={() => setActiveSlipReq(req)}
                        type="button"
                        className="btn-woodwrights-outline w-full py-2 text-center text-[11px] tracking-wider uppercase flex items-center justify-center space-x-1.5 hover:border-[#1C1B18] transition-colors"
                      >
                        <span>📄 View Handover Pass</span>
                      </button>
                    )}

                    {['pending', 'approved'].includes(req.status) && !hasReceiverConfirmed && (
                      <button
                        onClick={() => handleCancelRequest(req._id)}
                        disabled={actionLoading === req._id}
                        className="w-full text-center text-[10px] tracking-[0.14em] uppercase text-[#8A8276] hover:text-[#803333] transition-colors pt-2 block"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}

  {activeSlipReq && (
    <HandoverSlipModal
      req={activeSlipReq}
      onClose={() => setActiveSlipReq(null)}
    />
  )}
</div>
);
}
