
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { RepairDocument, RepairAnalysis } from './types';
import CaptureScreen from './screens/CaptureScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import SetupScreen from './screens/SetupScreen';
import StepScreen from './screens/StepScreen';
import CompletionScreen from './screens/CompletionScreen';
import FeedScreen from './screens/FeedScreen';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<CaptureScreen />} />
            <Route path="/analysis" element={<AnalysisScreen />} />
            <Route path="/setup" element={<SetupScreen />} />
            <Route path="/steps" element={<StepScreen />} />
            <Route path="/completion" element={<CompletionScreen />} />
            <Route path="/feed" element={<FeedScreen />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
