
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme';

const CaptureScreen: React.FC = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1024 }, height: { ideal: 1024 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Please enable camera permissions to use the visual analyzer.");
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        
        setIsCapturing(false);
        setCapturedImage(base64);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setCapturedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const proceedToAnalysis = () => {
    if (capturedImage) {
      sessionStorage.setItem('current_repair_photo', capturedImage);
      sessionStorage.setItem('current_repair_text', description);
      navigate('/analysis');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-0 pt-0">
        <img 
          src="/logo.png" 
          alt="Fixit" 
          className="h-32 mx-auto object-contain"
        />
        <div className="space-y-2">
          <h2 className="text-3xl font-black" style={{ color: colors.secondary.steelBlue }}>What needs fixing?</h2>
          <p className="text-slate-600 font-medium">Take or upload a photo of your item to get started</p>
        </div>
      </div>

      {capturedImage ? (
        <div className="space-y-6">
          <div className="relative aspect-square bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src={`data:image/jpeg;base64,${capturedImage}`} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setCapturedImage(null)}
              className="absolute top-6 right-6 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={colors.primary.orange}>
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 px-1">What's wrong? (Optional)</label>
            <textarea 
              placeholder="E.g. 'It's leaking from the bottom' or 'Won't turn on'."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-5 transition-all outline-none resize-none h-32 font-medium text-slate-800 placeholder:text-slate-300 shadow-sm"
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary.orange;
                e.target.style.boxShadow = `0 0 0 4px ${colors.background.orangeLight15}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.neutral.slate200;
                e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
              }}
            />
          </div>

          <button 
            onClick={proceedToAnalysis}
            className="w-full text-white py-5 px-6 rounded-2xl font-black text-xl shadow-xl active:scale-[0.98] transition-all"
            style={{ backgroundColor: colors.primary.orange }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary.orangeHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary.orange}
          >
            Analyze & Fix
          </button>
        </div>
      ) : !isCapturing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={startCamera}
              className="aspect-square text-white rounded-3xl shadow-xl flex flex-col items-center justify-center cursor-pointer transition-all group active:scale-95"
              style={{ backgroundColor: colors.primary.orange }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary.orangeHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary.orange}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-black text-sm">Take Photo</span>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center cursor-pointer transition-all group active:scale-95"
              style={{ borderWidth: '2px', borderColor: colors.primary.orange }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary.orangeHover;
                e.currentTarget.style.backgroundColor = colors.background.offWhite;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.primary.orange;
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: colors.primary.orange }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="font-black text-sm" style={{ color: colors.primary.orange }}>Upload Photo</span>
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative aspect-square bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <button 
              onClick={() => setIsCapturing(false)}
              className="absolute top-6 right-6 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={colors.primary.orange}>
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button 
            onClick={capturePhoto}
            className="w-full text-white py-5 px-6 rounded-2xl font-black text-xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
            style={{ backgroundColor: colors.primary.orange }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary.orangeHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary.orange}
          >
            <div className="w-5 h-5 rounded-full bg-white ring-4 ring-white/30 group-hover:scale-125 transition-transform"></div>
            Capture
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CaptureScreen;
