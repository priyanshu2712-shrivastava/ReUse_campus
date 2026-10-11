'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { validateCsvPayload, generateSampleCsv } from '@/lib/csvHelper';
import StatusBadge from '@/components/StatusBadge';

export default function BulkImportPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'

  // Trigger download of standardized sample template
  const handleDownloadTemplate = () => {
    const csv = generateSampleCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campus_surplus_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle file drop or selection
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid .csv file.');
      return;
    }

    setFileName(file.name);
    setError('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvContent(text);
        const validated = validateCsvPayload(text);
        setParsedData(validated);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  // Handle manual paste text change
  const handlePasteChange = (text) => {
    setCsvContent(text);
    setError('');
    setImportResult(null);
    if (!text.trim()) {
      setParsedData(null);
      return;
    }
    const validated = validateCsvPayload(text);
    setParsedData(validated);
  };

  // Execute bulk import
  const handleCommitImport = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!parsedData || parsedData.validRows.length === 0) {
      setError('No valid rows available to import.');
      return;
    }

    setImporting(true);
    setError('');
    setImportResult(null);

    try {
      const res = await fetch('/api/resources/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsedData.validRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Bulk import failed');
      }

      setImportResult(data);
      setParsedData(null);
      setCsvContent('');
      setFileName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-3 text-[11px] tracking-[0.18em] uppercase text-[#8A8276]">
        <Link href="/" className="hover:text-[#1C1B18] transition-colors">
          Catalogue
        </Link>
        <span>/</span>
        <Link href="/dashboard/resources/my-listings" className="hover:text-[#1C1B18] transition-colors">
          Inventory
        </Link>
        <span>/</span>
        <span className="text-[#1C1B18]">Bulk Spreadsheet Importer</span>
      </div>

      {/* Editorial Header */}
      <div className="border-b border-[#E8E3DA] pb-8 space-y-3">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#8F5338] font-semibold">
          Departmental Logistics Automation
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#1C1B18] font-normal">
          Bulk Inventory Importer
        </h1>
        <p className="text-[14px] text-[#615C53] max-w-2xl font-light leading-relaxed">
          Upload spreadsheets of surplus laboratory glassware, computer peripherals, study tables, or textbooks.
          List dozens of items in a single click without repetitive manual data entry.
        </p>
      </div>

      {/* Success Notification */}
      {importResult && (
        <div className="bg-[#FAF8F5] border border-[#2F442F] p-8 space-y-4">
          <div className="flex items-center space-x-3 text-[#2F442F]">
            <span className="text-xl">✓</span>
            <h3 className="font-editorial text-2xl text-[#1C1B18]">
              Batch Registration Successful
            </h3>
          </div>
          <p className="text-[13px] text-[#4A453D] leading-relaxed">
            {importResult.message}
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/dashboard/resources/my-listings"
              className="btn-woodwrights-primary px-6 py-2.5 text-[11px]"
            >
              View In My Inventory →
            </Link>
            <Link
              href="/"
              className="btn-woodwrights-outline px-6 py-2.5 text-[11px]"
            >
              Explore Public Catalogue
            </Link>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-[#FCE8E8] text-[#802B2B] text-[13px] border border-[#E8B8B8]">
          {error}
        </div>
      )}

      {/* Step 1: Download Standard Template */}
      <div className="bg-white border border-[#E8E3DA] p-6 lg:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold block">
              Step 1: Preparation
            </span>
            <h2 className="font-editorial text-2xl text-[#1C1B18]">
              Standard Campus Inventory Template
            </h2>
            <p className="text-[13px] text-[#6E675D]">
              Format your spreadsheet with standard columns: Title, Category, SubCategory, Quantity, Condition, Location, PickupInstructions, Description.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="btn-woodwrights-outline px-6 py-3 text-[11px] whitespace-nowrap self-start md:self-center"
          >
            Download CSV Template ↓
          </button>
        </div>

        <div className="pt-4 border-t border-[#F0ECE4] text-[11px] text-[#8A8276] grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>• Title (Required)</div>
          <div>• Category (Standard Sector)</div>
          <div>• Quantity (Positive Integer)</div>
          <div>• Location (Building / Room)</div>
          <div>• Condition (New / Good / Fair / Needs Repair)</div>
          <div>• SubCategory (Optional Preset)</div>
          <div>• PickupInstructions (Optional)</div>
          <div>• Description (Optional)</div>
        </div>
      </div>

      {/* Step 2: Upload or Paste Area */}
      <div className="bg-white border border-[#E8E3DA] p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-4">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold block">
              Step 2: Source Ingestion
            </span>
            <h2 className="font-editorial text-2xl text-[#1C1B18]">
              Select or Paste Spreadsheet Data
            </h2>
          </div>

          <div className="flex space-x-2 text-[11px] tracking-wider uppercase">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 border transition-colors ${
                inputMode === 'upload'
                  ? 'border-[#1C1B18] bg-[#1C1B18] text-white'
                  : 'border-[#E8E3DA] text-[#6E675D] hover:bg-[#FAF8F5]'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1.5 border transition-colors ${
                inputMode === 'paste'
                  ? 'border-[#1C1B18] bg-[#1C1B18] text-white'
                  : 'border-[#E8E3DA] text-[#6E675D] hover:bg-[#FAF8F5]'
              }`}
            >
              Paste CSV Raw Text
            </button>
          </div>
        </div>

        {inputMode === 'upload' ? (
          <div className="border-2 border-dashed border-[#DCD6CB] bg-[#FAF8F5] p-10 text-center space-y-4 hover:border-[#1C1B18] transition-colors">
            <input
              type="file"
              id="csvFileInput"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="csvFileInput"
              className="cursor-pointer block space-y-3"
            >
              <div className="text-3xl text-[#8A8276]">📄</div>
              <div className="font-editorial text-xl text-[#1C1B18]">
                {fileName ? `Selected: ${fileName}` : 'Choose a .csv file from your computer'}
              </div>
              <p className="text-[12px] text-[#7A746B]">
                Click to browse or drag and drop your campus surplus CSV spreadsheet here.
              </p>
              <span className="inline-block btn-woodwrights-outline px-5 py-2 text-[10px]">
                Browse Files
              </span>
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-[11px] tracking-[0.14em] uppercase text-[#6E675D]">
              Paste CSV text including header line
            </label>
            <textarea
              rows="6"
              value={csvContent}
              onChange={(e) => handlePasteChange(e.target.value)}
              placeholder={`Title,Category,SubCategory,Quantity,Condition,Location,PickupInstructions,Description\n"Dell UltraSharp 24 Monitor","electronics","Monitors",4,"good","CSE Lab 2","2 PM - 5 PM","Working monitors"`}
              className="w-full bg-[#FAF8F5] border border-[#E8E3DA] p-4 text-[12px] font-mono text-[#1C1B18] focus:outline-none focus:border-[#1C1B18]"
            ></textarea>
          </div>
        )}
      </div>

      {/* Step 3: Live Verification Preview & Action */}
      {parsedData && (
        <div className="bg-white border border-[#E8E3DA] p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE4] pb-4">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8276] font-semibold block">
                Step 3: Verification & Ingestion
              </span>
              <h2 className="font-editorial text-2xl text-[#1C1B18]">
                Parsed Pre-Import Preview
              </h2>
            </div>

            <div className="flex items-center space-x-3 text-[12px]">
              <span className="px-3 py-1 bg-[#EAF5EA] text-[#2F442F] border border-[#CFE6CF] font-medium">
                {parsedData.validRows.length} Valid Items
              </span>
              {parsedData.errors.length > 0 && (
                <span className="px-3 py-1 bg-[#FCE8E8] text-[#802B2B] border border-[#E8B8B8] font-medium">
                  {parsedData.errors.length} Flagged Warnings
                </span>
              )}
            </div>
          </div>

          {/* Validation Errors List if any */}
          {parsedData.errors.length > 0 && (
            <div className="p-4 bg-[#FAF6EE] border border-[#E8D9C5] space-y-1 text-[12px] text-[#7A502E]">
              <div className="font-semibold uppercase tracking-wider text-[10px]">
                Notice: The following lines will be skipped due to validation rules:
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {parsedData.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Items Table */}
          {parsedData.validRows.length > 0 ? (
            <div className="overflow-x-auto border border-[#E8E3DA]">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#E8E3DA] bg-[#FAF8F5] text-[10px] tracking-[0.16em] uppercase text-[#8A8276]">
                    <th className="p-3">#</th>
                    <th className="p-3">Item Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Units</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3DA]">
                  {parsedData.validRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5]">
                      <td className="p-3 text-[#8A8276]">{idx + 1}</td>
                      <td className="p-3 font-medium text-[#1C1B18]">{row.title}</td>
                      <td className="p-3 text-[#544F46] capitalize">
                        {row.category.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-center font-medium text-[#1C1B18]">
                        {row.quantity}
                      </td>
                      <td className="p-3 capitalize text-[#544F46]">
                        {row.condition.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-[#6E675D]">📍 {row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-[#8A8276] text-[13px]">
              No valid entries found to import. Please check your column headers and values.
            </div>
          )}

          {/* Action Trigger */}
          {parsedData.validRows.length > 0 && (
            <div className="pt-4 border-t border-[#F0ECE4] flex items-center justify-between">
              <span className="text-[12px] text-[#7A746B]">
                Custodianship will be assigned to: <strong>{user?.name || 'Current User'}</strong>
              </span>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={importing}
                className="btn-woodwrights-primary px-8 py-3 text-[11px] disabled:opacity-50"
              >
                {importing
                  ? 'Importing Inventory...'
                  : `Publish ${parsedData.validRows.length} Items to Catalogue`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
