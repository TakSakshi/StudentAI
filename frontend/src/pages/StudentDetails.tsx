import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  CalendarCheck,
  BookOpen,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle
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
      setError(err?.message || `Failed to retrieve records for ${studentId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  if (loading) return <LoadingSpinner message={`Loading academic record for ${studentId}...`} />;
  if (error || !detail) return <ErrorMessage message={error || 'Student not found.'} onRetry={fetchStudentData} />;

  const latest = detail.latest_record;

  const trajectoryData = detail.history.map((h) => ({
    period: `Period ${h.assessment_period}`,
    score: h.latest_score,
    attendance: h.attendance_rate,
    completion: h.assignment_completion_rate,
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student Directory
        </Link>
        <span className="text-xs text-secondary">
          Academic Progress Record &bull; Anonymous Reference <strong className="font-mono text-main">{detail.student_id}</strong>
        </span>
      </div>

      {/* Student Academic Identity Card */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sage-light text-forest flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-editorial text-2xl font-bold text-main">{detail.student_id}</h2>
              <RiskBadge
                band={livePrediction?.advisory_risk_band || latest.advisory_risk_band}
                size="md"
                supportive={true}
              />
            </div>
            <p className="text-xs text-secondary mt-1">
              Active student across {detail.summary.total_periods_tracked} assessment periods &bull; Latest evaluation:{' '}
              {latest.prediction_date}
            </p>
          </div>
        </div>

        {/* Live Advisory Vulnerability Meter */}
        {livePrediction && (
          <div className="p-4 bg-ivory rounded-xl border border-border shrink-0 min-w-[220px]">
            <div className="text-[11px] font-medium text-secondary uppercase tracking-wider">
              Advisory Vulnerability
            </div>
            <div className="text-2xl font-bold font-sans mt-0.5" style={{ color: livePrediction.risk_band_color }}>
              {livePrediction.risk_percentage}%
            </div>
            <div className="w-full bg-border/60 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${livePrediction.risk_percentage}%`,
                  backgroundColor: livePrediction.risk_band_color
                }}
              />
            </div>
            <div className="text-[10px] text-secondary mt-1.5 flex justify-between">
              <span>Threshold: {livePrediction.decision_threshold}</span>
              <span>Model: {livePrediction.model_name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Human Review Reminder Banner */}
      <div className="bg-amber-light border border-amber/40 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-text shrink-0 mt-0.5" />
        <div className="text-xs text-amber-text leading-relaxed">
          <span className="font-bold">Human Review Required:</span> {detail.human_review_disclaimer}
        </div>
      </div>

      {/* Summary Academic Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
          <span className="text-[11px] font-medium text-secondary uppercase block">Latest Assessment</span>
          <span className="text-2xl font-bold text-main font-sans mt-1 block">{latest.latest_score}%</span>
          <span className="text-[11px] text-secondary mt-1 block">Mean: {detail.summary.historical_mean_score}%</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
          <span className="text-[11px] font-medium text-secondary uppercase block">Class Attendance</span>
          <span className={`text-2xl font-bold font-sans mt-1 block ${latest.attendance_rate < 70 ? 'text-danger' : 'text-main'}`}>
            {latest.attendance_rate}%
          </span>
          <span className="text-[11px] text-secondary mt-1 block">Hist Mean: {detail.summary.historical_mean_attendance}%</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
          <span className="text-[11px] font-medium text-secondary uppercase block">Homework Diligence</span>
          <span className="text-2xl font-bold text-main font-sans mt-1 block">
            {latest.assignment_completion_rate}%
          </span>
          <span className="text-[11px] text-secondary mt-1 block">{latest.assignments_completed} of {latest.total_assignments} completed</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm">
          <span className="text-[11px] font-medium text-secondary uppercase block">Recent Momentum</span>
          <span className="text-lg font-bold text-main font-sans mt-1.5 flex items-center gap-1.5">
            {latest.score_trend === 'Improving' ? (
              <span className="text-forest flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Improving</span>
            ) : latest.score_trend === 'Declining' ? (
              <span className="text-danger flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Declining</span>
            ) : (
              <span className="text-secondary">Stable</span>
            )}
          </span>
          <span className="text-[11px] text-secondary mt-1 block">Range: {detail.summary.min_recorded_score}% - {detail.summary.max_recorded_score}%</span>
        </div>
      </div>

      {/* Trajectory & Academic Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Longitudinal Trajectory Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-border shadow-warm-sm">
          <h3 className="font-editorial text-lg font-bold text-main mb-1">
            Historical Academic Trajectory
          </h3>
          <p className="text-xs text-secondary mb-4">
            Longitudinal progression of exam scores and engagement signals across periods
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E6DD" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E6DD',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Assessment Mark (%)"
                  stroke="#244C3C"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#244C3C' }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance (%)"
                  stroke="#3F7959"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  name="HW Completion (%)"
                  stroke="#B77B2D"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: '#B77B2D' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Signals to Review (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-forest" />
              <h3 className="font-editorial text-lg font-bold text-main">
                Academic signals to review
              </h3>
            </div>
            <p className="text-xs text-secondary mb-4">
              Observable indicators influencing the model's advisory estimation (correlations, not diagnoses)
            </p>

            <div className="space-y-3">
              {livePrediction?.influential_signals && livePrediction.influential_signals.length > 0 ? (
                livePrediction.influential_signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs ${
                      sig.impact === 'Increases Risk'
                        ? 'bg-softred-light border-softred/60 text-softred-text'
                        : 'bg-sage-light border-sage text-forest'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{sig.signal}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-80">{sig.importance}</span>
                    </div>
                    <p className="mt-1 text-[11px] opacity-90 leading-relaxed">{sig.detail}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-ivory rounded-xl text-xs text-secondary text-center">
                  No atypical performance flags detected for this student.
                </div>
              )}
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="mt-4 pt-4 border-t border-border bg-ivory -mx-6 -mb-6 p-6 rounded-b-2xl">
            <div className="text-xs font-bold text-main uppercase tracking-wider">Suggested Pedagogical Follow-up</div>
            <div className="mt-1 text-xs text-forest font-semibold">
              {detail.advisory_recommendation.suggested_action}
            </div>
            <ul className="mt-2 space-y-1">
              {detail.advisory_recommendation.focus_areas.map((fa, i) => (
                <li key={i} className="text-[11px] text-secondary flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-forest shrink-0" /> {fa}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Historical Record Table */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm">
        <h3 className="font-editorial text-lg font-bold text-main mb-3">
          Historical Assessment Periods
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-ivory text-[11px] font-semibold text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Evaluation Date</th>
                <th className="py-2.5 px-3">Score at Cutoff</th>
                <th className="py-2.5 px-3">Historical Avg</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Formative HW</th>
                <th className="py-2.5 px-3">Momentum</th>
                <th className="py-2.5 px-3">Target Exam Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {detail.history.map((h) => (
                <tr key={h.assessment_period} className="hover:bg-ivory/60">
                  <td className="py-2.5 px-3 font-semibold text-main">Period {h.assessment_period}</td>
                  <td className="py-2.5 px-3 text-secondary">{h.prediction_date}</td>
                  <td className="py-2.5 px-3 font-bold text-main font-sans">{h.latest_score}%</td>
                  <td className="py-2.5 px-3 text-secondary font-sans">{h.average_previous_score}%</td>
                  <td className="py-2.5 px-3 font-sans">{h.attendance_rate}%</td>
                  <td className="py-2.5 px-3">
                    {h.assignments_completed}/{h.total_assignments} ({h.assignment_completion_rate}%)
                  </td>
                  <td className="py-2.5 px-3">{h.score_trend}</td>
                  <td className="py-2.5 px-3">
                    {h.next_assessment_score != null ? (
                      <span className={h.next_assessment_score < 40 ? 'text-danger font-semibold' : 'text-forest font-semibold'}>
                        {h.next_assessment_score}% ({h.at_risk === 1 ? 'Under 40%' : 'Passed'})
                      </span>
                    ) : (
                      <span className="text-secondary italic">Upcoming</span>
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
