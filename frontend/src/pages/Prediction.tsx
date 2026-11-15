import React, { useState } from 'react';
import {
  Binary,
  Sparkles,
  Send,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';

import { predictRisk } from '../services/api';
import { PredictionRequest, PredictionResponse } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const Prediction: React.FC = () => {
  const [formData, setFormData] = useState<PredictionRequest>({
    student_id: 'STU_STUDIO_01',
    attendance_rate: 64.0,
    assignments_completed: 4,
    total_assignments: 10,
    previous_score_1: 38.0,
    previous_score_2: 44.0,
    previous_score_3: 49.0,
    average_previous_score: 43.7,
    score_trend: 'Declining'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Structured presets for rapid demonstration
  const presets = [
    {
      name: 'At-Risk / Disengaged Profile',
      desc: 'Low attendance, incomplete formative homework, downward test trajectory',
      data: {
        student_id: 'STU_AT_RISK_CASE',
        attendance_rate: 58.0,
        assignments_completed: 4,
        total_assignments: 10,
        previous_score_1: 34.0,
        previous_score_2: 39.0,
        previous_score_3: 45.0,
        average_previous_score: 39.3,
        score_trend: 'Declining'
      }
    },
    {
      name: 'Steady High-Achiever Profile',
      desc: 'High attendance, complete homework submissions, strong foundational marks',
      data: {
        student_id: 'STU_HIGH_ACHIEVER_CASE',
        attendance_rate: 96.0,
        assignments_completed: 10,
        total_assignments: 10,
        previous_score_1: 88.0,
        previous_score_2: 84.0,
        previous_score_3: 82.0,
        average_previous_score: 84.7,
        score_trend: 'Improving'
      }
    },
    {
      name: 'Diligent but Struggling Profile',
      desc: 'Consistent attendance and homework diligence, but lower conceptual exam scores',
      data: {
        student_id: 'STU_DILIGENT_CASE',
        attendance_rate: 92.0,
        assignments_completed: 9,
        total_assignments: 10,
        previous_score_1: 42.0,
        previous_score_2: 45.0,
        previous_score_3: 43.0,
        average_previous_score: 43.3,
        score_trend: 'Stable'
      }
    }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setFormData(preset.data);
    setError(null);
    setResult(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const s1 = formData.previous_score_1;
      const s2 = formData.previous_score_2 || s1;
      const s3 = formData.previous_score_3 || s2;
      const avg = Math.round(((s1 + s2 + s3) / 3) * 10) / 10;

      const payload: PredictionRequest = {
        ...formData,
        average_previous_score: avg
      };

      const res = await predictRisk(payload);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Prediction calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans block mb-1">
          Decision Support Workspace
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-main">
          Prediction Studio
        </h1>
        <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
          Input student academic indicators to generate real-time advisory risk estimates from the trained Random Forest model. Evaluates information strictly prior to assessment cutoffs.
        </p>
      </div>

      {/* Preset Demo Cards */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Sample Student Archetypes
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className="text-left p-4 bg-white border border-border rounded-xl hover:border-forest hover:bg-sage-light/20 transition-all shadow-warm-sm"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-main font-sans">
                <Bookmark className="w-3.5 h-3.5 text-forest" />
                {p.name}
              </div>
              <p className="text-[11px] text-secondary mt-1 leading-relaxed line-clamp-2">
                {p.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Structured Studio Grid: Form (7 Cols) & Result (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-warm-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Student Reference */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-bold text-main uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-forest" />
                1. Student Reference
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-secondary mb-1">
                  Anonymous Student Identifier
                </label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="e.g. STU_0042"
                  className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs font-mono text-main focus:outline-none focus:border-forest focus:bg-white"
                  required
                />
                <span className="text-[10px] text-secondary mt-1 block">
                  Anonymous reference format (zero personal details collected).
                </span>
              </div>
            </div>

            {/* Section 2: Attendance Information */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-bold text-main uppercase tracking-wider">
                <CalendarCheck className="w-4 h-4 text-forest" />
                2. Attendance Information
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-secondary mb-1">
                  Cumulative Class Attendance Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="attendance_rate"
                  value={formData.attendance_rate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs font-sans text-main focus:outline-none focus:border-forest focus:bg-white"
                  required
                />
                <span className="text-[10px] text-secondary mt-1 block">
                  Cohort benchmark: 80.0%+ attendance.
                </span>
              </div>
            </div>

            {/* Section 3: Assignment Information */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-bold text-main uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-forest" />
                3. Formative Assignment Information
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Assignments Completed
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="assignments_completed"
                    value={formData.assignments_completed}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs text-main focus:outline-none focus:border-forest focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Total Assignments Due
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="total_assignments"
                    value={formData.total_assignments}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs text-main focus:outline-none focus:border-forest focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Previous Academic Performance */}
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-bold text-main uppercase tracking-wider">
                <Binary className="w-4 h-4 text-forest" />
                4. Previous Academic Performance
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Most Recent Score (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    name="previous_score_1"
                    value={formData.previous_score_1}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs text-main focus:outline-none focus:border-forest focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    2nd Most Recent (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    name="previous_score_2"
                    value={formData.previous_score_2 || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs text-main focus:outline-none focus:border-forest focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    3rd Most Recent (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    name="previous_score_3"
                    value={formData.previous_score_3 || ''}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs text-main focus:outline-none focus:border-forest focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-medium text-secondary mb-1">
                  Academic Momentum
                </label>
                <select
                  name="score_trend"
                  value={formData.score_trend}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-ivory border border-border rounded-xl text-xs text-main focus:outline-none focus:border-forest focus:bg-white"
                >
                  <option value="Improving">Improving Trajectory (&Delta; &gt; +3.0)</option>
                  <option value="Stable">Stable Performance (&Delta; within &plusmn;3.0)</option>
                  <option value="Declining">Declining Trajectory (&Delta; &lt; -3.0)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-softred-light border border-softred rounded-xl text-xs text-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest text-white text-xs font-bold rounded-xl hover:bg-forest-hover shadow-warm-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Generating Prediction...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Advisory Prediction
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-forest" />
              <h3 className="font-editorial text-lg font-bold text-main">
                Advisory Prediction Outcome
              </h3>
            </div>
            <p className="text-xs text-secondary mb-4">
              Decision-support estimation generated by the trained ML pipeline
            </p>

            {result ? (
              <div className="space-y-4">
                {/* Advisory Category Banner */}
                <div
                  className="p-4 rounded-xl border flex items-center justify-between"
                  style={{
                    backgroundColor: `${result.risk_band_color}12`,
                    borderColor: `${result.risk_band_color}40`
                  }}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: result.risk_band_color }}>
                      {result.advisory_risk_band}
                    </span>
                    <span className="font-editorial text-2xl font-bold block mt-0.5" style={{ color: result.risk_band_color }}>
                      {result.risk_percentage}% Vulnerability
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-secondary">
                    <div>Decision Threshold: {result.decision_threshold}</div>
                    <span className="font-semibold text-main block">
                      {result.is_at_risk ? 'Support Recommended' : 'Progress On-Track'}
                    </span>
                  </div>
                </div>

                {/* Educational Summary Narrative */}
                <div className="p-3.5 bg-ivory rounded-xl border border-border text-xs text-secondary leading-relaxed">
                  <span className="font-bold text-main">Educational Summary:</span> {result.explanation_narrative}
                </div>

                {/* Influential Academic Signals List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-main block">Influential Academic Signals:</span>
                  {result.influential_signals.map((sig, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                        sig.impact === 'Increases Risk'
                          ? 'bg-softred-light border-softred/60 text-softred-text'
                          : 'bg-sage-light border-sage text-forest'
                      }`}
                    >
                      {sig.impact === 'Increases Risk' ? (
                        <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold">{sig.signal}</div>
                        <div className="text-[11px] opacity-90 mt-0.5">{sig.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-secondary border border-dashed border-border rounded-xl">
                <Binary className="w-8 h-8 mx-auto text-sage-dark mb-2" />
                <p className="text-xs font-medium">Select an archetype preset or enter academic indicators to begin evaluation.</p>
              </div>
            )}
          </div>

          {/* Human Review Policy Reminder */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="p-3 bg-amber-light border border-amber/40 rounded-xl text-[11px] text-amber-text flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span>
                <strong>Human Review Mandate:</strong> This is strictly an advisory decision-support tool. It must never automatically penalize, grade, or restrict educational opportunities.
              </span>
            </div>
            {result && (
              <div className="text-[10px] text-secondary mt-2 flex justify-between">
                <span>Model: {result.model_name} v{result.model_version}</span>
                <span>Evaluated: {new Date(result.prediction_timestamp).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
