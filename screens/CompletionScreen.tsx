
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RepairDocument } from '../types';
import { apiService } from '../services/apiService';

const CompletionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RepairDocument | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('current_repair_data');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!data) return null;

  const handleSave = async (isPublic: boolean) => {
    const updatedData = { ...data, isSuccessful: feedback, isPublic };

    if (isPublic) {
      setIsPosting(true);
      const moderation = await apiService.moderateImage(data.userPhotoUrl);
      if (!moderation.safe) {
        setModerationError(moderation.reason || "This image cannot be posted publicly.");
        setIsPosting(false);
        return;
      }
    }

    await apiService.saveRepair(updatedData);
    sessionStorage.removeItem('current_repair_data');
    sessionStorage.removeItem('current_repair_photo');
    sessionStorage.removeItem('current_repair_text');

    if (isPublic) {
      navigate('/feed');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 animate-in zoom-in duration-500 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 leading-tight">Repair Complete!</h2>
        <p className="text-slate-500 font-medium">You just extended the life of your {data.objectName}.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
        <h3 className="font-bold text-slate-800">Did the repair work?</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFeedback(true)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${feedback === true ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="text-xl">✅</span>
            <span className="text-xs font-bold">Yes!</span>
          </button>
          <button
            onClick={() => setFeedback(false)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${feedback === false ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="text-xl">❌</span>
            <span className="text-xs font-bold">No</span>
          </button>
          <button
            onClick={() => setFeedback(null)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${feedback === null ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="text-xl">🔄</span>
            <span className="text-xs font-bold">Ongoing</span>
          </button>
        </div>
      </div>

      {moderationError && (
        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-2xl border border-red-100">
          {moderationError}
        </div>
      )}

      <div className="space-y-3 pt-4">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Community Sharing</p>
        <button
          onClick={() => handleSave(true)}
          disabled={isPosting}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          {isPosting ? 'Moderating...' : 'Post Anonymously'}
        </button>
        <button
          onClick={() => handleSave(false)}
          className="w-full bg-white border border-slate-200 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          Don't Post, just save
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;
