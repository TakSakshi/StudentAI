import axios from 'axios';
import {
  HealthStatus,
  DashboardSummary,
  StudentListResponse,
  StudentDetailResponse,
  PredictionRequest,
  PredictionResponse,
  TrendPoint,
  AttendanceAnalytics,
  AssignmentAnalytics,
  RiskDistribution,
  ModelPerformanceResponse,
  DataPreviewResponse
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getHealth = async (): Promise<HealthStatus> => {
  const res = await api.get<HealthStatus>('/health');
  return res.data;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get<DashboardSummary>('/dashboard/summary');
  return res.data;
};

export const getStudents = async (params: {
  search?: string;
  risk_band?: string;
  period?: number;
  sort_by?: string;
  ascending?: boolean;
  page?: number;
  page_size?: number;
}): Promise<StudentListResponse> => {
  const res = await api.get<StudentListResponse>('/students', { params });
  return res.data;
};

export const getStudentDetail = async (studentId: string): Promise<StudentDetailResponse> => {
  const res = await api.get<StudentDetailResponse>(`/students/${studentId}`);
  return res.data;
};

export const predictRisk = async (payload: PredictionRequest): Promise<PredictionResponse> => {
  const res = await api.post<PredictionResponse>('/predict', payload);
  return res.data;
};

export const getPerformanceTrends = async (): Promise<{ trends: TrendPoint[] }> => {
  const res = await api.get<{ trends: TrendPoint[] }>('/analytics/performance-trends');
  return res.data;
};

export const getAttendanceAnalytics = async (): Promise<AttendanceAnalytics> => {
  const res = await api.get<AttendanceAnalytics>('/analytics/attendance');
  return res.data;
};

export const getAssignmentAnalytics = async (): Promise<AssignmentAnalytics> => {
  const res = await api.get<AssignmentAnalytics>('/analytics/assignment-completion');
  return res.data;
};

export const getRiskDistribution = async (): Promise<RiskDistribution> => {
  const res = await api.get<RiskDistribution>('/analytics/risk-distribution');
  return res.data;
};

export const getModelMetrics = async (): Promise<ModelPerformanceResponse> => {
  const res = await api.get<ModelPerformanceResponse>('/model/metrics');
  return res.data;
};

export const getDataPreview = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<DataPreviewResponse> => {
  const res = await api.get<DataPreviewResponse>('/data/preview', { params });
  return res.data;
};

export default api;
