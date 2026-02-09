
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { RepairDocument } from '../types';
import { colors } from '../theme';

const AnalysisScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState('Initializing AI Diagnostic...');
  const [progress, setProgress] = useState(0);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const performAnalysis = async () => {
      const photo = sessionStorage.getItem('current_repair_photo');
      const text = sessionStorage.getItem('current_repair_text') || '';

      if (!photo) {
        navigate('/');
        return;
      }

      try {
        setLoadingStep('Analyzing Object & Issue...');
        setProgress(15);
        // This is the only "Hard Requirement" call
        const analysis = await apiService.analyzeImage(photo, text);

        setLoadingStep('Searching Grounded Support Data...');
        setProgress(35);
        let manualUrl = null;
        try {
          manualUrl = await apiService.findManual(analysis.objectName);
        } catch (e) { console.warn("Manual search failed non-fatally", e); }

        setLoadingStep('Visualizing Your Setup...');
        setProgress(55);
        let idealViewUrl = null;
        try {
          idealViewUrl = await apiService.generateStepImage(
            analysis.objectName,
            "Overview for setup",
            analysis.idealViewInstruction,
            photo
          );
        } catch (e) { console.warn("Ideal view generation failed non-fatally", e); }

        setLoadingStep('Generating Step-by-Step Visuals...');
        setProgress(75);

        // Generate images one by one or in parallel but catch individual failures
        const stepImages = await Promise.all(
          analysis.steps.map(async (s) => {
            try {
              return await apiService.generateStepImage(
                analysis.objectName,
                s.instruction,
                analysis.idealViewInstruction,
                photo
              );
            } catch (e) {
              console.warn(`Step ${s.stepNumber} image generation failed`, e);
              return null;
            }
          })
        );

        const updatedSteps = analysis.steps.map((s, idx) => ({
          ...s,
          generatedImageUrl: stepImages[idx] || undefined
        }));

        const finalData: RepairDocument = {
          ...analysis,
          steps: updatedSteps,
          manualUrl,
          idealViewImageUrl: idealViewUrl || undefined,
          userPhotoUrl: photo,
          timestamp: Date.now(),
          repairId: Math.random().toString(36).substring(7),
          isPublic: false,
          isSuccessful: null
        };

        setProgress(100);

        await apiService.saveRepair(finalData);

        sessionStorage.setItem('current_repair_id', finalData.repairId);
        sessionStorage.removeItem('current_repair_photo'); // Clear the large photo

        setTimeout(() => navigate('/setup'), 500);
      } catch (err) {
        console.error("Fatal analysis error:", err);
        alert("The AI couldn't interpret your photo. Please try again with better lighting or a different angle.");
        navigate('/');
      }
    };

    performAnalysis();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-10 max-w-md mx-auto">
      <div className="relative">
        <div className="w-32 h-32 border-[6px] border-slate-100 rounded-full animate-spin" style={{ borderTopColor: colors.primary.orange }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.background.orangeLight15 }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: colors.primary.orange }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-black tracking-tight transition-all" style={{ color: colors.secondary.steelBlue }}>{loadingStep}</h3>
        <p className="text-slate-500 font-medium px-4">Creating your customized repair blueprint...</p>
      </div>

      <div className="w-full space-y-2">
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, backgroundColor: colors.primary.orange, boxShadow: `0 0 10px ${colors.background.orangeLight20}` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
          <span>Processing</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisScreen;
