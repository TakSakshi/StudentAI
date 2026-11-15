export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  model_loaded: boolean;
  model_name: string;
  model_version: string;
  decision_threshold: number;
}

export interface DashboardSummary {
  total_unique_students: number;
  total_prediction_records: number;
  at_risk_count: number;
  not_at_risk_count: number;
  at_risk_percentage: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_attendance: number;
  average_assignment_completion: number;
  average_previous_score: number;
  model_name: string;
  model_version: string;
  decision_threshold: number;
  human_review_disclaimer: string;
}

export interface StudentRecord {
  student_id: string;
  assessment_period: number;
  prediction_date: string;
  attendance_rate: number;
  assignments_completed: number;
  total_assignments: number;
  assignment_completion_rate: number;
  previous_score_1: number;
  previous_score_2: number;
  previous_score_3: number;
  average_previous_score: number;
  latest_score: number;
  score_trend: string;
  score_std: number;
  assessments_completed: number;
  next_assessment_score?: number;
  at_risk?: number;
  advisory_risk_band?: string;
  risk_probability?: number;
}

export interface StudentListResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  students: StudentRecord[];
}

export interface StudentDetailResponse {
  student_id: string;
  latest_record: StudentRecord;
  history: StudentRecord[];
  summary: {
    total_periods_tracked: number;
    historical_mean_score: number;
    historical_mean_attendance: number;
    score_volatility: number;
    min_recorded_score: number;
    max_recorded_score: number;
  };
  advisory_recommendation: {
    suggested_action: string;
    priority: string;
    focus_areas: string[];
  };
  human_review_disclaimer: string;
}

export interface InfluentialSignal {
  signal: string;
  impact: string;
  detail: string;
  importance: string;
}

export interface PredictionRequest {
  student_id?: string;
  attendance_rate: number;
  assignments_completed: number;
  total_assignments: number;
  previous_score_1: number;
  previous_score_2?: number;
  previous_score_3?: number;
  average_previous_score?: number;
  score_trend?: string;
}

export interface PredictionResponse {
  student_id: string;
  predicted_class: number;
  is_at_risk: boolean;
  risk_probability: number;
  risk_percentage: number;
  advisory_risk_band: string;
  risk_band_code: string;
  risk_band_color: string;
  risk_band_description: string;
  decision_threshold: number;
  model_name: string;
  model_version: string;
  prediction_timestamp: string;
  influential_signals: InfluentialSignal[];
  explanation_narrative: string;
  human_review_disclaimer: string;
}

export interface TrendPoint {
  period: number;
  mean_latest_score: number;
  mean_attendance: number;
  mean_completion: number;
  at_risk_rate: number;
  total_records: number;
}

export interface DistributionBin {
  range_label: string;
  min_val: number;
  max_val: number;
  total_count: number;
  at_risk_count: number;
  at_risk_rate: number;
}

export interface AttendanceAnalytics {
  average_attendance: number;
  distribution: DistributionBin[];
}

export interface AssignmentAnalytics {
  average_completion_rate: number;
  distribution: DistributionBin[];
}

export interface RiskBandCount {
  band: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RiskDistribution {
  total_students: number;
  bands: RiskBandCount[];
}

export interface ModelComparisonRow {
  model_name: string;
  split: string;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
  roc_auc: number | null;
  pr_auc: number | null;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface ModelPerformanceResponse {
  model_name: string;
  model_version: string;
  selected_threshold: number;
  validation_metrics: Record<string, any>;
  test_metrics: {
    precision: number;
    recall: number;
    f1: number;
    accuracy: number;
    roc_auc: number;
    pr_auc: number;
    brier_score: number;
    confusion_matrix: {
      tp: number;
      fp: number;
      fn: number;
      tn: number;
      raw: number[][];
    };
    false_positive_rate: number;
    false_negative_rate: number;
  };
  model_comparison: ModelComparisonRow[];
  global_feature_importance: { feature: string; importance: number; coefficient?: number }[];
  evaluation_split_info: {
    strategy: string;
    training_periods: number[];
    validation_period: number;
    test_period: number;
    train_samples: number;
    val_samples: number;
    test_samples: number;
    leakage_guarantee: string;
  };
  trade_off_analysis: {
    recall_importance: string;
    precision_balance: string;
    class_imbalance: string;
  };
}

export interface DataPreviewResponse {
  total_records: number;
  total_columns: number;
  total_students: number;
  page: number;
  page_size: number;
  total_pages: number;
  columns: {
    name: string;
    dtype: string;
    non_null_count: number;
    null_count: number;
  }[];
  records: Record<string, any>[];
}

