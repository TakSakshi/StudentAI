import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Info,
  Layers,
  FileCheck2
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
      setError(err?.message || 'Failed to retrieve empirical model metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner message="Retrieving empirical model evaluation artifacts..." />;
  if (error || !data) return <ErrorMessage message={error || 'No metrics found.'} onRetry={fetchMetrics} />;

  const testCm = data.test_metrics.confusion_matrix;

  const topFeatures = data.global_feature_importance.slice(0, 8).map((f) => ({
    name: f.feature.replace(/_/g, ' '),
    importance: Math.round(f.importance * 1000) / 10,
  }));

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans block mb-1">
            Machine Learning Governance
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-main">
            Model Insights & Empirical Audit
          </h1>
          <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
            Multi-model evaluation comparing Majority Baseline, Balanced Logistic Regression, Random Forest, and XGBoost on chronologically held-out test splits.
          </p>
        </div>
        <div className="bg-ivory px-4 py-2 rounded-xl border border-border text-xs text-secondary shrink-0">
          <div>Selected Pipeline</div>
          <div className="font-bold text-forest text-sm font-sans">{data.model_name} (&tau; = {data.selected_threshold})</div>
        </div>
      </div>

      {/* Held-out Test Scorecards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm text-center">
          <span className="text-[11px] font-medium text-secondary uppercase block">Recall (Sensitivity)</span>
          <span className="text-2xl font-bold text-forest font-sans mt-1 block">{(data.test_metrics.recall * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-secondary mt-0.5 block">At-risk captured</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm text-center">
          <span className="text-[11px] font-medium text-secondary uppercase block">Precision</span>
          <span className="text-2xl font-bold text-main font-sans mt-1 block">{(data.test_metrics.precision * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-secondary mt-0.5 block">Alert reliability</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm text-center">
          <span className="text-[11px] font-medium text-secondary uppercase block">F1-Score</span>
          <span className="text-2xl font-bold text-main font-sans mt-1 block">{(data.test_metrics.f1 * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-secondary mt-0.5 block">Harmonic balance</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm text-center">
          <span className="text-[11px] font-medium text-secondary uppercase block">ROC-AUC</span>
          <span className="text-2xl font-bold text-forest font-sans mt-1 block">{data.test_metrics.roc_auc?.toFixed(3) || '—'}</span>
          <span className="text-[10px] text-secondary mt-0.5 block">Discrimination</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm text-center">
          <span className="text-[11px] font-medium text-secondary uppercase block">PR-AUC</span>
          <span className="text-2xl font-bold text-main font-sans mt-1 block">{data.test_metrics.pr_auc?.toFixed(3) || '—'}</span>
          <span className="text-[10px] text-secondary mt-0.5 block">Precision-Recall curve</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-warm-sm text-center">
          <span className="text-[11px] font-medium text-secondary uppercase block">Brier Score</span>
          <span className="text-2xl font-bold text-secondary font-sans mt-1 block">{data.test_metrics.brier_score?.toFixed(4) || '—'}</span>
          <span className="text-[10px] text-secondary mt-0.5 block">Calibration loss</span>
        </div>
      </div>

      {/* Multi-Model Benchmark Comparison Table */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-editorial text-lg font-bold text-main">
              Empirical Model Comparison Matrix
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Models trained on Periods 1–3, validated on Period 4, selected candidate evaluated on held-out Period 5.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-ivory text-secondary rounded-lg border border-border">
            Zero Future-Data Leakage
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-ivory text-[11px] font-semibold text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Model Candidate</th>
                <th className="py-3 px-4">Evaluation Split</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">PR-AUC</th>
                <th className="py-3 px-4 text-center">Selection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.model_comparison.map((row, idx) => {
                const isSelected = row.model_name.includes('Selected');
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected ? 'bg-sage-light/40 font-semibold' : 'hover:bg-ivory/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-main flex items-center gap-2">
                      {isSelected && <Award className="w-4 h-4 text-forest shrink-0" />}
                      {row.model_name}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        row.split === 'test' ? 'bg-lavender-light text-lavender-text' : 'bg-ivory text-secondary'
                      }`}>
                        {row.split}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{(row.precision * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-mono text-forest font-bold">{(row.recall * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-main">{(row.f1 * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{(row.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{row.roc_auc != null ? row.roc_auc.toFixed(3) : '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-secondary">{row.pr_auc != null ? row.pr_auc.toFixed(3) : '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-sage-light text-forest font-bold border border-sage">
                          Selected Winner
                        </span>
                      ) : row.model_name.includes('Majority') ? (
                        <span className="text-secondary text-[11px]">Benchmark Lower-Bound</span>
                      ) : (
                        <span className="text-secondary text-[11px]">Evaluated Candidate</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix and Global Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Held-Out Test Confusion Matrix (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between">
          <div>
            <h3 className="font-editorial text-lg font-bold text-main">
              Held-Out Test Set Confusion Matrix
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Evaluated on N = {testCm.tp + testCm.fp + testCm.fn + testCm.tn} unobserved Period 5 student records
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-4 rounded-xl bg-sage-light/60 border border-sage">
              <div className="flex items-center justify-between text-xs text-forest font-semibold">
                <span>True Negatives (TN)</span>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div className="font-editorial text-3xl font-bold text-forest mt-2">{testCm.tn}</div>
              <p className="text-[11px] text-secondary mt-1">Passing students correctly identified as not requiring intervention.</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-light/70 border border-amber/40">
              <div className="flex items-center justify-between text-xs text-amber-text font-semibold">
                <span>False Positives (FP)</span>
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <div className="font-editorial text-3xl font-bold text-amber-text mt-2">{testCm.fp}</div>
              <p className="text-[11px] text-secondary mt-1">False Alarm: Student rallied right before exam to pass.</p>
            </div>

            <div className="p-4 rounded-xl bg-softred-light/70 border border-softred">
              <div className="flex items-center justify-between text-xs text-softred-text font-semibold">
                <span>False Negatives (FN)</span>
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <div className="font-editorial text-3xl font-bold text-softred-text mt-2">{testCm.fn}</div>
              <p className="text-[11px] text-secondary mt-1">Missed At-Risk: Student encountered unobserved exam shock.</p>
            </div>

            <div className="p-4 rounded-xl bg-sage-light/60 border border-sage">
              <div className="flex items-center justify-between text-xs text-forest font-semibold">
                <span>True Positives (TP)</span>
                <CheckCircle2 className="w-4 h-4 text-forest" />
              </div>
              <div className="font-editorial text-3xl font-bold text-forest mt-2">{testCm.tp}</div>
              <p className="text-[11px] text-secondary mt-1">At-risk students successfully flagged for early support.</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-secondary">
            <span>False Alarm Rate: {((testCm.fp / (testCm.fp + testCm.tn)) * 100).toFixed(1)}%</span>
            <span>Missed Rate: {((testCm.fn / (testCm.fn + testCm.tp)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Global Feature Importance (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-border shadow-warm-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-forest" />
              <h3 className="font-editorial text-lg font-bold text-main">
                Global Feature Importances
              </h3>
            </div>
            <p className="text-xs text-secondary mb-4">
              Relative Gini impurity reduction across Random Forest tree splits
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topFeatures} margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E6DD" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10, fill: '#738078' }} axisLine={{ stroke: '#E5E6DD' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#26352D' }} width={120} axisLine={{ stroke: '#E5E6DD' }} />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Relative Gini Importance']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E6DD', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#244C3C" radius={[0, 4, 4, 0]}>
                  {topFeatures.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? '#244C3C' : '#3F7959'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-ivory rounded-xl text-xs text-secondary border border-border mt-3">
            <span className="font-bold text-main">Key Insight:</span> Historical test persistence (`latest_score`, `average_previous_score`) and class attendance dominate splits.
          </div>
        </div>
      </div>

      {/* Trade-off Analysis Narrative */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-warm-sm space-y-4">
        <h3 className="font-editorial text-lg font-bold text-main flex items-center gap-2">
          <Info className="w-5 h-5 text-forest" />
          Trade-off Analysis & Methodological Transparency
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Why Recall Matters in Education</div>
            <p className="text-secondary leading-relaxed">{data.trade_off_analysis.recall_importance}</p>
          </div>
          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Preventing Educator Alert Fatigue</div>
            <p className="text-secondary leading-relaxed">{data.trade_off_analysis.precision_balance}</p>
          </div>
          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Class Imbalance Handling</div>
            <p className="text-secondary leading-relaxed">{data.trade_off_analysis.class_imbalance}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
