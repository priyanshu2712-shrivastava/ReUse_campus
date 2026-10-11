'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CAMPUS_CATEGORIES, CONDITIONS } from '@/lib/categories';
import ImageUpload from '@/components/ImageUpload';

export default function NewResourcePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [category, setCategory] = useState(CAMPUS_CATEGORIES[0].id);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isCustomPreset, setIsCustomPreset] = useState(false);
  const [customPresetName, setCustomPresetName] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('good');
  const [location, setLocation] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const activeCategoryConfig = CAMPUS_CATEGORIES.find((c) => c.id === category) || CAMPUS_CATEGORIES[0];

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    if (preset === '__custom__') {
      setIsCustomPreset(true);
    } else {
      setIsCustomPreset(false);
      // Auto-populate title if empty or previously matching a preset
      if (!title || activeCategoryConfig.presets.includes(title)) {
        setTitle(preset);
      }
    }
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    setSelectedPreset('');
    setIsCustomPreset(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const finalSubCategory = isCustomPreset ? customPresetName : selectedPreset;

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          subCategory: finalSubCategory,
          quantity: parseInt(quantity, 10),
          condition,
          location,
          pickupInstructions,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to list resource');
      }

      router.push('/resources/my-listings');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-[#E8E3DA] pb-8 space-y-3">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
          Inventory Registration
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal">
          List a Campus Resource
        </h1>
        <p className="text-[14px] text-[#615C53] max-w-2xl font-light">
          Register unused textbooks, electronics, laboratory apparatus, or furniture. Every listing offers an
          opportunity to prevent avoidable campus procurement.
        </p>
        <div className="pt-2">
          <Link
            href="/resources/bulk-import"
            className="inline-flex items-center text-[12px] text-[#8F5338] hover:text-[#5E2B15] font-medium underline underline-offset-4"
          >
            📋 Have a department spreadsheet of 10+ surplus items? Use our Bulk CSV Importer →
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FCE8E8] text-[#802B2B] text-[13px] border border-[#E8B8B8]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Step 1: Category Selection */}
        <div className="space-y-4">
          <label className="block text-[11px] tracking-[0.18em] uppercase text-[#544F46] font-semibold">
            1. Select Primary Resource Sector
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {CAMPUS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-4 text-left border transition-all ${
                  category === cat.id
                    ? 'border-[#1C1B18] bg-white shadow-wood ring-1 ring-[#1C1B18]'
                    : 'border-[#E8E3DA] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="font-medium text-[13px] text-[#1C1B18]">{cat.name}</div>
                <div className="text-[11px] text-[#8A8276] mt-1 line-clamp-2">{cat.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Presets or Custom Specification */}
        <div className="space-y-4 pt-6 border-t border-[#E8E3DA]">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] tracking-[0.18em] uppercase text-[#544F46] font-semibold">
              2. Select Standard Item Preset (Or Custom If Not Listed)
            </label>
            <span className="text-[11px] text-[#8A8276]">Quick Categorization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeCategoryConfig.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 text-left border text-[13px] transition-colors ${
                  selectedPreset === preset && !isCustomPreset
                    ? 'border-[#1C1B18] bg-[#FAF8F5] font-medium text-[#1C1B18]'
                    : 'border-[#E8E3DA] bg-white text-[#544F46] hover:bg-[#FAF8F5]'
                }`}
              >
                • {preset}
              </button>
            ))}

            {/* Custom Preset Button */}
            <button
              type="button"
              onClick={() => handlePresetSelect('__custom__')}
              className={`p-3 text-left border text-[13px] transition-colors ${
                isCustomPreset
                  ? 'border-[#1C1B18] bg-[#FAF8F5] font-medium text-[#1C1B18]'
                  : 'border-[#E8E3DA] bg-white text-[#8F5338] hover:bg-[#FAF8F5]'
              }`}
            >
              + Not listed above (Custom Item Specification)
            </button>
          </div>

          {isCustomPreset && (
            <div className="pt-2">
              <input
                type="text"
                placeholder="Enter custom subcategory or item type..."
                value={customPresetName}
                onChange={(e) => setCustomPresetName(e.target.value)}
                className="w-full bg-white border border-[#E8E3DA] px-4 py-2.5 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>
          )}
        </div>

        {/* Step 3: Detailed Specifications */}
        <div className="space-y-6 pt-6 border-t border-[#E8E3DA]">
          <label className="block text-[11px] tracking-[0.18em] uppercase text-[#544F46] font-semibold">
            3. Detailed Resource Specifications
          </label>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Resource Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Algorithms (CLRS 3rd Ed) or Arduino Rev3 Kit"
                required
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                Description, Condition Details & Included Accessories *
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide accurate specifications: edition, working condition, ports, included cables, scratches, or required repairs..."
                required
                className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[13px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                  Quantity Available *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                  Pickup Location on Campus *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. CSE Systems Lab 2, Room 304 or Hostel Block 3"
                  required
                  className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
                />
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C] mb-1">
                  Pickup Hours & Instructions
                </label>
                <input
                  type="text"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  placeholder="e.g. Weekdays 2 PM - 5 PM. Bring student ID."
                  className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
                />
              </div>
            </div>

            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Item Photography (Direct Cloud & S3 Upload)"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-8 border-t border-[#E8E3DA] flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-woodwrights-outline px-6 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-woodwrights-primary px-8 py-3 disabled:opacity-50"
          >
            {submitting ? 'Registering Resource...' : 'Publish to Campus Catalogue'}
          </button>
        </div>
      </form>
    </div>
  );
}
