
import React, { useState } from 'react';
import { RepairDocument } from '../types';
import { colors } from '../theme';

interface Props {
  repair: RepairDocument;
}

const RepairCard: React.FC<Props> = ({ repair }) => {
  const [showFull, setShowFull] = useState(false);

  if (showFull) {
    return (
      <div className="fixed inset-0 z-[60] bg-white overflow-auto p-6 flex flex-col items-center">
        <div className="max-w-md w-full space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowFull(false)}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="font-black text-slate-800 uppercase tracking-widest text-xs">Community Guide</span>
            <div className="w-10" />
          </div>

          <div className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-lg">
              <img src={`data:image/jpeg;base64,${repair.userPhotoUrl}`} className="w-full h-full object-cover" alt={repair.objectName} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{repair.objectName}</h3>
              <p className="text-slate-500 font-medium">{repair.issueType}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800">Visual Guide</h4>
            <div className="space-y-8">
              {/* Fix: Use 'steps' instead of 'generatedSteps' which does not exist on RepairDocument */}
              {repair.steps.map((step, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: colors.primary.orange }}>
                      {idx + 1}
                    </span>
                    <p className="font-bold text-slate-700 leading-tight">{step.instruction}</p>
                  </div>
                  {step.generatedImageUrl && (
                    <img 
                      src={step.generatedImageUrl} 
                      alt={`Step ${idx + 1}`} 
                      className="w-full aspect-video object-cover rounded-2xl shadow-md border border-slate-100"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setShowFull(false)}
            className="w-full bg-slate-100 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors mt-8 mb-12"
          >
            Close Guide
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setShowFull(true)}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-100 group"
    >
      <div className="relative aspect-video">
        <img 
          src={`data:image/jpeg;base64,${repair.userPhotoUrl}`} 
          alt={repair.objectName} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          {repair.isSuccessful === true && (
            <span className="bg-green-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">Worked!</span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-sm border border-slate-200">
            {repair.category}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-1">
        <h4 className="font-black text-slate-900 truncate">{repair.objectName}</h4>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{repair.issueType}</p>
      </div>
    </div>
  );
};

export default RepairCard;