import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  TrendingUp,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

import {
  getPerformanceTrends,
  getAttendanceAnalytics,
  getAssignmentAnalytics,
  getRiskDistribution
} from '../services/api';
import {
  TrendPoint,
  AttendanceAnalytics,
  AssignmentAnalytics,
  RiskDistribution
} from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const PerformanceAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [attendance, setAttendance] = useState<AttendanceAnalytics | null>(null);
  const [assignments, setAssignments] = useState<AssignmentAnalytics | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistribution | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, attRes, compRes, riskRes] = await Promise.all([
        getPerformanceTrends(),
        getAttendanceAnalytics(),
        getAssignmentAnalytics(),
        getRiskDistribution()
      ]);
      setTrends(trendRes.trends);
      setAttendance(attRes);
      setAssignments(compRes);
      setRiskDist(riskRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve academic progress analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Aggregating multi-period academic indicators..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAnalytics} />;

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans block mb-1">
          Longitudinal Learning Analytics
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-main">
          Academic Progress & Performance Trends
        </h1>
        <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
          Evaluating the longitudinal relationship between lecture attendance, formative homework submission habits, and subsequent assessment performance.
        </p>
      </div>

      {/* Primary Longitudinal Trend Visualization */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-editorial text-xl font-bold text-main">
              Longitudinal Assessment Trajectory
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Tracking exam mark averages alongside engagement signals from diagnostic Period 1 through Period 5
            </p>
          </div>
          <span className="text-xs font-medium px-3 py-1 bg-sage-light text-forest rounded-full border border-sage self-start sm:self-auto">
            5 Academic Periods
          </span>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6DD" vertical={false} />
              <XAxis dataKey="period" tickFormatter={(p) => `Period ${p}`} tick={{ fontSize: 11, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
              <Tooltip
                formatter={(val: number) => [`${val}%`]}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E6DD',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Line
                type="monotone"
                dataKey="mean_latest_score"
                name="Mean Assessment Mark"
                stroke="#244C3C"
                strokeWidth={3}
                dot={{ r: 5, fill: '#244C3C' }}
              />
              <Line
                type="monotone"
                dataKey="mean_attendance"
                name="Class Attendance Rate"
                stroke="#3F7959"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="mean_completion"
                name="Formative HW Submissions"
                stroke="#B77B2D"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="at_risk_rate"
                name="At-Risk Rate (< 40%)"
                stroke="#B94A48"
                strokeWidth={2}
                dot={{ r: 3, fill: '#B94A48' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Deep Dives: Attendance vs Risk & HW vs Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Bracket Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="w-5 h-5 text-forest" />
              <h3 className="font-editorial text-lg font-bold text-main">
                Attendance Brackets vs. Academic Risk
              </h3>
            </div>
            <p className="text-xs text-secondary mb-4">
              Vulnerability rates across lecture attendance tiers (Cohort Mean: {attendance?.average_attendance}%)
            </p>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance?.distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E6DD" vertical={false} />
                <XAxis dataKey="range_label" tick={{ fontSize: 11, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#738078' }} domain={[0, 100]} axisLine={{ stroke: '#E5E6DD' }} />
                <Tooltip
                  formatter={(val: number) => [`${val}% at-risk`, 'Failure Risk Rate']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E6DD', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="at_risk_rate" radius={[6, 6, 0, 0]}>
                  {attendance?.distribution.map((entry, index) => (
                    <Cell
                      key={`att-cell-${index}`}
                      fill={entry.at_risk_rate > 50 ? '#B94A48' : entry.at_risk_rate > 20 ? '#B77B2D' : '#3F7959'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-ivory rounded-xl text-xs text-secondary border border-border">
            <span className="font-bold text-main">Pedagogical Threshold:</span> Students dropping below 70% attendance experience a sharp escalation in exam vulnerability, highlighting instructional presence as foundational.
          </div>
        </div>

        {/* Formative Homework Diligence */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-forest" />
              <h3 className="font-editorial text-lg font-bold text-main">
                Formative Homework Diligence vs. Exam Outcomes
              </h3>
            </div>
            <p className="text-xs text-secondary mb-4">
              Vulnerability rates across homework submission completion tiers
            </p>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assignments?.distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E6DD" vertical={false} />
                <XAxis dataKey="range_label" tick={{ fontSize: 11, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#738078' }} domain={[0, 100]} axisLine={{ stroke: '#E5E6DD' }} />
                <Tooltip
                  formatter={(val: number) => [`${val}% at-risk`, 'Failure Risk Rate']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E6DD', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="at_risk_rate" radius={[6, 6, 0, 0]}>
                  {assignments?.distribution.map((entry, index) => (
                    <Cell
                      key={`comp-cell-${index}`}
                      fill={entry.at_risk_rate > 50 ? '#B94A48' : entry.at_risk_rate > 20 ? '#B77B2D' : '#3F7959'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-ivory rounded-xl text-xs text-secondary border border-border">
            <span className="font-bold text-main">Protective Factor:</span> Consistently submitting &gt; 85% of formative practice tasks reduces next-exam failure probability to under 8%.
          </div>
        </div>
      </div>
    </div>
  );
};
