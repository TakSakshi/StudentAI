import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  CalendarCheck,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { getStudentDetail, predictRisk } from '../services/api';
import { StudentDetailResponse, PredictionResponse } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  const [detail, setDetail] = useState<StudentDetailResponse | null>(null);
  const [livePrediction, setLivePrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentDetail(studentId);
      setDetail(data);

      // Trigger live inference for this student's latest state
      const pred = await predictRisk({
        student_id: data.student_id,
        attendance_rate: data.latest_record.attendance_rate,
        assignments_completed: data.latest_record.assignments_completed,
        total_assignments: data.latest_record.total_assignments,
        previous_score_1: data.latest_record.previous_score_1,
        previous_score_2: data.latest_record.previous_score_2,
        previous_score_3: data.latest_record.previous_score_3,
        average_previous_score: data.latest_record.average_previous_score,
        score_trend: data.latest_record.score_trend
      });
      setLivePrediction(pred);
    } catch (err: any) {
      setError(err?.message || `Failed to load details for ${studentId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  if (loading) return <LoadingSpinner message={`Loading academic trajectory for ${studentId}...`} />;
  if (error || !detail) return <ErrorMessage message={error || 'Student not found.'} onRetry={fetchStudentData} />;

  const latest = detail.latest_record;

  // Chart trajectory data across historical periods
  const trajectoryData = detail.history.map((h) => ({
    period: `Period ${h.assessment_period}`,
    score: h.latest_score,
    attendance: h.attendance_rate,
    completion: h.assignment_completion_rate,
  }));

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-main"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student List
        </Link>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <span>Student ID:</span>
          <span className="font-mono font-bold text-main bg-white px-2 py-1 rounded border border-border">
            {detail.student_id}
          </span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-main">{detail.student_id}</h2>
              <RiskBadge band={livePrediction?.advisory_risk_band || latest.advisory_risk_band} size="md" />
            </div>
            <p className="text-xs text-secondary mt-1">
              Tracked across {detail.summary.total_periods_tracked} assessment periods &bull; Latest cutoff:{' '}
              {latest.prediction_date}
            </p>
          </div>
        </div>

        {/* Live Model Risk Score Meter */}
        {livePrediction && (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-border w-full md:w-auto">
            <div>
              <div className="text-[11px] text-secondary font-medium uppercase tracking-wider">Model Probability</div>
              <div className="text-2xl font-bold" style={{ color: livePrediction.risk_band_color }}>
                {livePrediction.risk_percentage}%
              </div>
              <div className="text-[10px] text-secondary">Decision Threshold: {livePrediction.decision_threshold}</div>
            </div>
            <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${livePrediction.risk_percentage}%`,
                  backgroundColor: livePrediction.risk_band_color
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Human Review Advisory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Human Review Mandate:</span> {detail.human_review_disclaimer}
        </div>
      </div>

      {/* Key Academic Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[11px] text-secondary font-medium uppercase">Latest Assessment</div>
          <div className="text-2xl font-bold text-main mt-1">{latest.latest_score}%</div>
          <div className="text-[11px] text-secondary mt-1">Historical Avg: {latest.average_previous_score}%</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[11px] text-secondary font-medium uppercase">Class Attendance</div>
          <div className={`text-2xl font-bold mt-1 ${latest.attendance_rate < 70 ? 'text-danger' : 'text-main'}`}>
            {latest.attendance_rate}%
          </div>
          <div className="text-[11px] text-secondary mt-1">Target: 80.0%+</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[11px] text-secondary font-medium uppercase">Assignments Completed</div>
          <div className="text-2xl font-bold text-main mt-1">
            {latest.assignments_completed}/{latest.total_assignments}
          </div>
          <div className="text-[11px] text-secondary mt-1">{latest.assignment_completion_rate}% completion</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[11px] text-secondary font-medium uppercase">Performance Trend</div>
          <div className="text-lg font-bold text-main mt-1.5 flex items-center gap-1.5">
            {latest.score_trend === 'Improving' ? (
              <span className="text-success flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Improving</span>
            ) : latest.score_trend === 'Declining' ? (
              <span className="text-danger flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Declining</span>
            ) : (
              <span className="text-secondary">Stable</span>
            )}
          </div>
          <div className="text-[11px] text-secondary mt-1">Std Dev: {latest.score_std}</div>
        </div>
      </div>

      {/* Trajectory Chart & Influential Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal History Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-bold text-main mb-1">Longitudinal Academic Trajectory</h3>
          <p className="text-xs text-secondary mb-4">Historical score progression and attendance across periods</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF1', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Assessment Score (%)"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance (%)"
                  stroke="#16A34A"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  name="Assignment Completion (%)"
                  stroke="#D97706"
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Influential Academic Signals & Recommended Action */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-main">Explainable Model Signals</h3>
          </div>
          <p className="text-xs text-secondary mb-4">Specific academic drivers detected before cutoff</p>

          {livePrediction?.influential_signals && livePrediction.influential_signals.length > 0 ? (
            <div className="space-y-3 flex-1">
              {livePrediction.influential_signals.map((sig, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs ${
                    sig.impact === 'Increases Risk'
                      ? 'bg-red-50/50 border-red-200 text-red-900'
                      : 'bg-green-50/50 border-green-200 text-green-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{sig.signal}</span>
                    <span className="text-[10px] uppercase tracking-wider">{sig.importance}</span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-80 leading-relaxed">{sig.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary italic">No critical anomalies flagged.</p>
          )}

          {/* Action Recommendation */}
          <div className="mt-4 pt-4 border-t border-border bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <div className="text-xs font-bold text-main">Recommended Educator Action</div>
            <div className="mt-1 text-xs text-primary font-medium">
              {detail.advisory_recommendation.suggested_action}
            </div>
            <ul className="mt-2 space-y-1">
              {detail.advisory_recommendation.focus_areas.map((fa, i) => (
                <li key={i} className="text-[11px] text-secondary flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary shrink-0" /> {fa}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Historical Assessment Periods Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <h3 className="text-sm font-bold text-main mb-3">Historical Assessment Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Cutoff Date</th>
                <th className="py-2.5 px-3">Score at Cutoff</th>
                <th className="py-2.5 px-3">Historical Avg</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Assignments</th>
                <th className="py-2.5 px-3">Trend</th>
                <th className="py-2.5 px-3">Next Exam Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {detail.history.map((h) => (
                <tr key={h.assessment_period} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-semibold text-main">Period {h.assessment_period}</td>
                  <td className="py-2.5 px-3 text-secondary">{h.prediction_date}</td>
                  <td className="py-2.5 px-3 font-bold text-main">{h.latest_score}%</td>
                  <td className="py-2.5 px-3 text-secondary">{h.average_previous_score}%</td>
                  <td className="py-2.5 px-3">{h.attendance_rate}%</td>
                  <td className="py-2.5 px-3">
                    {h.assignments_completed}/{h.total_assignments} ({h.assignment_completion_rate}%)
                  </td>
                  <td className="py-2.5 px-3">{h.score_trend}</td>
                  <td className="py-2.5 px-3">
                    {h.next_assessment_score != null ? (
                      <span className={h.next_assessment_score < 40 ? 'text-danger font-semibold' : 'text-success font-semibold'}>
                        {h.next_assessment_score}% ({h.at_risk === 1 ? 'At-Risk' : 'Safe'})
                      </span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
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
