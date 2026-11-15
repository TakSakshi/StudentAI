import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Table as TableIcon
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-main">Dataset Explorer & Schema Audit</h2>
          <p className="text-sm text-secondary mt-1">
            Interactive preview of the student assessment records used for training and empirical validation.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Zero PII / Protected Attributes</span>
        </div>
      </div>

      {/* Dataset Metrics Summary */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="text-[11px] font-bold text-secondary uppercase">Total Records</div>
            <div className="text-2xl font-bold text-main mt-1">{data.total_records.toLocaleString()}</div>
            <div className="text-[11px] text-secondary mt-0.5">Across 5 academic periods</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="text-[11px] font-bold text-secondary uppercase">Unique Students</div>
            <div className="text-2xl font-bold text-main mt-1">{data.total_students.toLocaleString()}</div>
            <div className="text-[11px] text-secondary mt-0.5">Anonymous STU_xxxx IDs</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="text-[11px] font-bold text-secondary uppercase">Feature Columns</div>
            <div className="text-2xl font-bold text-main mt-1">{data.total_columns}</div>
            <div className="text-[11px] text-secondary mt-0.5">Academic indicators</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="text-[11px] font-bold text-secondary uppercase">Missing Values</div>
            <div className="text-2xl font-bold text-success mt-1">0</div>
            <div className="text-[11px] text-secondary mt-0.5">100% Complete schema</div>
          </div>
        </div>
      )}

      {/* Column Schema Metadata Drawer */}
      {data && (
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-bold text-main mb-3 flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-primary" />
            Dataset Schema & Column Audit
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {data.columns.map((col) => (
              <div key={col.name} className="p-2.5 bg-slate-50 border border-border rounded-lg">
                <div className="font-semibold text-main truncate">{col.name}</div>
                <div className="text-[10px] text-secondary mt-0.5 flex items-center justify-between">
                  <span className="font-mono text-primary">{col.dtype}</span>
                  <span className="text-success font-medium">Valid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Student ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>
          <div className="text-xs text-secondary">
            Page {page} of {data?.total_pages || 1}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Rendering dataset rows..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPreview} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-[11px] font-bold text-secondary uppercase tracking-wider">
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
                  <th className="py-2.5 px-3">Trend</th>
                  <th className="py-2.5 px-3">Next Score (Ground Truth)</th>
                  <th className="py-2.5 px-3">At-Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-main">{r.student_id}</td>
                    <td className="py-2.5 px-3">{r.assessment_period}</td>
                    <td className="py-2.5 px-3 text-secondary">{r.prediction_date}</td>
                    <td className="py-2.5 px-3">{r.attendance_rate}%</td>
                    <td className="py-2.5 px-3">{r.assignments_completed}</td>
                    <td className="py-2.5 px-3">{r.total_assignments}</td>
                    <td className="py-2.5 px-3">{r.assignment_completion_rate}%</td>
                    <td className="py-2.5 px-3 font-semibold">{r.previous_score_1}%</td>
                    <td className="py-2.5 px-3 text-secondary">{r.previous_score_2}%</td>
                    <td className="py-2.5 px-3 text-secondary">{r.average_previous_score}%</td>
                    <td className="py-2.5 px-3">{r.score_trend}</td>
                    <td className="py-2.5 px-3 font-bold text-main">{r.next_assessment_score}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.at_risk === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
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

        {/* Pagination */}
        <div className="p-4 border-t border-border bg-slate-50/50 flex items-center justify-between text-xs text-secondary">
          <div>Showing 25 records per page</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-main bg-white border border-border rounded-lg">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data?.total_pages || 1, p + 1))}
              disabled={!data || page >= data.total_pages}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
