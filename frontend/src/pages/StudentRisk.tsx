import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  Download
} from 'lucide-react';

import { getStudents } from '../services/api';
import { StudentRecord } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const StudentRisk: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states from URL or defaults
  const search = searchParams.get('search') || '';
  const riskBand = searchParams.get('risk_band') || 'ALL';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort_by') || 'student_id';
  const ascending = searchParams.get('ascending') !== 'false';

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudents({
        search: search.trim() || undefined,
        risk_band: riskBand !== 'ALL' ? riskBand : undefined,
        sort_by: sortBy,
        ascending: ascending,
        page: page,
        page_size: 20
      });
      setStudents(res.students);
      setTotalCount(res.total_count);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search, riskBand, page, sortBy, ascending]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      updateParam('ascending', (!ascending).toString());
    } else {
      const next = new URLSearchParams(searchParams);
      next.set('sort_by', col);
      next.set('ascending', 'true');
      next.set('page', '1');
      setSearchParams(next);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-main">Student Risk Analysis</h2>
          <p className="text-sm text-secondary mt-1">
            Searchable cohort directory with automated advisory risk classifications and historical metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
          Showing {students.length} of {totalCount} matching students
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Student ID (e.g. STU_0042)..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border rounded-xl text-xs text-main placeholder-secondary focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        {/* Risk Band Quick Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-secondary font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Risk:
          </span>
          {['ALL', 'High', 'Medium', 'Low'].map((band) => (
            <button
              key={band}
              onClick={() => updateParam('risk_band', band)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                riskBand.toUpperCase() === band.toUpperCase()
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-50 text-secondary hover:bg-slate-100 hover:text-main'
              }`}
            >
              {band === 'ALL' ? 'All Bands' : `${band} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Filtering student records..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchRecords} />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-secondary">
            <p className="text-sm font-medium">No students match the current search or risk filters.</p>
            <button
              onClick={() => setSearchParams({})}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 text-[11px] font-bold text-secondary uppercase tracking-wider select-none">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-main"
                    onClick={() => handleSort('student_id')}
                  >
                    <div className="flex items-center gap-1.5">
                      Student ID <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-main"
                    onClick={() => handleSort('latest_score')}
                  >
                    <div className="flex items-center gap-1.5">
                      Latest Score <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-main"
                    onClick={() => handleSort('average_previous_score')}
                  >
                    <div className="flex items-center gap-1.5">
                      Historical Avg <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-main"
                    onClick={() => handleSort('attendance_rate')}
                  >
                    <div className="flex items-center gap-1.5">
                      Attendance <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-main"
                    onClick={() => handleSort('assignment_completion_rate')}
                  >
                    <div className="flex items-center gap-1.5">
                      Completion Rate <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Score Trend</th>
                  <th className="py-3 px-4">Advisory Risk</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {students.map((s) => (
                  <tr key={`${s.student_id}-${s.assessment_period}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-main">
                      <Link
                        to={`/students/${s.student_id}`}
                        className="text-primary hover:underline hover:text-primary-hover"
                      >
                        {s.student_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-main">
                      <span className={s.latest_score < 40 ? 'text-danger' : s.latest_score >= 70 ? 'text-success' : 'text-main'}>
                        {s.latest_score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-secondary">{s.average_previous_score}%</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.attendance_rate < 70 ? 'bg-danger' : s.attendance_rate >= 85 ? 'bg-success' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, s.attendance_rate)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium">{s.attendance_rate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-secondary">{s.assignment_completion_rate}%</span>
                      <span className="text-[10px] text-slate-400 block">({s.assignments_completed}/{s.total_assignments})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        s.score_trend === 'Declining'
                          ? 'bg-red-50 text-red-700'
                          : s.score_trend === 'Improving'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.score_trend}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge band={s.advisory_risk_band} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/students/${s.student_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary bg-primary-light hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Inspect <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary">
          <div>
            Page <span className="font-semibold text-main">{page}</span> of{' '}
            <span className="font-semibold text-main">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateParam('page', (page - 1).toString())}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium bg-white border border-border rounded-lg text-main">
              {page}
            </span>
            <button
              onClick={() => updateParam('page', (page + 1).toString())}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
