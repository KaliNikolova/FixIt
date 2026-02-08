
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RepairDocument } from '../types';
import { apiService } from '../services/apiService';

const StepScreen: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RepairDocument | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [isAnalyzingStuck, setIsAnalyzingStuck] = useState(false);
  const [stuckAdvice, setStuckAdvice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('current_repair_data');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!data) return null;

  const steps = data.steps;
  const currentStep = steps[currentStepIdx];
  const isLastStep = currentStepIdx === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigate('/completion');
    } else {
      setCurrentStepIdx(prev => prev + 1);
      setIsStuck(false);
      setStuckAdvice(null);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setIsStuck(false);
      setStuckAdvice(null);
    } else {
      navigate('/setup');
    }
  };

  const startStuckFlow = async () => {
    setIsStuck(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Troubleshooting requires camera access.");
      setIsStuck(false);
    }
  };

  const analyzeStuck = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsAnalyzingStuck(true);
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
          const advice = await apiService.troubleshoot(
            base64,
            data.objectName,
            currentStepIdx,
            currentStep.instruction
          );
          setStuckAdvice(advice);

          const stream = videoRef.current.srcObject as MediaStream;
          stream?.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.warn("Analysis failed", err);
          setStuckAdvice("I couldn't analyze the photo right now. Try looking for physical damage or loose parts.");
        } finally {
          setIsAnalyzingStuck(false);
        }
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col min-h-full space-y-6">
      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 px-1 uppercase tracking-[0.2em]">
        <span>Step {currentStepIdx + 1} / {steps.length}</span>
        <div className="flex gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${idx === currentStepIdx ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 relative group min-h-[300px] flex items-center justify-center">
        {!isStuck ? (
          currentStep.generatedImageUrl ? (
            <img
              src={currentStep.generatedImageUrl}
              alt={`Step ${currentStepIdx + 1}`}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="p-10 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Step Visualization Unavailable<br /><span className="font-normal normal-case opacity-60">Follow instructions below</span>
              </p>
            </div>
          )
        ) : (
          <div className="aspect-square bg-black relative w-full h-full">
            {!stuckAdvice ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <button
                    onClick={analyzeStuck}
                    disabled={isAnalyzingStuck}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                  >
                    {isAnalyzingStuck ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isAnalyzingStuck ? 'Analyzing...' : 'Show AI what you see'}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 h-full flex flex-col justify-center text-white bg-slate-900 overflow-auto animate-in fade-in duration-300">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-xl tracking-tight">Expert Advice</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mt-2 font-medium">{stuckAdvice}</p>
                  </div>
                  <button
                    onClick={() => { setIsStuck(false); setStuckAdvice(null); }}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Back to instructions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 min-h-[140px] flex items-center shadow-sm">
          <p className="text-xl font-bold text-slate-800 leading-tight">
            {currentStep.instruction}
          </p>
        </div>

        {!isStuck && (
          <button
            onClick={startStuckFlow}
            className="flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-full hover:bg-blue-50"
          >
            <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center">?</div>
            I need troubleshooting help
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4">
        <button
          onClick={handleBack}
          className="bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
        >
          {isLastStep ? 'Finish' : 'Got It'}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default StepScreen;
