import React, { useState } from 'react';
import {
  Binary,
  Sparkles,
  Send,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Cpu,
  Bookmark
} from 'lucide-react';

import { predictRisk } from '../services/api';
import { PredictionRequest, PredictionResponse } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Prediction: React.FC = () => {
  const [formData, setFormData] = useState<PredictionRequest>({
    student_id: 'STU_SAMPLE_01',
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

  // Preset demo samples for rapid testing
  const presets = [
    {
      name: 'At-Risk / Disengaged Student',
      desc: 'Low attendance, incomplete homework, declining test scores',
      data: {
        student_id: 'STU_AT_RISK_DEMO',
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
      name: 'High-Achieving Student',
      desc: 'High attendance, complete homework, strong test scores',
      data: {
        student_id: 'STU_HIGH_ACHIEVER_DEMO',
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
      name: 'Diligent but Struggling Student',
      desc: 'High attendance and homework, but low conceptual exam marks',
      data: {
        student_id: 'STU_DILIGENT_STRUGGLING',
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
      // Calculate average previous score automatically if not set
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
      setError(err?.response?.data?.detail || err?.message || 'Prediction request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-main">Individual Student Risk Prediction</h2>
        </div>
        <p className="text-sm text-secondary mt-1">
          Real-time inference using the trained Random Forest model. Evaluates attendance, assignment completion, and historical scores strictly prior to upcoming assessment cutoff.
        </p>
      </div>

      {/* Preset Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetSelect(p)}
            className="text-left p-3.5 bg-white border border-border rounded-xl hover:border-primary hover:bg-primary-light/30 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-main">
              <Bookmark className="w-3.5 h-3.5 text-primary" />
              {p.name}
            </div>
            <div className="text-[11px] text-secondary mt-1 line-clamp-2">{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Form and Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-sm font-bold text-main mb-4">Academic Input Features</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1">Student Identifier</label>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="e.g. STU_0042"
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">
                  Class Attendance Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="attendance_rate"
                  value={formData.attendance_rate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Assignments Completed</label>
                <input
                  type="number"
                  min="0"
                  name="assignments_completed"
                  value={formData.assignments_completed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Total Assignments Due</label>
                <input
                  type="number"
                  min="1"
                  name="total_assignments"
                  value={formData.total_assignments}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">
                  Latest Assessment Score (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="previous_score_1"
                  value={formData.previous_score_1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">
                  2nd Most Recent Score (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="previous_score_2"
                  value={formData.previous_score_2 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">
                  3rd Most Recent Score (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="previous_score_3"
                  value={formData.previous_score_3 || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1">Academic Momentum / Trend</label>
                <select
                  name="score_trend"
                  value={formData.score_trend}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                >
                  <option value="Improving">Improving (+ momentum)</option>
                  <option value="Stable">Stable (consistent)</option>
                  <option value="Declining">Declining (- downward trend)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Inference...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Evaluate Academic Risk
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-main mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Advisory Prediction Outcome
          </h3>

          {result ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Risk Band Banner */}
              <div
                className="p-4 rounded-xl border flex items-center justify-between"
                style={{
                  backgroundColor: `${result.risk_band_color}10`,
                  borderColor: `${result.risk_band_color}40`
                }}
              >
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: result.risk_band_color }}>
                    {result.advisory_risk_band}
                  </div>
                  <div className="text-2xl font-bold mt-0.5" style={{ color: result.risk_band_color }}>
                    {result.risk_percentage}% Vulnerability
                  </div>
                </div>
                <div className="text-right text-[11px] text-secondary">
                  <div>Threshold: &tau; = {result.decision_threshold}</div>
                  <div className="font-semibold text-main">
                    {result.is_at_risk ? 'At-Risk Classification' : 'Safe Classification'}
                  </div>
                </div>
              </div>

              {/* Explanatory Narrative */}
              <div className="p-3 bg-slate-50 rounded-xl border border-border text-xs text-secondary leading-relaxed">
                <span className="font-semibold text-main">Clinical Narrative:</span> {result.explanation_narrative}
              </div>

              {/* Influential Academic Signals List */}
              <div className="space-y-2 flex-1">
                <div className="text-xs font-bold text-main">Influential Academic Signals:</div>
                {result.influential_signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                      sig.impact === 'Increases Risk'
                        ? 'bg-red-50/50 border-red-200 text-red-900'
                        : 'bg-green-50/50 border-green-200 text-green-900'
                    }`}
                  >
                    {sig.impact === 'Increases Risk' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{sig.signal}</div>
                      <div className="text-[11px] opacity-80 mt-0.5">{sig.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mandatory Responsible Use Warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-tight flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Advisory Disclaimer:</strong> {result.human_review_disclaimer}
                </span>
              </div>

              {/* Meta footer */}
              <div className="text-[10px] text-secondary pt-2 border-t border-border flex items-center justify-between">
                <span>Model: {result.model_name} v{result.model_version}</span>
                <span>Timestamp: {new Date(result.prediction_timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="my-auto py-16 text-center text-secondary border border-dashed border-border rounded-xl">
              <Binary className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">Select a student preset above or enter academic metrics and click Evaluate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
