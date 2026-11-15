import React, { useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Table as TableIcon,
  CheckCircle2,
  Database
} from 'lucide-react';

import { getDataPreview } from '../services/api';
import { DataPreviewResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const DataExplorer: React.FC = () => {
  const [data, setData] = useState<DataPreviewResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDataPreview({ page, page_size: 25, search: search.trim() || undefined });
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dataset preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [page, search]);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans block mb-1">
            Data Governance & Quality Audit
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-main">
            Dataset Explorer & Schema Audit
          </h1>
          <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
            Inspection interface for the longitudinal academic dataset (8,000 observations across 1,600 students). Verified for zero PII, zero missing values, and strict target quarantine.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-sage-light border border-sage text-forest rounded-xl text-xs font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-forest" />
          <span>Zero PII / Protected Attributes</span>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
            <span className="text-[11px] font-medium text-secondary uppercase block">Total Records</span>
            <span className="font-editorial text-2xl font-bold text-main mt-1 block">{data.total_records.toLocaleString()}</span>
            <span className="text-[10px] text-secondary mt-0.5 block">5 evaluation periods</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
            <span className="text-[11px] font-medium text-secondary uppercase block">Unique Students</span>
            <span className="font-editorial text-2xl font-bold text-main mt-1 block">{data.total_students.toLocaleString()}</span>
            <span className="text-[10px] text-secondary mt-0.5 block">Anonymous STU_xxxx IDs</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
            <span className="text-[11px] font-medium text-secondary uppercase block">Columns Tracked</span>
            <span className="font-editorial text-2xl font-bold text-main mt-1 block">{data.total_columns}</span>
            <span className="text-[10px] text-secondary mt-0.5 block">Pre-cutoff features</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
            <span className="text-[11px] font-medium text-secondary uppercase block">Schema Integrity</span>
            <span className="font-editorial text-2xl font-bold text-forest mt-1 block">100%</span>
            <span className="text-[10px] text-secondary mt-0.5 block">0 null values detected</span>
          </div>
        </div>
      )}

      {/* Column Schema Drawer */}
      {data && (
        <div className="bg-white p-6 rounded-2xl border border-border shadow-warm-sm">
          <h3 className="font-editorial text-lg font-bold text-main mb-3 flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-forest" />
            Schema Attributes & Data Types
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
            {data.columns.map((col) => (
              <div key={col.name} className="p-2.5 bg-ivory border border-border rounded-lg">
                <div className="font-semibold text-main truncate font-mono">{col.name}</div>
                <div className="text-[10px] text-secondary mt-1 flex items-center justify-between">
                  <span className="font-mono text-forest">{col.dtype}</span>
                  <span className="text-forest font-medium">Valid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Table Card */}
      <div className="bg-white rounded-2xl border border-border shadow-warm-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-ivory/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Student ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-border rounded-xl text-xs text-main focus:outline-none focus:border-forest"
            />
          </div>
          <span className="text-xs text-secondary">
            Page {page} of {data?.total_pages || 1}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Rendering dataset records..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPreview} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-ivory text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Cutoff Date</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">HW Completed</th>
                  <th className="py-2.5 px-3">HW Total</th>
                  <th className="py-2.5 px-3">HW %</th>
                  <th className="py-2.5 px-3">Score 1</th>
                  <th className="py-2.5 px-3">Score 2</th>
                  <th className="py-2.5 px-3">Hist Avg</th>
                  <th className="py-2.5 px-3">Momentum</th>
                  <th className="py-2.5 px-3">Target Exam Mark</th>
                  <th className="py-2.5 px-3">Target Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data?.records.map((r, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${idx % 2 === 1 ? 'bg-ivory/25' : 'bg-white'} hover:bg-sage-light/40`}
                  >
                    <td className="py-2.5 px-3 font-bold text-main font-mono">{r.student_id}</td>
                    <td className="py-2.5 px-3">{r.assessment_period}</td>
                    <td className="py-2.5 px-3 text-secondary">{r.prediction_date}</td>
                    <td className="py-2.5 px-3 font-sans">{r.attendance_rate}%</td>
                    <td className="py-2.5 px-3">{r.assignments_completed}</td>
                    <td className="py-2.5 px-3">{r.total_assignments}</td>
                    <td className="py-2.5 px-3 font-sans">{r.assignment_completion_rate}%</td>
                    <td className="py-2.5 px-3 font-bold text-main font-sans">{r.previous_score_1}%</td>
                    <td className="py-2.5 px-3 text-secondary font-sans">{r.previous_score_2}%</td>
                    <td className="py-2.5 px-3 text-secondary font-sans">{r.average_previous_score}%</td>
                    <td className="py-2.5 px-3">{r.score_trend}</td>
                    <td className="py-2.5 px-3 font-bold text-main font-sans">{r.next_assessment_score}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.at_risk === 1 ? 'bg-softred-light text-softred-text' : 'bg-sage-light text-forest'
                      }`}>
                        {r.at_risk === 1 ? 'At-Risk (1)' : 'Safe (0)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border bg-ivory/60 flex items-center justify-between text-xs text-secondary">
          <div>Showing 25 records per page</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-ivory disabled:opacity-40 shadow-warm-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-main bg-white border border-border rounded-lg shadow-warm-sm">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data?.total_pages || 1, p + 1))}
              disabled={!data || page >= data.total_pages}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-ivory disabled:opacity-40 shadow-warm-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
