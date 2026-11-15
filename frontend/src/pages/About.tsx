import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Database,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  GitBranch
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-main">About StudentInsight AI</h2>
            <p className="text-xs text-secondary mt-0.5">
              ALGIONS AI LABS PRIVATE LIMITED — AI & Machine Learning Assessment
            </p>
          </div>
        </div>
      </div>

      {/* Critical Responsible AI Policy Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-base font-bold text-amber-900">
              Mandatory Responsible AI & Decision-Support Restriction
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              StudentInsight AI is strictly designed and implemented as an <strong>advisory decision-support system</strong> for teachers and educational administrators. It must <strong>NEVER</strong> automatically:
            </p>
            <ul className="text-xs text-amber-900 list-disc list-inside space-y-1 pt-1 font-medium">
              <li>Punish or sanction any student</li>
              <li>Assign, deduct, or alter official academic grades</li>
              <li>Reject admission or restrict educational program access</li>
              <li>Treat an advisory prediction as permanent judgment or definitive proof of future failure</li>
            </ul>
            <p className="text-xs text-amber-900/90 pt-1 italic">
              Every advisory output indicates solely that a student may benefit from additional pedagogical attention, tutoring, or an attendance check-in.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Formulation & ML Design */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-main flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Problem Formulation & ML Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Prediction Unit</div>
            <p className="text-secondary leading-relaxed">
              One student at one specific prediction cutoff immediately prior to an upcoming assessment. Longitudinal student records are evaluated chronologically.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Target Definition</div>
            <p className="text-secondary leading-relaxed">
              Binary label <code className="bg-slate-200 px-1 py-0.5 rounded text-main font-mono">at_risk = 1</code> when the upcoming assessment score is below 40.0%, and <code className="bg-slate-200 px-1 py-0.5 rounded text-main font-mono">0</code> otherwise.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Prediction Horizon & Cutoff</div>
            <p className="text-secondary leading-relaxed">
              Evaluates the immediate next scheduled exam. Only data accumulated prior to the cutoff is fed to features. Future exam outcomes are quarantined from the feature matrix.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Evaluation Strategy</div>
            <p className="text-secondary leading-relaxed">
              Strict time-aware chronological split: Periods 1–3 for model training, Period 4 for threshold tuning & validation, and Period 5 for single held-out test evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset & Privacy Standards */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-main flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          Data Privacy & Synthetic Data Strategy
        </h3>

        <div className="space-y-3 text-xs text-secondary leading-relaxed">
          <p>
            Due to privacy regulations (FERPA, GDPR, DPDP) and the absence of appropriately licensed, longitudinal next-assessment public educational callsets, this project employs a <strong>reproducible probabilistic synthetic generator</strong> (8,000 observations across 1,600 unique students).
          </p>
          <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl text-blue-900">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Privacy & Bias Guarantees
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Zero Personally Identifiable Information (PII) is stored or processed (strictly synthetic IDs: STU_xxxx).</li>
              <li>Protected attributes such as gender, race, caste, ethnicity, or socioeconomic status are strictly excluded from predictive features.</li>
              <li>Varied student archetypes simulate complex real-world situations: high ability with low attendance, diligent struggling students, and volatile life shocks.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-main flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          System Architecture & Tech Stack
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">ML Pipeline</div>
            <p className="text-secondary">
              Scikit-learn, XGBoost, Joblib serialization, Time-aware cross-validation, Probability calibration, Feature contribution explainability.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">FastAPI Backend</div>
            <p className="text-secondary">
              Python 3.11+, Pydantic v2 schemas, RESTful JSON endpoints, structured logging, CORS middleware, swagger docs.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-border">
            <div className="font-bold text-main mb-1">React Frontend</div>
            <p className="text-secondary">
              TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6, responsive desktop/mobile layout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
