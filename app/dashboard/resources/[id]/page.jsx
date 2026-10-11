'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCategoryById } from '@/lib/categories';
import StatusBadge from '@/components/StatusBadge';

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request modal form state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => {
    async function fetchResource() {
      try {
        const res = await fetch(`/api/resources/${id}`);
        if (!res.ok) throw new Error('Resource not found');
        const data = await res.json();
        setResource(data.resource);
      } catch (err) {
        setError(err.message || 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    }
    fetchResource();
  }, [id]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/dashboard/resources/${id}`);
      return;
    }

    setSubmitting(true);
    setRequestError('');
    setRequestSuccess('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource._id,
          requestedQuantity: parseInt(requestedQuantity, 10),
          purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setRequestSuccess(data.message || 'Request submitted successfully!');
      setTimeout(() => {
        router.push('/requests/my-requests');
      }, 1500);
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <div className="font-editorial text-2xl text-[#8A8276] italic">Loading specifications...</div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <h2 className="font-editorial text-3xl text-[#1C1B18]">Resource Not Found</h2>
        <p className="text-[13px] text-[#7A746B]">{error || 'This listing may have been archived.'}</p>
        <Link href="/" className="btn-woodwrights-outline px-6 py-2.5 inline-block">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const cat = getCategoryById(resource.category);
  const isOwner = user && user.id === resource.owner?._id;
  const canRequest = !isOwner && resource.availableQuantity > 0 && resource.status === 'available';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-3 text-[11px] tracking-[0.18em] uppercase text-[#8A8276]">
        <Link href="/" className="hover:text-[#1C1B18] transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <span className="text-[#1C1B18]">{cat.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Resource Imagery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[4/3] w-full bg-[#F2EDE4] hairline-border overflow-hidden">
            <img
              src={
                resource.imageUrl ||
                'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=1200&q=80'
              }
              alt={resource.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Verification Banner */}
          <div className="p-6 bg-white hairline-border space-y-2">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#736C61] font-semibold">
              Circularity Protocol
            </div>
            <p className="text-[12px] text-[#5C564E] leading-relaxed">
              This item is registered on the campus reuse ledger. Transfers must be physically verified by both
              the giver and receiver to record avoided waste.
            </p>
          </div>
        </div>

        {/* Right Column: Specifications & Request Action */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold">
                {cat.name}
              </span>
              <StatusBadge status={resource.status} />
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl text-[#1C1B18] font-normal leading-tight">
              {resource.title}
            </h1>

            {/* Inventory Status Bar */}
            <div className="p-4 bg-white hairline-border flex items-center justify-between text-[12px]">
              <div>
                <span className="text-[#8A8276] text-[10px] tracking-[0.16em] uppercase block">
                  Available Quantity
                </span>
                <span className="font-editorial text-2xl text-[#1C1B18] font-medium">
                  {resource.availableQuantity}{' '}
                  <span className="text-[12px] font-sans text-[#7A746B]">
                    of {resource.quantity} units
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#8A8276] text-[10px] tracking-[0.16em] uppercase block">
                  Condition Tier
                </span>
                <span className="font-medium text-[#1C1B18] capitalize">
                  {resource.condition.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Full Specifications & Description */}
            <div className="space-y-3">
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold">
                Specification Details
              </h3>
              <p className="text-[14px] text-[#423E37] leading-relaxed whitespace-pre-line font-light">
                {resource.description}
              </p>
            </div>

            {/* Pickup & Location Data */}
            <div className="space-y-3 pt-4 hairline-top">
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold">
                Designated Pickup Location
              </h3>
              <div className="text-[13px] text-[#2C2925] font-medium">
                📍 {resource.location}
              </div>
              <p className="text-[12px] text-[#7A746B] italic">
                {resource.pickupInstructions}
              </p>
            </div>

            {/* Donor & Custodian Information */}
            <div className="space-y-3 pt-4 hairline-top">
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold">
                Current Custodian
              </h3>
              <div className="text-[13px] text-[#1C1B18]">
                <div className="font-medium">{resource.owner?.name}</div>
                <div className="text-[11px] text-[#7A746B]">
                  {resource.owner?.departmentName
                    ? `${resource.owner?.departmentName} (Institutional Surplus)`
                    : 'Campus Member Listing'}
                </div>
              </div>
            </div>
          </div>

          {/* Request Action Button */}
          <div className="pt-8 hairline-top space-y-4">
            {isOwner ? (
              <div className="p-4 bg-[#F2EDE4] hairline-border space-y-2">
                <div className="text-[11px] tracking-[0.16em] uppercase font-semibold text-[#1C1B18]">
                  You are the Custodian of this Listing
                </div>
                <p className="text-[12px] text-[#696256]">
                  Review applicant requests and coordinate handovers in your Incoming Review portal.
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <Link
                    href={`/resources/${resource._id}/edit`}
                    className="btn-woodwrights-primary flex-1 py-2.5 text-center block text-[11px]"
                  >
                    Edit Listing Details
                  </Link>
                  <Link
                    href="/requests/incoming"
                    className="btn-woodwrights-outline flex-1 py-2.5 text-center block text-[11px]"
                  >
                    Incoming Review →
                  </Link>
                </div>
              </div>
            ) : canRequest ? (
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn-woodwrights-primary w-full py-4 text-center block text-[12px]"
              >
                Submit Transfer Request
              </button>
            ) : (
              <div className="p-4 bg-[#F2EDE4] text-center text-[12px] text-[#7A746B] hairline-border uppercase tracking-[0.14em]">
                {resource.availableQuantity === 0
                  ? 'All units currently reserved or transferred'
                  : 'Listing Currently Unavailable'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Structured Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1B18]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-lg w-full hairline-border shadow-wood-modal p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold">
                  Formal Campus Allocation
                </span>
                <h3 className="font-editorial text-2xl text-[#1C1B18] mt-1">
                  Request Item Transfer
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-[#8A8276] hover:text-[#1C1B18] text-xl"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-[#615B51]">
              Item: <strong className="text-[#1C1B18]">{resource.title}</strong>
            </p>

            {requestError && (
              <div className="p-3 bg-[#FCE8E8] text-[#802B2B] text-[12px] border border-[#E8B8B8]">
                {requestError}
              </div>
            )}

            {requestSuccess && (
              <div className="p-3 bg-[#EAF5EA] text-[#2C542C] text-[12px] border border-[#B8D8B8]">
                {requestSuccess}
              </div>
            )}

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              {/* Requested Quantity */}
              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
                  Units Required (Max {resource.availableQuantity})
                </label>
                <input
                  type="number"
                  min="1"
                  max={resource.availableQuantity}
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(e.target.value)}
                  required
                  className="w-full bg-white hairline-border px-3 py-2 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
                />
              </div>

              {/* Intended Purpose */}
              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-[#544F46] font-medium mb-1">
                  Intended Reuse Purpose & Context
                </label>
                <textarea
                  rows="4"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Explain why this item is needed (e.g. final-year capstone project, lab experiment, club event, student study)..."
                  required
                  className="w-full bg-white hairline-border px-3 py-2 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
                ></textarea>
                <p className="text-[11px] text-[#8A8276] mt-1">
                  This explanation is reviewed by the resource custodian before approval.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-woodwrights-outline px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-woodwrights-primary px-6 py-2.5 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
