import React from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Lock,
  Layers,
  CheckCircle2,
  GitBranch,
  Info,
  Scale
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-sans block mb-1">
          Governance, Methodology & Ethics
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-main">
          About StudentInsight AI
        </h1>
        <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
          Student Performance & Academic Support Intelligence &bull; AI & Machine Learning Assessment for ALGIONS AI LABS PRIVATE LIMITED.
        </p>
      </div>

      {/* Prominent Responsible Use Statement Banner */}
      <div className="bg-amber-light border-2 border-amber/60 rounded-2xl p-6 sm:p-8 shadow-warm-sm">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-amber-text shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-editorial text-xl font-bold text-main">
              Mandatory Responsible Use Restriction
            </h3>
            <p className="text-xs sm:text-sm text-amber-text font-medium leading-relaxed">
              StudentInsight AI is strictly designed as an <strong>advisory decision-support system</strong>. Predictions must be reviewed by educators and must never be used for automated punishment, grading, admission or restriction of educational opportunities.
            </p>
            <ul className="text-xs text-amber-text/90 list-disc list-inside space-y-1 pt-1">
              <li>Advisory categories indicate opportunity for proactive support, not proof of impending failure.</li>
              <li>No automated sanction or grade alteration may ever be executed by this system.</li>
              <li>A predicted advisory flag must never be treated as a permanent judgment of student aptitude.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Problem Formulation & Machine Learning Specifications */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-warm-sm space-y-4">
        <h3 className="font-editorial text-xl font-bold text-main flex items-center gap-2">
          <Layers className="w-5 h-5 text-forest" />
          Problem Formulation & ML Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Prediction Unit</div>
            <p className="text-secondary leading-relaxed">
              One student record at one specific prediction cutoff immediately prior to an upcoming examination. Evaluates longitudinal academic history chronologically.
            </p>
          </div>

          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Target Definition</div>
            <p className="text-secondary leading-relaxed">
              Binary label <code className="bg-white px-1.5 py-0.5 rounded text-main border border-border font-mono">at_risk = 1</code> when the upcoming assessment score is below 40.0%, and <code className="bg-white px-1.5 py-0.5 rounded text-main border border-border font-mono">0</code> otherwise.
            </p>
          </div>

          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Prediction Horizon & Cutoff</div>
            <p className="text-secondary leading-relaxed">
              Predicts immediate next exam outcomes. Information accumulated strictly prior to cutoff is used. Target outcomes are quarantined from input features.
            </p>
          </div>

          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">Evaluation Strategy</div>
            <p className="text-secondary leading-relaxed">
              Time-aware chronological split: Periods 1–3 for model training, Period 4 for threshold tuning & validation, and Period 5 for single held-out test evaluation.
            </p>
          </div>
        </div>
      </div>

      {/* Data Privacy & Bias Principles */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-warm-sm space-y-4">
        <h3 className="font-editorial text-xl font-bold text-main flex items-center gap-2">
          <Lock className="w-5 h-5 text-forest" />
          Data Privacy & Bias Mitigation
        </h3>

        <div className="text-xs text-secondary leading-relaxed space-y-3">
          <p>
            In compliance with student privacy regulations (FERPA, GDPR, DPDP) and to enable reproducible empirical evaluation, this assessment project implements a <strong>reproducible probabilistic synthetic generator</strong> (8,000 longitudinal records across 1,600 students).
          </p>

          <div className="p-4 bg-sage-light/60 border border-sage rounded-xl text-forest space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              Guarantees & Compliance Checks
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Zero Personally Identifiable Information (PII) is created or stored (anonymous STU_xxxx IDs only).</li>
              <li>Protected attributes such as gender, race, ethnicity, religion, or caste are strictly excluded from predictive features.</li>
              <li>Varied student archetypes simulate complex real-world situations: high ability with low attendance, diligent struggling students, and volatile life shocks.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Architecture & Tech Stack */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-warm-sm space-y-4">
        <h3 className="font-editorial text-xl font-bold text-main flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-forest" />
          Technical Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">ML Pipeline</div>
            <p className="text-secondary leading-relaxed">
              Scikit-learn, XGBoost, Joblib serialization, Time-aware evaluation, Probability calibration, Feature contribution explainability.
            </p>
          </div>

          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">FastAPI Backend</div>
            <p className="text-secondary leading-relaxed">
              Python 3.11+, Pydantic v2 schemas, RESTful JSON endpoints, structured logging, CORS middleware, swagger docs.
            </p>
          </div>

          <div className="p-4 bg-ivory rounded-xl border border-border">
            <div className="font-bold text-main mb-1">React Frontend</div>
            <p className="text-secondary leading-relaxed">
              TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6, responsive warm ivory & forest green UI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
