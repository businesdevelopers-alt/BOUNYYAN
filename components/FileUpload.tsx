import React, { useCallback, useState } from 'react';
import { Upload, FileType, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File, base64: string) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    // In a real app, we'd handle .dwg/.rvt parsing here or on backend.
    // For this demo, we accept images that represent the drawings.
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      setError("For this demo version, please upload an Image (PNG/JPG) of your drawing plan.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // remove data url prefix for API
      const base64Data = base64String.split(',')[1];
      onUpload(file, base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out
        ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}
        ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {isAnalyzing ? (
            <div className="animate-pulse flex flex-col items-center">
               <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-lg font-medium text-slate-700">Analyzing Drawing Structure...</p>
               <p className="text-sm text-slate-500 mt-2">Checking SBC 201 & 801 Compliance</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <p className="mb-2 text-xl font-semibold text-slate-700">
                <span className="text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-slate-500 mb-6">
                Supports DWG, DXF, IFC, RVT (Simulated via Image upload for Demo)
              </p>
              <div className="flex gap-4 text-xs text-slate-400">
                <span className="flex items-center"><FileType className="w-3 h-3 mr-1"/> AutoCAD</span>
                <span className="flex items-center"><FileType className="w-3 h-3 mr-1"/> Revit</span>
                <span className="flex items-center"><FileType className="w-3 h-3 mr-1"/> PDF Plans</span>
              </div>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleChange}
          disabled={isAnalyzing}
          accept="image/*"
        />
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!isAnalyzing && !error && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3">
             <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600"/></div>
             <div>
               <h4 className="font-semibold text-sm text-slate-900">Auto-Detection</h4>
               <p className="text-xs text-slate-500 mt-1">Identifies rooms, exits, and corridors automatically.</p>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3">
             <div className="bg-purple-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-purple-600"/></div>
             <div>
               <h4 className="font-semibold text-sm text-slate-900">SBC Compliance</h4>
               <p className="text-xs text-slate-500 mt-1">Checks against 50+ Saudi Building Code rules.</p>
             </div>
          </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3">
             <div className="bg-orange-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-orange-600"/></div>
             <div>
               <h4 className="font-semibold text-sm text-slate-900">Clash Detection</h4>
               <p className="text-xs text-slate-500 mt-1">Highlights structural vs. architectural conflicts.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;