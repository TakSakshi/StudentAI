import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

import { getDashboardSummary, getPerformanceTrends, getStudents } from '../services/api';
import { DashboardSummary, TrendPoint, StudentRecord } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const Overview: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [recentStudents, setRecentStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, trendRes, stuRes] = await Promise.all([
        getDashboardSummary(),
        getPerformanceTrends(),
        getStudents({ page: 1, page_size: 6, sort_by: 'latest_score', ascending: true })
      ]);
      setSummary(sumRes);
      setTrends(trendRes.trends);
      setRecentStudents(stuRes.students);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch executive dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Synthesizing academic indicators and support metrics..." />;
  if (error || !summary) return <ErrorMessage message={error || 'No summary data available.'} onRetry={fetchData} />;

  // Custom risk distribution palette
  const riskDonutData = [
    { name: 'Steady Progress (Low Risk)', value: summary.low_risk_count, color: '#3F7959' },
    { name: 'Check-in Recommended (Medium Risk)', value: summary.medium_risk_count, color: '#B77B2D' },
    { name: 'Priority Support (High Risk)', value: summary.high_risk_count, color: '#B94A48' }
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Page Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans block mb-1">
            Academic Monitoring Suite
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-main">
            Understanding student progress
          </h1>
          <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
            An overview of academic performance, learning patterns, and students who may benefit from additional advisory support before upcoming assessments.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest text-white text-xs font-semibold rounded-xl hover:bg-forest-hover shadow-warm-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Prediction Studio
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero Student Support Summary Section (Non-generic layout) */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-warm-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-light border border-sage text-forest text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Current Evaluation Cohort &bull; {summary.total_unique_students} Students</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-main leading-snug">
              Early pedagogical intervention can prevent unexpected assessment drops.
            </h2>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed">
              Out of <strong>{summary.total_prediction_records.toLocaleString()}</strong> longitudinal student observations across 5 academic periods, the predictive pipeline identified <strong>{summary.high_risk_count.toLocaleString()} instances ({((summary.high_risk_count / summary.total_prediction_records) * 100).toFixed(1)}%)</strong> exhibiting signals that warrant proactive educator consultation.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/risk-analysis"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest bg-sage-light hover:bg-sage px-4 py-2 rounded-xl transition-colors"
              >
                Inspect Students Needing Support <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/students"
                className="text-xs font-semibold text-secondary hover:text-main px-3 py-2"
              >
                View Full Student Directory
              </Link>
            </div>
          </div>

          {/* Prominent High-Level Numbers */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 p-4 bg-ivory rounded-xl border border-border">
            <div className="p-3.5 bg-white rounded-lg border border-border shadow-warm-sm">
              <span className="text-[11px] font-medium text-secondary block uppercase">Total Tracked</span>
              <span className="text-2xl font-bold text-main font-sans mt-1 block">
                {summary.total_unique_students.toLocaleString()}
              </span>
              <span className="text-[10px] text-secondary mt-0.5 block">Unique learners</span>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-softred/60 shadow-warm-sm">
              <span className="text-[11px] font-medium text-danger block uppercase">Support Needed</span>
              <span className="text-2xl font-bold text-danger font-sans mt-1 block">
                {summary.high_risk_count.toLocaleString()}
              </span>
              <span className="text-[10px] text-secondary mt-0.5 block">High advisory risk</span>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-border shadow-warm-sm">
              <span className="text-[11px] font-medium text-secondary block uppercase">Mean Attendance</span>
              <span className="text-2xl font-bold text-forest font-sans mt-1 block">
                {summary.average_attendance}%
              </span>
              <span className="text-[10px] text-secondary mt-0.5 block">Target: 80%+</span>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-border shadow-warm-sm">
              <span className="text-[11px] font-medium text-secondary block uppercase">HW Diligence</span>
              <span className="text-2xl font-bold text-main font-sans mt-1 block">
                {summary.average_assignment_completion}%
              </span>
              <span className="text-[10px] text-secondary mt-0.5 block">Submission rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Overall Average Historical Score"
          value={`${summary.average_previous_score}%`}
          subtitle="Mean performance across historical exams"
          icon={TrendingUp}
          badge="Cohort Benchmark"
          badgeType="sage"
        />
        <MetricCard
          title="Students in Steady Progress"
          value={summary.low_risk_count.toLocaleString()}
          subtitle={`${((summary.low_risk_count / summary.total_prediction_records) * 100).toFixed(1)}% of all evaluated periods`}
          icon={Users}
          badge="On Track"
          badgeType="sage"
        />
        <MetricCard
          title="Check-in Recommended"
          value={summary.medium_risk_count.toLocaleString()}
          subtitle="Borderline or fluctuating momentum"
          icon={Clock}
          badge="Medium Advisory"
          badgeType="amber"
        />
      </div>

      {/* Visual Analytics Section: Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Longitudinal Score & Risk Trends (7 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-main">
                Cohort Academic Trajectory Across Periods
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Progression of average exam marks and risk rates from early diagnostic periods to final assessments
              </p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 shrink-0">
              Detailed Trends <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E6DD" vertical={false} />
                <XAxis
                  dataKey="period"
                  tickFormatter={(p) => `Period ${p}`}
                  tick={{ fontSize: 11, fill: '#738078' }}
                  axisLine={{ stroke: '#E5E6DD' }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E6DD',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(38, 53, 45, 0.08)',
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="mean_latest_score"
                  name="Mean Score (%)"
                  stroke="#244C3C"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#244C3C' }}
                />
                <Line
                  type="monotone"
                  dataKey="mean_attendance"
                  name="Attendance (%)"
                  stroke="#3F7959"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="at_risk_rate"
                  name="At-Risk Rate (%)"
                  stroke="#B94A48"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#B94A48' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px] text-secondary">
            <span>Evaluations reflect only information available prior to cutoff.</span>
            <span className="font-semibold text-main">Periods Analyzed: {trends.length}</span>
          </div>
        </div>

        {/* Risk Distribution Donut (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between">
          <div>
            <h3 className="font-editorial text-lg font-bold text-main">
              Support Category Breakdown
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Empirical categorization by model probability bands
            </p>
          </div>

          <div className="h-56 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [
                    `${val.toLocaleString()} records (${((val / summary.total_prediction_records) * 100).toFixed(1)}%)`,
                    'Count'
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E6DD',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="font-editorial text-2xl font-bold text-main block">
                {summary.at_risk_percentage}%
              </span>
              <span className="text-[10px] text-secondary uppercase tracking-wider block">
                At-Risk Ratio
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border text-xs">
            {riskDonutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="truncate">{d.name.split(' (')[0]}</span>
                </span>
                <span className="font-semibold text-main font-mono">
                  {d.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Student Support Review Table */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-editorial text-lg font-bold text-main">
              Students who may benefit from consultation
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Preliminary advisory alerts prioritizing students with declining score trends or low formative completion.
            </p>
          </div>
          <Link
            to="/risk-analysis"
            className="text-xs font-semibold text-forest hover:underline flex items-center gap-1 shrink-0"
          >
            Review All Flagged Students <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-ivory text-[11px] font-semibold text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Student Reference</th>
                <th className="py-3 px-4">Latest Score</th>
                <th className="py-3 px-4">Historical Mean</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">HW Completed</th>
                <th className="py-3 px-4">Momentum</th>
                <th className="py-3 px-4">Advisory Category</th>
                <th className="py-3 px-4 text-right">Student Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentStudents.map((s) => (
                <tr key={`${s.student_id}-${s.assessment_period}`} className="hover:bg-ivory/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-main font-mono">{s.student_id}</td>
                  <td className="py-3.5 px-4 font-bold text-danger">{s.latest_score}%</td>
                  <td className="py-3.5 px-4 text-secondary">{s.average_previous_score}%</td>
                  <td className="py-3.5 px-4">
                    <span className={s.attendance_rate < 70 ? 'text-danger font-semibold' : 'text-main'}>
                      {s.attendance_rate}%
                    </span>
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
                    <RiskBadge band={s.advisory_risk_band} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/students/${s.student_id}`}
                      className="inline-flex items-center gap-1 text-forest hover:text-forest-dark font-semibold text-xs"
                    >
                      View Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
