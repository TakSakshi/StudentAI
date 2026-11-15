import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart2,
  Sliders,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

import { getModelMetrics } from '../services/api';
import { ModelPerformanceResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const ModelPerformance: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getModelMetrics();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch model evaluation metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner message="Loading empirical model evaluation results..." />;
  if (error || !data) return <ErrorMessage message={error || 'No metrics available.'} onRetry={fetchMetrics} />;

  const testCm = data.test_metrics.confusion_matrix;

  // Format global feature importance for chart
  const topFeatures = data.global_feature_importance.slice(0, 8).map((f) => ({
    name: f.feature.replace(/_/g, ' '),
    importance: Math.round(f.importance * 1000) / 10, // percentage
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-main">Machine Learning Model Performance</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary/20">
              Selected: {data.model_name}
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Empirical benchmark comparing Dummy Baseline, Logistic Regression, Random Forest, and XGBoost on held-out chronological splits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-border text-xs text-secondary text-right">
            <div>Decision Threshold</div>
            <div className="font-mono font-bold text-main text-sm">&tau; = {data.selected_threshold}</div>
          </div>
        </div>
      </div>

      {/* Held-Out Test Set Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-center">
          <div className="text-[11px] font-bold text-secondary uppercase">Recall (Sensitivity)</div>
          <div className="text-2xl font-bold text-primary mt-1">{(data.test_metrics.recall * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-secondary mt-0.5">Capturing at-risk</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-center">
          <div className="text-[11px] font-bold text-secondary uppercase">Precision</div>
          <div className="text-2xl font-bold text-main mt-1">{(data.test_metrics.precision * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-secondary mt-0.5">Alert reliability</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-center">
          <div className="text-[11px] font-bold text-secondary uppercase">F1-Score</div>
          <div className="text-2xl font-bold text-main mt-1">{(data.test_metrics.f1 * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-secondary mt-0.5">Harmonic balance</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-center">
          <div className="text-[11px] font-bold text-secondary uppercase">ROC-AUC</div>
          <div className="text-2xl font-bold text-success mt-1">{data.test_metrics.roc_auc?.toFixed(3) || 'N/A'}</div>
          <div className="text-[10px] text-secondary mt-0.5">Discrimination</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-center">
          <div className="text-[11px] font-bold text-secondary uppercase">PR-AUC</div>
          <div className="text-2xl font-bold text-main mt-1">{data.test_metrics.pr_auc?.toFixed(3) || 'N/A'}</div>
          <div className="text-[10px] text-secondary mt-0.5">Precision-Recall curve</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-center">
          <div className="text-[11px] font-bold text-secondary uppercase">Accuracy</div>
          <div className="text-2xl font-bold text-secondary mt-1">{(data.test_metrics.accuracy * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-secondary mt-0.5">Overall cohort</div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-main">Candidate Model Comparison Matrix</h3>
            <p className="text-xs text-secondary mt-0.5">
              Trained on Periods 1–3, validated on Period 4, winning candidate evaluated on held-out Period 5.
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 rounded-lg text-secondary">
            Strict Time-Aware Split
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-[11px] font-bold text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Model Candidate</th>
                <th className="py-3 px-4">Evaluation Split</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">PR-AUC</th>
                <th className="py-3 px-4 text-center">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.model_comparison.map((row, idx) => {
                const isSelected = row.model_name.includes('Selected');
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-main flex items-center gap-2">
                      {isSelected && <Award className="w-4 h-4 text-primary shrink-0" />}
                      {row.model_name}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        row.split === 'test' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {row.split}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{(row.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono text-primary font-bold">{(row.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-main">{(row.f1 * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono text-secondary">{(row.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono text-secondary">{row.roc_auc != null ? row.roc_auc.toFixed(3) : '—'}</td>
                    <td className="py-3 px-4 font-mono text-secondary">{row.pr_auc != null ? row.pr_auc.toFixed(3) : '—'}</td>
                    <td className="py-3 px-4 text-center">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-bold">
                          Selected Model
                        </span>
                      ) : row.model_name.includes('Majority') ? (
                        <span className="text-secondary text-[11px]">Benchmark</span>
                      ) : (
                        <span className="text-secondary text-[11px]">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix and Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-main">Held-Out Test Set Confusion Matrix (Period 5)</h3>
              <p className="text-xs text-secondary mt-0.5">
                Evaluation on N = {testCm.tp + testCm.fp + testCm.fn + testCm.tn} completely held-out predictions
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-secondary">Period 5</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto">
            {/* True Negatives */}
            <div className="p-4 rounded-xl bg-green-50/60 border border-green-200">
              <div className="flex items-center justify-between text-xs text-green-800 font-semibold">
                <span>True Negatives (TN)</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900 mt-2">{testCm.tn}</div>
              <p className="text-[11px] text-green-700 mt-1">Safely predicted; student passed next exam.</p>
            </div>

            {/* False Positives */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
                <span>False Positives (FP)</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-900 mt-2">{testCm.fp}</div>
              <p className="text-[11px] text-amber-700 mt-1">False Alarm; student passed despite advisory alert.</p>
            </div>

            {/* False Negatives */}
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200">
              <div className="flex items-center justify-between text-xs text-red-800 font-semibold">
                <span>False Negatives (FN)</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-900 mt-2">{testCm.fn}</div>
              <p className="text-[11px] text-red-700 mt-1">Missed At-Risk; student failed without early alert.</p>
            </div>

            {/* True Positives */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center justify-between text-xs text-blue-800 font-semibold">
                <span>True Positives (TP)</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mt-2">{testCm.tp}</div>
              <p className="text-[11px] text-blue-700 mt-1">Correctly identified vulnerable student.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-secondary">
            <span>False Alarm Rate: {((testCm.fp / (testCm.fp + testCm.tn)) * 100).toFixed(1)}%</span>
            <span>Missed Rate: {((testCm.fn / (testCm.fn + testCm.tp)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Global Feature Importance */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-main">Global Feature Importances</h3>
              <p className="text-xs text-secondary mt-0.5">Top academic signals driving Random Forest splits</p>
            </div>
            <Sliders className="w-4 h-4 text-secondary" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topFeatures} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#172033' }} width={110} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Relative Gini Importance']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5EAF1', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]}>
                  {topFeatures.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? '#2563EB' : '#93C5FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-secondary border border-border">
            <span className="font-semibold text-main">Primary Drivers:</span> Most recent assessment score, historical score average, and attendance rate dominate split decisions.
          </div>
        </div>
      </div>

      {/* Rigorous Trade-off Analysis & Educational Safety Narrative */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-main flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Rigorous Trade-off Analysis & Methodological Transparency
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Why Recall Matters in Education</div>
            <p className="text-secondary leading-relaxed">{data.trade_off_analysis.recall_importance}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Preventing Educator Alert Fatigue</div>
            <p className="text-secondary leading-relaxed">{data.trade_off_analysis.precision_balance}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Class Imbalance Handling</div>
            <p className="text-secondary leading-relaxed">{data.trade_off_analysis.class_imbalance}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
