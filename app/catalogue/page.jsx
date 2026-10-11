'use client';

import React from 'react'
import ResourceCard from '@/components/ResourceCard';
import { CAMPUS_CATEGORIES, CONDITIONS } from '@/lib/categories';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
function Page() {
    const { user } = useAuth();
    const [search, setSearch] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [selectedRole, setSelectedRole] = React.useState('all');
    const [selectedCondition, setSelectedCondition] = React.useState('all');
    const [loading, setLoading] = React.useState(false);
    const [resources, setResources] = React.useState([]);
    const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCondition !== 'all') params.append('condition', selectedCondition);
      if (selectedRole !== 'all') params.append('ownerRole', selectedRole);

      const res = await fetch(`/api/resources?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedCondition, selectedRole]);
  return (
    <div id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-10">
      {/* Catalogue Page Header */}
      <div className="border-b border-[#E8E3DA] pb-8 space-y-2">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8276] font-semibold">
          Asset Discovery
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal tracking-tight">
          Campus Resource Catalogue
        </h1>
        <p className="text-[13px] text-[#615C53] max-w-2xl font-light">
          Discover available textbooks, laboratory apparatus, electronics, and furnishings ready for seamless transfer across departments and students.
        </p>
      </div>

      {/* Search & Top Filters */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Field */}
            <div className="relative flex-grow max-w-xl">
              <input
                type="text"
                placeholder="Search by textbook title, microcontroller, chair, lab apparatus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white hairline-border px-5 py-3.5 text-[14px] text-[#1C1B18] placeholder-[#9E988E] focus:outline-none focus:border-[#1C1B18] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tracking-wider uppercase text-[#8A8276] hover:text-[#1C1B18]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-white hairline-border px-4 py-3 text-[12px] tracking-[0.08em] uppercase font-medium text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              >
                <option value="all">All Donors</option>
                <option value="user">User Listings</option>
                <option value="admin">Admin Listings</option>
              </select>

              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="bg-white hairline-border px-4 py-3 text-[12px] tracking-[0.08em] uppercase font-medium text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
              >
                <option value="all">Any Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6 Category Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none hairline-bottom">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-[11px] tracking-[0.14em] uppercase font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#1C1B18] text-[#FAF8F5]'
                  : 'bg-white text-[#5E5950] hairline-border hover:bg-[#F2EDE4]'
              }`}
            >
              All Resources
            </button>
            {CAMPUS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-[11px] tracking-[0.14em] uppercase font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#1C1B18] text-[#FAF8F5]'
                    : 'bg-white text-[#5E5950] hairline-border hover:bg-[#F2EDE4]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items Header */}
        <div className="flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-[#8A8276]">
          <span>
            {loading ? 'Consulting campus registry...' : `${resources.length} Available Listings`}
          </span>
          <span>Verified Transfer Chain</span>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="font-editorial text-2xl text-[#8A8276] italic">
              Retrieving catalogue...
            </div>
            <div className="text-[11px] tracking-[0.15em] uppercase text-[#A39C90]">
              Connecting to campus database
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-24 text-center bg-white hairline-border space-y-4 px-6">
            <h3 className="font-editorial text-3xl text-[#1C1B18]">No resources currently found</h3>
            <p className="text-[13px] text-[#7A746B] max-w-md mx-auto">
              No active listings match your selected parameters. Be the first to list surplus items in this category.
            </p>
            <div className="pt-2">
              <Link href="/resources/new" className="btn-woodwrights-primary px-6 py-2.5 inline-block">
                List an Item Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((item) => (
              <Link href={`dashboard/resources/${item._id}`}>
              <ResourceCard key={item._id} resource={item} />
              </Link>
            ))}
          </div>
        )}
      </div>
  )
}

export default Page