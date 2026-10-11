'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import HandoverSlipModal from '@/components/HandoverSlipModal';

export default function IncomingRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSlipReq, setActiveSlipReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  // Approval modal state
  const [decisionModalReq, setDecisionModalReq] = useState(null);
  const [decisionAction, setDecisionAction] = useState('approve'); // 'approve' | 'reject'
  const [decisionNote, setDecisionNote] = useState('');
  const [pickupScheduledAt, setPickupScheduledAt] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests/incoming');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch incoming requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openDecisionModal = (req, action) => {
    setDecisionModalReq(req);
    setDecisionAction(action);
    setDecisionNote('');
    setPickupScheduledAt('');
    setPickupNotes(req.resource?.pickupInstructions || '');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!decisionModalReq) return;

    setModalSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/requests/${decisionModalReq._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: decisionAction,
          decisionNote,
          pickupScheduledAt: pickupScheduledAt || null,
          pickupNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update request');

      setMessage(data.message);
      setDecisionModalReq(null);
      fetchRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleConfirmGiverHandover = async (requestId) => {
    setActionLoading(requestId);
    setMessage('');
    try {
      const res = await fetch('/api/transfers/confirm-giver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm handover');
      setMessage(data.message);
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
          Donor Allocation Portal
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal">
          Incoming Resource Applications
        </h1>
        <p className="text-[13px] text-[#615C53]">
          Review applications for items you custodian, allocate quantities atomically, and confirm physical handover.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-[#EAF5EA] text-[#2C542C] text-[13px] border border-[#B8D8B8]">
          ✓ {message}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-editorial text-2xl text-[#8A8276] italic">
          Loading incoming applications...
        </div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E8E3DA] space-y-4 p-8">
          <h3 className="font-editorial text-2xl text-[#1C1B18]">No incoming applications</h3>
          <p className="text-[13px] text-[#7A746B] max-w-md mx-auto">
            You currently have no pending requests for your listed items. New requests from students or departments will appear here.
          </p>
          <Link href="/" className="btn-woodwrights-outline px-6 py-2.5 inline-block">
            View Public Catalogue
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
                const requester = req.requester;
                const transfer = req.transfer;
                const isApproved = req.status === 'approved' || req.status === 'ready_for_pickup';
                const isCompleted = req.status === 'completed';
            const hasGiverConfirmed = transfer?.giverConfirmedAt;
            const hasReceiverConfirmed = transfer?.receiverConfirmedAt;

            return (
              <div
                key={req._id}
                className="bg-white border border-[#E8E3DA] p-6 lg:p-8 space-y-6 hover:shadow-wood transition-shadow"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE4] pb-4">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={req.status} />
                    <span className="text-[11px] text-[#8A8276]">
                      Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-[12px] font-medium text-[#1C1B18]">
                    Requested Units: <strong>{req.requestedQuantity}</strong> (Currently unreserved in stock:{' '}
                    {resItem?.availableQuantity})
                  </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-8 space-y-3">
                    <h3 className="font-editorial text-2xl text-[#1C1B18]">
                      {resItem?.title || 'Unknown Resource'}
                    </h3>

                    {/* Applicant Profile */}
                    <div className="p-4 bg-[#FAF8F5] border border-[#E8E3DA] space-y-1 text-[13px] text-[#4A453D]">
                      <div className="text-[10px] tracking-[0.16em] uppercase text-[#8A8276] font-semibold">
                        Applicant Information
                      </div>
                      <div className="font-medium text-[#1C1B18]">
                        {requester?.name} ({requester?.departmentName || 'Campus Member'}
                        {requester?.collegeId && ` • ID: ${requester?.collegeId}`})
                      </div>
                      <div className="text-[12px] text-[#6E675D]">
                        Email: {requester?.email} {requester?.phone && `• Phone: ${requester?.phone}`}
                      </div>
                    </div>

                    <div className="text-[13px] text-[#544F46]">
                      <strong>Applicant's Stated Reuse Purpose:</strong>
                      <p className="mt-1 p-3 bg-white border border-[#E8E3DA] italic text-[#4A453D]">
                        "{req.purpose}"
                      </p>
                    </div>

                    {req.decisionNote && (
                      <div className="text-[12px] text-[#6B655C]">
                        <strong>Your Decision Note:</strong> {req.decisionNote}
                      </div>
                    )}
                  </div>

                  {/* Actions / Handover Protocol */}
                  <div className="md:col-span-4 bg-[#FAF8F5] border border-[#E8E3DA] p-5 space-y-4">
                    <span className="text-[10px] tracking-[0.18em] uppercase text-[#8A8276] font-semibold block">
                      Handover Protocol
                    </span>

                    {/* Pending Actions */}
                    {req.status === 'pending' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => openDecisionModal(req, 'approve')}
                          className="btn-woodwrights-primary w-full py-2.5 text-center text-[11px]"
                        >
                          Approve & Allocate Units
                        </button>
                        <button
                          onClick={() => openDecisionModal(req, 'reject')}
                          className="btn-woodwrights-outline w-full py-2 text-center text-[11px] text-[#803333] border-[#CCAAAA]"
                        >
                          Decline Request
                        </button>
                      </div>
                    )}

                    {/* Handover Checkpoints */}
                    {isApproved && (
                      <div className="space-y-4">
                        <div className="space-y-2 text-[12px]">
                          <div className="flex items-center space-x-2">
                            <span className={hasGiverConfirmed ? 'text-[#2F442F]' : 'text-[#8A8276]'}>
                              {hasGiverConfirmed ? '✓' : '○'}
                            </span>
                            <span
                              className={
                                hasGiverConfirmed ? 'text-[#2F442F] font-medium' : 'text-[#7A746B]'
                              }
                            >
                              {hasGiverConfirmed
                                ? `You Confirmed Handover (${new Date(
                                    transfer.giverConfirmedAt
                                  ).toLocaleDateString()})`
                                : 'Pending Your Handover Confirmation'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={hasReceiverConfirmed ? 'text-[#2F442F]' : 'text-[#8A8276]'}>
                              {hasReceiverConfirmed ? '✓' : '○'}
                            </span>
                            <span
                              className={
                                hasReceiverConfirmed ? 'text-[#2F442F] font-medium' : 'text-[#7A746B]'
                              }
                            >
                              {hasReceiverConfirmed
                                ? `Recipient Receipt Confirmed (${new Date(
                                    transfer.receiverConfirmedAt
                                  ).toLocaleDateString()})`
                                : 'Awaiting Recipient Receipt Confirmation'}
                            </span>
                          </div>
                        </div>

                        {!hasGiverConfirmed && (
                          <button
                            onClick={() => handleConfirmGiverHandover(req._id)}
                            disabled={actionLoading === req._id}
                            className="btn-woodwrights-primary w-full py-3 text-center text-[11px]"
                          >
                            {actionLoading === req._id ? 'Recording...' : 'Confirm Physical Handover'}
                          </button>
                        )}
                      </div>
                    )}

                    {isCompleted && (
                      <div className="p-3 bg-[#EAF5EA] text-[#2F442F] text-[11px] font-medium text-center border border-[#CFE6CF]">
                        ✓ Handover Completed & Verified
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}

      {/* Decision Modal */}
      {decisionModalReq && (
        <div className="fixed inset-0 z-50 bg-[#1C1B18]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-lg w-full border border-[#E8E3DA] shadow-wood-modal p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold">
                  Custodian Adjudication
                </span>
                <h3 className="font-editorial text-2xl text-[#1C1B18] mt-1 capitalize">
                  {decisionAction === 'approve' ? 'Approve Transfer Request' : 'Decline Request'}
                </h3>
              </div>
              <button
                onClick={() => setDecisionModalReq(null)}
                className="text-[#8A8276] hover:text-[#1C1B18] text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-[#615B51]">
              Applicant: <strong>{decisionModalReq.requester?.name}</strong> • Units:{' '}
              <strong>{decisionModalReq.requestedQuantity}</strong>
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              {decisionAction === 'approve' && (
                <>
                  <div>
                    <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
                      Agreed Pickup Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupScheduledAt}
                      onChange={(e) => setPickupScheduledAt(e.target.value)}
                      className="w-full bg-white border border-[#E8E3DA] px-3 py-2 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
                      Pickup Instructions & Gate/Room Pass
                    </label>
                    <input
                      type="text"
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      placeholder="e.g. Bring student ID, collect from Lab 3 Room 204..."
                      className="w-full bg-white border border-[#E8E3DA] px-3 py-2 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
                  Custodian Note (Sent to Applicant)
                </label>
                <textarea
                  rows="3"
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder={
                    decisionAction === 'approve'
                      ? 'e.g. Approved. Please handle equipment carefully.'
                      : 'Provide reason for declining (e.g. needed for department exam)...'
                  }
                  required={decisionAction === 'reject'}
                  className="w-full bg-white border border-[#E8E3DA] px-3 py-2 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
                ></textarea>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setDecisionModalReq(null)}
                  className="btn-woodwrights-outline px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="btn-woodwrights-primary px-6 py-2.5 disabled:opacity-50"
                >
                  {modalSubmitting
                    ? 'Processing...'
                    : decisionAction === 'approve'
                    ? 'Confirm Approval & Lock Units'
                    : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
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
