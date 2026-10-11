'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { getCategoryById } from '@/lib/categories';

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/resources/my-listings');
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete listing');
      }
      alert(data.message || 'Listing removed successfully');
      fetchListings();
    } catch (err) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  const handleUnarchive = async (id) => {
    if (!confirm('Do you want to unarchive this listing and restore it to available catalogue stock?')) return;
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unarchive' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unarchive listing');
      }
      alert(data.message || 'Listing restored to available catalogue stock');
      fetchListings();
    } catch (err) {
      alert(err.message || 'Failed to unarchive resource');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E3DA] pb-8">
        <div>
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
            Donor Custodianship
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal">
            My Resource Inventory
          </h1>
          <p className="text-[13px] text-[#615C53] mt-1">
            Track listed items, reserved quantities, and active transfer custody.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/resources/bulk-import"
            className="btn-woodwrights-outline px-5 py-3 text-center text-[11px]"
          >
            Bulk CSV Import ↓
          </Link>
          <Link href="/resources/new" className="btn-woodwrights-primary px-6 py-3 text-center text-[11px]">
            + Add New Listing
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-editorial text-2xl text-[#8A8276] italic">
          Loading your inventory ledger...
        </div>
      ) : listings.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E8E3DA] space-y-4 p-8">
          <h3 className="font-editorial text-2xl text-[#1C1B18]">No resources listed yet</h3>
          <p className="text-[13px] text-[#7A746B] max-w-md mx-auto">
            You haven't registered any items yet. Share textbooks, electronics, lab supplies, or furniture with the campus community.
          </p>
          <Link href="/resources/new" className="btn-woodwrights-primary px-6 py-2.5 inline-block">
            List Your First Item
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E3DA] divide-y divide-[#E8E3DA]">
          {listings.map((item) => {
            const cat = getCategoryById(item.category);
            return (
              <div
                key={item._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#FAF8F5] transition-colors"
              >
                <div className="flex items-start space-x-5">
                  <div className="w-20 h-20 bg-[#F2EDE4] border border-[#E8E3DA] overflow-hidden flex-shrink-0">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8276] font-semibold">
                        {cat.name}
                      </span>
                      <span>•</span>
                      <StatusBadge status={item.status} />
                    </div>

                    <Link
                      href={`/resources/${item._id}`}
                      className="font-editorial text-xl text-[#1C1B18] hover:underline"
                    >
                      {item.title}
                    </Link>

                    <div className="text-[12px] text-[#7A746B]">
                      Available: <strong>{item.availableQuantity}</strong> of {item.quantity} units • 📍 {item.location}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 self-end md:self-center">
                  <Link
                    href={`/resources/${item._id}/edit`}
                    className="btn-woodwrights-outline px-4 py-2 text-[10px]"
                  >
                    Edit
                  </Link>

                  <Link
                    href="/requests/incoming"
                    className="btn-woodwrights-outline px-4 py-2 text-[10px]"
                  >
                    View Applicants
                  </Link>

                  {item.status === 'archived' && (
                    <button
                      onClick={() => handleUnarchive(item._id)}
                      className="border border-[#2F442F] text-[#2F442F] hover:bg-[#EBF2EB] hover:border-[#1E301E] px-4 py-2 text-[10px] tracking-[0.14em] uppercase font-medium transition-colors"
                    >
                      Unarchive
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="border border-[#E8CACA] text-[#803333] hover:bg-[#FCE8E8] hover:border-[#803333] px-4 py-2 text-[10px] tracking-[0.14em] uppercase font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
