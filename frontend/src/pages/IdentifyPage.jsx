import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader, Camera, ScanLine, X, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <--- UPDATED IMPORT
import ResultCard from '../components/ResultCard';
import { Link, useNavigate } from 'react-router-dom';

const IdentifyPage = () => {
  const { user } = useAuth(); // <--- UPDATED HOOK
  const navigate = useNavigate();
  
  // State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Smart Loading Logic
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  const loadingMessages = [
    "Analyzing object geometry...",
    "Detecting material texture...",
    "Comparing with recycling database...",
    "Calculating carbon footprint...",
    "Finalizing results..."
  ];

  // --- File Handling (Drag & Drop + Click) ---
  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    } else {
      toast.error("Please upload a valid image file.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = () => setIsDragging(false);
  
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);
  
  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  // --- API Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an image first');
    if (!user) return toast.error('You must be logged in to identify waste');

    setLoading(true);
    setResult(null);

    // Cycle through loading messages
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
        setLoadingText(loadingMessages[msgIndex % loadingMessages.length]);
        msgIndex++;
    }, 800);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // NOTE: axios usually handles Content-Type automatically for FormData
      const { data } = await axios.post('/api/identify', formData);
      
      // Fake delay (optional) to let the cool animation finish
      setTimeout(() => {
          setResult(data);
          toast.success('Analysis Complete!');
          setLoading(false);
          clearInterval(msgInterval);
      }, 1500);

    } catch (error) {
      console.error(error);
      
      // Handle Rate Limits gracefully
      if (error.response && error.response.status === 429) {
          toast.warning("⏳ AI is busy! Please wait 1 minute before scanning again.");
      } else {
          toast.error(error.response?.data?.message || 'Identification failed');
      }

      setLoading(false);
      clearInterval(msgInterval);
    }
  };

  // --- SHARE LOGIC ---
  const handleShare = () => {
    if (!result) return;
    navigate('/community', { 
      state: { 
        importedFile: file, 
        importedCaption: `I just recycled a ${result.label}! It has an estimated value of ${result.estimatedValue}. #GreenSort #Recycling` 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Nav Back */}
        <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-green-600 mb-6 transition">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </button>

        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm">
            <ScanLine className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold font-heading text-gray-800 mb-2">AI Waste Scanner</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Upload a photo. Our Gemini-powered AI will analyze the material and tell you exactly which bin to use.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/50 backdrop-blur-xl relative">
          
          {/* Main Content Area */}
          <div className="p-8">
            {!user ? (
               <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Unlock AI Powers</h3>
                <p className="mb-6 text-gray-500">Login to start scanning and saving the planet.</p>
                <Link to="/login" className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-200">
                    Login / Register
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* --- INNOVATIVE UPLOAD / PREVIEW AREA --- */}
                <div className="relative group">
                    {!preview ? (
                        // 1. Empty State (Drop Zone)
                        <div 
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`relative h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden
                                ${isDragging 
                                    ? 'border-green-500 bg-green-50 scale-[1.02]' 
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-green-400'
                                }
                            `}
                        >
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            
                            <div className={`p-4 bg-white rounded-full shadow-md mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                                <Camera className="w-10 h-10 text-green-600" />
                            </div>
                            <p className="text-lg font-bold text-gray-700">Drag & Drop or Click to Scan</p>
                            <p className="text-sm text-gray-400 mt-2">Supports JPG, PNG</p>
                        </div>
                    ) : (
                        // 2. Image Loaded State
                        <div className="relative h-96 bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
                            <img src={preview} alt="Waste Preview" className={`max-h-full max-w-full object-contain transition duration-500 ${loading ? 'opacity-60 blur-sm scale-105' : ''}`} />
                            
                            {/* Clear Button (Only show when NOT loading) */}
                            {!loading && !result && (
                                <button 
                                    type="button" 
                                    onClick={clearSelection}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            {/* --- THE LASER SCAN ANIMATION --- */}
                            {loading && (
                                <>
                                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_50px_20px_rgba(74,222,128,0.5)] animate-scan-laser z-10"></div>
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-green-500/30">
                                            <p className="text-green-400 font-mono font-bold animate-pulse flex items-center gap-3">
                                                <Loader className="w-4 h-4 animate-spin" />
                                                {loadingText}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Grid Overlay for "Tech" feel */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* --- Analyze Button --- */}
                {!loading && !result && preview && (
                     <button 
                        type="submit" 
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                     >
                        <ScanLine className="w-5 h-5" /> Analyze Image
                     </button>
                )}
              </form>
            )}

            {/* --- RESULTS SECTION --- */}
            {result && (
              <div className="mt-8 animate-slide-up">
                 {/* Success Badge */}
                 <div className="flex items-center justify-center gap-2 text-green-600 font-bold mb-6">
                    <Sparkles className="w-5 h-5" /> Analysis Complete
                 </div>

                {/* 🟢 CLEANER UI: 
                    We pass onReset and onShare to the card.
                    We DO NOT duplicate the buttons below the card.
                */}
                <ResultCard 
                    result={result} 
                    onReset={clearSelection} 
                    onShare={handleShare}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for Scan Animation */}
      <style>{`
        @keyframes scan-laser {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-laser {
          animation: scan-laser 2s ease-in-out infinite;
        }
        @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default IdentifyPage;