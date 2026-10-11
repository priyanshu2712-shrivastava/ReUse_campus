'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CAMPUS_CATEGORIES, CONDITIONS } from '@/lib/categories';

export default function EditResourcePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [category, setCategory] = useState(CAMPUS_CATEGORIES[0].id);
  const [subCategory, setSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('good');
  const [location, setLocation] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState('available');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleUnarchiveNow = async () => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unarchive' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unarchive listing');
      setStatus('available');
      alert(data.message || 'Listing unarchived and restored to catalogue!');
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    setDeleting(true);
    setSubmitError('');

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete listing');
      }

      alert(data.message || 'Listing removed successfully');
      router.push('/dashboard/resources/my-listings');
    } catch (err) {
      setSubmitError(err.message);
      setDeleting(false);
    }
  };

  const activeCategoryConfig = CAMPUS_CATEGORIES.find((c) => c.id === category) || CAMPUS_CATEGORIES[0];

  useEffect(() => {
    async function loadResource() {
      try {
        setLoading(true);
        const res = await fetch(`/api/resources/${id}`);
        if (!res.ok) {
          throw new Error('Resource not found or failed to load');
        }
        const data = await res.json();
        const r = data.resource;

        if (!r) throw new Error('Resource data missing');

        // Check ownership
        if (user && r.owner) {
          const ownerId = typeof r.owner === 'object' ? r.owner._id : r.owner;
          if (ownerId.toString() !== user.id && user.role !== 'admin') {
            setLoadError('You are not authorized to edit this listing.');
            setLoading(false);
            return;
          }
        }

        setTitle(r.title || '');
        setDescription(r.description || '');
        setCategory(r.category || CAMPUS_CATEGORIES[0].id);
        setSubCategory(r.subCategory || '');
        setQuantity(r.quantity || 1);
        setCondition(r.condition || 'good');
        setLocation(r.location || '');
        setPickupInstructions(r.pickupInstructions || '');
        setImageUrl(r.imageUrl || '');
        setStatus(r.status || 'available');
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadResource();
    }
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          subCategory: subCategory ? subCategory.trim() : '',
          quantity: parseInt(quantity, 10),
          condition,
          location: location.trim(),
          pickupInstructions: pickupInstructions ? pickupInstructions.trim() : '',
          imageUrl: imageUrl ? imageUrl.trim() : '',
          status: 'available',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update resource listing');
      }

      setSubmitSuccess('Resource listing updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard/resources/my-listings');
      }, 1200);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="font-editorial text-2xl text-[#8A8276] italic">
          Loading resource specifications...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 bg-[#FCE8E8] text-[#802B2B] text-[13px] border border-[#E8B8B8]">
          {loadError}
        </div>
        <button
          onClick={() => router.push('/dashboard/resources/my-listings')}
          className="btn-woodwrights-primary px-6 py-2.5 text-[11px]"
        >
          Return to My Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-[#E8E3DA] pb-8 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
            Custodian Inventory Modification
          </span>
          <span className="text-[11px] text-[#8A8276]">
            Item ID: <code className="font-mono text-[10px]">{id}</code>
          </span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal">
          Edit Listing Specifications
        </h1>
        <p className="text-[14px] text-[#615C53] max-w-2xl font-light">
          Update item descriptions, available units, pickup locations, or working conditions.
        </p>
      </div>

      {submitError && (
        <div className="p-4 bg-[#FCE8E8] text-[#802B2B] text-[13px] border border-[#E8B8B8]">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 bg-[#E8F5E9] text-[#2E7D32] text-[13px] border border-[#C8E6C9]">
          {submitSuccess}
        </div>
      )}

      {status === 'archived' && (
        <div className="p-4 bg-[#FAF4E6] border border-[#EDE0BE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-wood">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#7A642B] tracking-[0.16em] uppercase">
              Notice: This Listing is Currently Archived
            </div>
            <p className="text-[12px] text-[#6E675D]">
              This resource is hidden from the campus catalogue. Saving updates will automatically unarchive and restore it to available catalogue stock.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUnarchiveNow}
            className="border border-[#2F442F] text-[#2F442F] hover:bg-[#EBF2EB] px-4 py-2 text-[10px] tracking-[0.14em] uppercase font-semibold transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            Unarchive Now
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Step 1: Sector Selection */}
        <div className="space-y-3">
          <label className="block text-[11px] tracking-[0.18em] uppercase text-[#544F46] font-semibold">
            1. Resource Sector
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CAMPUS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 text-left border text-[12px] transition-all ${
                  category === cat.id
                    ? 'border-[#1C1B18] bg-white ring-1 ring-[#1C1B18] font-medium text-[#1C1B18]'
                    : 'border-[#E8E3DA] bg-white text-[#6B655C] hover:bg-[#FAF8F5]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Title and Subcategory */}
        <div className="space-y-4 pt-6 border-t border-[#E8E3DA]">
          <label className="block text-[11px] tracking-[0.18em] uppercase text-[#544F46] font-semibold">
            2. Primary Specifications
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Resource Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Subcategory / Item Specification
              </label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. 3rd Edition, Microcontroller, Lab Kit..."
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Condition Tier *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
              Description & Specifications *
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            ></textarea>
          </div>
        </div>

        {/* Step 3: Quantity and Location */}
        <div className="space-y-4 pt-6 border-t border-[#E8E3DA]">
          <label className="block text-[11px] tracking-[0.18em] uppercase text-[#544F46] font-semibold">
            3. Quantity & Pickup Coordination
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Total Quantity (Units) *
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Campus Pickup Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Pickup Instructions & Available Hours
              </label>
              <input
                type="text"
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                placeholder="e.g. Weekdays 2 PM - 5 PM. Contact before arriving."
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Item Image URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-8 border-t border-[#E8E3DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            disabled={deleting || submitting}
            onClick={handleDelete}
            className="px-5 py-3 text-[11px] tracking-[0.14em] uppercase font-semibold text-[#803333] border border-[#E8CACA] hover:bg-[#FCE8E8] transition-colors disabled:opacity-50 text-center"
          >
            {deleting ? 'Deleting...' : 'Delete Listing'}
          </button>

          <div className="flex items-center space-x-4 self-end sm:self-auto">
            <button
              type="button"
              disabled={deleting || submitting}
              onClick={() => router.back()}
              className="btn-woodwrights-outline px-6 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || deleting}
              className="btn-woodwrights-primary px-8 py-3 disabled:opacity-50"
            >
              {submitting ? 'Updating Resource...' : 'Save & Update Listing'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
