import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { StudentDirectory } from './pages/StudentDirectory';
import { StudentRisk } from './pages/StudentRisk';
import { StudentDetails } from './pages/StudentDetails';
import { PerformanceAnalytics } from './pages/PerformanceAnalytics';
import { ModelPerformance } from './pages/ModelPerformance';
import { Prediction } from './pages/Prediction';
import { DataExplorer } from './pages/DataExplorer';
import { About } from './pages/About';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="students" element={<StudentDirectory />} />
          <Route path="risk-analysis" element={<StudentRisk />} />
          <Route path="students/:studentId" element={<StudentDetails />} />
          <Route path="analytics" element={<PerformanceAnalytics />} />
          <Route path="predict" element={<Prediction />} />
          <Route path="model" element={<ModelPerformance />} />
          <Route path="data" element={<DataExplorer />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
