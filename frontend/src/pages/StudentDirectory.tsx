import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

import { getStudents } from '../services/api';
import { StudentRecord } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const StudentDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err?.message || 'Failed to retrieve student directory records.');
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
      {/* Editorial Header */}
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans block mb-1">
            Academic Registry
          </span>
          <h1 className="font-editorial text-3xl font-bold text-main">Student Directory</h1>
          <p className="text-sm text-secondary mt-1 max-w-xl">
            Comprehensive roster of active student profiles, historical assessment metrics, attendance records, and advisory classifications.
          </p>
        </div>
        <div className="text-xs text-secondary shrink-0">
          Showing <span className="font-semibold text-main">{students.length}</span> of{' '}
          <span className="font-semibold text-main">{totalCount}</span> enrolled students
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-warm-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student identifier (e.g. STU_0042)..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ivory border border-border rounded-xl text-xs text-main placeholder-secondary focus:outline-none focus:border-forest focus:bg-white transition-colors"
          />
        </div>

        {/* Risk Band Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-secondary font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {[
            { key: 'ALL', label: 'All Students' },
            { key: 'High', label: 'Priority Support' },
            { key: 'Medium', label: 'Check-in Advised' },
            { key: 'Low', label: 'Steady Progress' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => updateParam('risk_band', item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                riskBand.toUpperCase() === item.key.toUpperCase()
                  ? 'bg-forest text-white shadow-warm-sm'
                  : 'bg-ivory text-secondary hover:bg-sage-light hover:text-forest'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-white rounded-2xl border border-border shadow-warm-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Retrieving student records from registry..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchRecords} />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-secondary">
            <p className="text-sm font-medium">No students match the current filter criteria.</p>
            <button
              onClick={() => setSearchParams({})}
              className="mt-3 text-xs text-forest font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-ivory text-[11px] font-semibold text-secondary uppercase tracking-wider select-none">
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
                      Historical Mean <ArrowUpDown className="w-3 h-3 opacity-60" />
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
                      Assignments <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Performance Trend</th>
                  <th className="py-3 px-4">Advisory Category</th>
                  <th className="py-3 px-4 text-right">Academic Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {students.map((s, idx) => (
                  <tr
                    key={`${s.student_id}-${s.assessment_period}`}
                    className={`transition-colors ${idx % 2 === 1 ? 'bg-ivory/30' : 'bg-white'} hover:bg-sage-light/40`}
                  >
                    <td className="py-3.5 px-4 font-bold text-main font-mono">
                      <Link
                        to={`/students/${s.student_id}`}
                        className="text-forest hover:underline"
                      >
                        {s.student_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-main font-sans">
                      <span className={s.latest_score < 40 ? 'text-danger' : s.latest_score >= 70 ? 'text-forest' : 'text-main'}>
                        {s.latest_score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-secondary font-sans">{s.average_previous_score}%</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-border/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.attendance_rate < 70 ? 'bg-danger' : s.attendance_rate >= 85 ? 'bg-success' : 'bg-warning'
                            }`}
                            style={{ width: `${Math.min(100, s.attendance_rate)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium font-sans">{s.attendance_rate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span>{s.assignment_completion_rate}%</span>
                      <span className="text-[10px] text-secondary ml-1">({s.assignments_completed}/{s.total_assignments})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        s.score_trend === 'Declining'
                          ? 'bg-softred-light text-softred-text'
                          : s.score_trend === 'Improving'
                          ? 'bg-sage-light text-forest'
                          : 'bg-ivory text-secondary'
                      }`}>
                        {s.score_trend}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge band={s.advisory_risk_band} size="sm" supportive={true} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/students/${s.student_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-forest bg-sage-light hover:bg-sage rounded-lg transition-colors"
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
        <div className="p-4 border-t border-border bg-ivory/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary">
          <div>
            Page <span className="font-semibold text-main">{page}</span> of{' '}
            <span className="font-semibold text-main">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateParam('page', (page - 1).toString())}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-ivory disabled:opacity-40 disabled:cursor-not-allowed shadow-warm-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold bg-white border border-border rounded-lg text-main shadow-warm-sm">
              {page}
            </span>
            <button
              onClick={() => updateParam('page', (page + 1).toString())}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border bg-white text-main hover:bg-ivory disabled:opacity-40 disabled:cursor-not-allowed shadow-warm-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

