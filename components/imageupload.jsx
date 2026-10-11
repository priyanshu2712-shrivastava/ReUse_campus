'use client';

import React, { useState, useRef } from 'react';

export default function ImageUpload({ value, onChange, label = 'Resource Photography' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6B655C]">
          {label}
        </label>
        <div className="flex items-center space-x-2 text-[10px] tracking-wider uppercase">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'upload'
                ? 'bg-[#1C1B18] text-[#FAF8F5]'
                : 'text-[#8A8276] hover:text-[#1C1B18]'
            }`}
          >
            Upload Photo
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded transition-colors ${
              mode === 'url'
                ? 'bg-[#1C1B18] text-[#FAF8F5]'
                : 'text-[#8A8276] hover:text-[#1C1B18]'
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... (Image link)"
            className="w-full bg-white border border-[#E8E3DA] px-4 py-3 text-[14px] text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
          />
        </div>
      ) : (
        <div>
          {value ? (
            /* Uploaded Preview State */
            <div className="relative border border-[#E8E3DA] bg-[#FAF8F5] p-3 flex items-center space-x-4">
              <div className="w-20 h-20 bg-white border border-[#E8E3DA] overflow-hidden flex-shrink-0">
                <img
                  src={value}
                  alt="Resource preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-grow space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF5EA] text-[#2C542C] border border-[#B8D8B8]">
                    ✓ Uploaded to Storage
                  </span>
                  {value.includes('amazonaws.com') && (
                    <span className="text-[10px] text-[#7A502E] font-medium">
                      ☁️ AWS S3
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8A8276] truncate font-mono">
                  {value}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onChange('')}
                className="btn-woodwrights-outline px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#803333] border-[#CCAAAA] hover:border-[#803333]"
              >
                Change Photo
              </button>
            </div>
          ) : (
            /* Upload Drop Area */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-[#1C1B18] bg-[#F2EDE4]'
                  : 'border-[#DED7CB] bg-white hover:border-[#1C1B18] hover:bg-[#FAF8F5]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />

              {uploading ? (
                <div className="py-3 space-y-2">
                  <div className="inline-block animate-spin text-xl">⏳</div>
                  <div className="text-[12px] text-[#7A502E] font-medium">
                    Uploading directly to Cloud Storage (AWS S3)...
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-2xl">📸</div>
                  <div className="text-[13px] font-medium text-[#1C1B18]">
                    Click to browse or drag & drop item photo
                  </div>
                  <div className="text-[11px] text-[#8A8276]">
                    PNG, JPG, or WebP up to 5MB • Powered by AWS S3
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-[11px] text-[#803333] pt-1">
              ⚠️ {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}   