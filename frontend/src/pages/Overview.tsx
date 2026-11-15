import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  CalendarCheck,
  Award,
  ArrowRight,
  TrendingDown,
  ShieldAlert
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
  Legend,
  BarChart,
  Bar
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

  if (loading) return <LoadingSpinner message="Aggregating academic indicators and model predictions..." />;
  if (error || !summary) return <ErrorMessage message={error || 'No summary data available.'} onRetry={fetchData} />;

  // Donut chart data for risk bands
  const riskDonutData = [
    { name: 'Low Advisory Risk', value: summary.low_risk_count, color: '#16A34A' },
    { name: 'Medium Advisory Risk', value: summary.medium_risk_count, color: '#D97706' },
    { name: 'High Advisory Risk', value: summary.high_risk_count, color: '#DC2626' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-main">Executive Academic Overview</h2>
          <p className="text-sm text-secondary mt-1">
            Predictive advisory system evaluating student academic risk before upcoming assessments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover shadow-sm transition-colors"
          >
            Run New Prediction
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Human Review Reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Responsible Decision-Support Policy:</span> {summary.human_review_disclaimer}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students Analyzed"
          value={summary.total_unique_students.toLocaleString()}
          subtitle={`${summary.total_prediction_records.toLocaleString()} total historical records`}
          icon={Users}
          badge="Cohort"
          badgeType="info"
        />
        <MetricCard
          title="High Advisory Risk"
          value={summary.high_risk_count.toLocaleString()}
          subtitle={`${((summary.high_risk_count / summary.total_prediction_records) * 100).toFixed(1)}% of all observations`}
          icon={AlertTriangle}
          badge="Priority Support"
          badgeType="danger"
        />
        <MetricCard
          title="Cohort Attendance Rate"
          value={`${summary.average_attendance}%`}
          subtitle="Target threshold: 80.0%"
          icon={CalendarCheck}
          badge={summary.average_attendance >= 80 ? 'Optimal' : 'Needs Focus'}
          badgeType={summary.average_attendance >= 80 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Assignment Completion"
          value={`${summary.average_assignment_completion}%`}
          subtitle="Formative practice completion"
          icon={BookOpen}
          badge={`${summary.average_assignment_completion}% Avg`}
          badgeType="info"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-main">Advisory Risk Distribution</h3>
              <p className="text-xs text-secondary mt-0.5">Categorized by model probability bands</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-secondary">
              N = {summary.total_prediction_records}
            </span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString()} records (${((val / summary.total_prediction_records) * 100).toFixed(1)}%)`, 'Volume']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF1', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <div className="text-xl font-bold text-main">{summary.at_risk_percentage}%</div>
              <div className="text-[11px] text-secondary">At-Risk Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border mt-auto">
            {riskDonutData.map((d) => (
              <div key={d.name} className="text-center">
                <div className="text-xs font-semibold flex items-center justify-center gap-1.5" style={{ color: d.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  {d.value.toLocaleString()}
                </div>
                <div className="text-[10px] text-secondary mt-0.5 truncate">{d.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Longitudinal Performance Trends Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-main">Cohort Academic Trends Across Assessment Periods</h3>
              <p className="text-xs text-secondary mt-0.5">Mean assessment scores, attendance, and at-risk rates over time</p>
            </div>
            <Link to="/analytics" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Deep Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="period"
                  tickFormatter={(p) => `Period ${p}`}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF1', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="mean_latest_score"
                  name="Mean Score (%)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="mean_attendance"
                  name="Attendance (%)"
                  stroke="#16A34A"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="at_risk_rate"
                  name="At-Risk Rate (%)"
                  stroke="#DC2626"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-secondary mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span>Prediction horizons evaluate pre-exam trends strictly up to cutoff.</span>
            <span className="font-medium text-main">Periods Tracked: {trends.length}</span>
          </div>
        </div>
      </div>

      {/* Priority Review & Recently Analyzed Students Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-main">Students Requiring Immediate Pedagogical Review</h3>
            <p className="text-xs text-secondary mt-0.5">
              Ranked by lowest recent score and flagged advisory risk band.
            </p>
          </div>
          <Link
            to="/students?risk_band=High"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All Filtered Students <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Latest Score</th>
                <th className="py-3 px-4">Historical Avg</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Assignment Completion</th>
                <th className="py-3 px-4">Score Trend</th>
                <th className="py-3 px-4">Advisory Risk</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {recentStudents.map((s) => (
                <tr key={`${s.student_id}-${s.assessment_period}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-main">{s.student_id}</td>
                  <td className="py-3 px-4 font-bold text-danger">{s.latest_score}%</td>
                  <td className="py-3 px-4 text-secondary">{s.average_previous_score}%</td>
                  <td className="py-3 px-4">
                    <span className={s.attendance_rate < 70 ? 'text-danger font-medium' : 'text-main'}>
                      {s.attendance_rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">{s.assignment_completion_rate}%</td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4">
                    <RiskBadge band={s.advisory_risk_band} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/students/${s.student_id}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium text-xs"
                    >
                      Inspect Profile <ArrowRight className="w-3 h-3" />
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
