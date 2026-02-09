
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RepairDocument } from '../types';
import { colors } from '../theme';
import { apiService } from '../services/apiService';

/**
 * Component to display the repair setup phase, including safety warnings
 * and ideal object positioning.
 */
const SetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RepairDocument | null>(null);

  useEffect(() => {
    const fetchRepair = async () => {
      const repairId = sessionStorage.getItem('current_repair_id');
      if (!repairId) {
        navigate('/');
        return;
      }

      const repair = await apiService.getRepair(repairId);
      if (repair) {
        setData(repair);
      } else {
        navigate('/');
      }
    };

    fetchRepair();
  }, [navigate]);

  if (!data) return null;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.primary.orange }}>{data.category}</span>
        <h2 className="text-2xl font-black leading-tight" style={{ color: colors.secondary.steelBlue }}>{data.objectName}</h2>
        <p className="text-slate-500 font-medium">Issue: {data.issueType}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Defect Analysis</h3>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-500">Preparation</span>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 min-h-[200px] flex items-center justify-center">
          <img
            src={data.idealViewImageUrl || data.userPhotoUrl}
            alt="The Issue"
            className="w-full aspect-square object-cover"
          />
        </div>
      </div>

      {data.safetyWarning && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex gap-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-1">
            <p className="font-bold text-red-900 text-sm">Safety Warning</p>
            <p className="text-red-700 text-sm leading-snug">{data.safetyWarning}</p>
          </div>
        </div>
      )}

      {data.manualUrl && (
        <a
          href={data.manualUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Reference Guide from the Web</p>
              <p className="text-xs text-slate-500">Open to see what the internet says</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/steps')}
          className="w-full text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
          style={{ backgroundColor: colors.primary.orange }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary.orangeHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary.orange}
        >
          Start Repair Guide
        </button>
      </div>
    </div >
  );
};

export default SetupScreen;
