import React, { useState } from 'react';
import { LayoutDashboard, MessageSquare, ShieldCheck, Settings, Bell, Search, PlusCircle, ArrowLeft, LogOut } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ComplianceReport from './components/ComplianceReport';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import { AnalysisReport, ViewState } from './types';
import { analyzeDrawingImage } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewState>('landing');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consultContext, setConsultContext] = useState<string | undefined>(undefined);

  // Recent activity mock
  const recentFiles = [
    { name: 'Al-Malqa_Villa_Rev03.dwg', date: '2 hrs ago', status: 'Passed' },
    { name: 'KAFD_Office_Block_B.ifc', date: '5 hrs ago', status: 'Warnings' },
    { name: 'Riyadh_Metro_Station_4.rvt', date: '1 day ago', status: 'Failed' },
  ];

  const handleFileUpload = async (file: File, base64: string) => {
    setIsAnalyzing(true);
    // Move to report view immediately to show loading state nicely
    setView('report'); 
    
    try {
      const report = await analyzeDrawingImage(base64, file.name);
      setAnalysisReport(report);
    } catch (error) {
      console.error("Failed to analyze", error);
      // In production, handle error state specifically
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConsult = (context: string) => {
    setConsultContext(context);
    setIsChatOpen(true);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAnalysisReport(null);
    setView('landing');
  };

  const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  // If not authenticated, show public pages
  if (!isAuthenticated) {
    if (view === 'login') return <LoginPage onNavigate={setView} onLogin={handleLogin} />;
    if (view === 'signup') return <SignUpPage onNavigate={setView} onRegister={handleLogin} />;
    return <LandingPage onNavigate={setView} />;
  }

  // Authenticated Layout
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col h-full">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="font-bold text-lg leading-tight">CodeCheck<span className="text-blue-500">SA</span></h1>
              <p className="text-[10px] text-slate-400">Engineering Compliance AI</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={view === 'dashboard' || view === 'upload'} 
            onClick={() => setView('dashboard')}
          />
          <SidebarItem 
            icon={PlusCircle} 
            label="New Analysis" 
            active={false} 
            onClick={() => { setView('upload'); setAnalysisReport(null); }}
          />
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports</p>
          </div>
          {analysisReport && (
            <SidebarItem 
              icon={ShieldCheck} 
              label={analysisReport.fileName.length > 15 ? analysisReport.fileName.substring(0,15) + '...' : analysisReport.fileName}
              active={view === 'report'} 
              onClick={() => setView('report')}
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <SidebarItem 
            icon={MessageSquare} 
            label="Consultant Chat" 
            active={false} 
            onClick={() => setIsChatOpen(true)}
          />
          <SidebarItem icon={Settings} label="Settings" active={false} onClick={() => {}} />
          <SidebarItem icon={LogOut} label="Sign Out" active={false} onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
           <div className="flex items-center gap-4 w-96">
             {view !== 'dashboard' && (
               <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-slate-700">
                 <ArrowLeft className="w-5 h-5" />
               </button>
             )}
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search regulations (e.g. SBC 201 exit width)" 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
               />
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
               JD
             </div>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {view === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome back, Engineer</h2>
                  <p className="text-slate-500 mt-1">Here is what's happening with your compliance reviews.</p>
                </div>
                <button 
                  onClick={() => setView('upload')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-blue-200 transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" /> Start New Scan
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <p className="text-slate-500 text-sm font-medium">Pending Reviews</p>
                   <h3 className="text-3xl font-bold text-slate-900 mt-2">4</h3>
                   <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-400 w-[60%]"></div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <p className="text-slate-500 text-sm font-medium">Compliance Rate</p>
                   <h3 className="text-3xl font-bold text-slate-900 mt-2">87%</h3>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-[87%]"></div>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <p className="text-slate-500 text-sm font-medium">Critical Issues</p>
                   <h3 className="text-3xl font-bold text-slate-900 mt-2">12</h3>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-red-500 w-[30%]"></div>
                   </div>
                </div>
              </div>

              {/* Recent Files */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">Recent Scans</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentFiles.map((file, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.date}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${file.status === 'Passed' ? 'bg-green-100 text-green-700' : 
                          file.status === 'Failed' ? 'bg-red-100 text-red-700' : 
                          'bg-orange-100 text-orange-700'}`}>
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'upload' && (
             <div className="max-w-4xl mx-auto py-10 animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Upload Design Drawing</h2>
                  <p className="text-slate-500 mt-2">Upload your floor plan or engineering drawing to check for SBC compliance.</p>
                </div>
                <FileUpload onUpload={handleFileUpload} isAnalyzing={false} />
             </div>
          )}

          {view === 'report' && (
            <>
              {isAnalyzing ? (
                 <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
                    <div className="relative w-24 h-24 mb-6">
                       <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                       <ShieldCheck className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Analyzing Compliance Model...</h2>
                    <p className="text-slate-500 mt-2">Checking egress paths, room dimensions, and fire safety codes.</p>
                 </div>
              ) : (
                analysisReport && (
                  <ComplianceReport 
                    report={analysisReport} 
                    onConsult={handleConsult}
                  />
                )
              )}
            </>
          )}

        </div>

        {/* Floating Chat Button (if closed) */}
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-8 right-8 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg shadow-slate-900/30 transition-all hover:scale-105 z-40 group"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-slate-800 px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ask SBC Consultant
            </span>
          </button>
        )}

        {/* Chat Interface Drawer */}
        <ChatInterface 
          isOpen={isChatOpen} 
          onClose={() => { setIsChatOpen(false); setConsultContext(undefined); }} 
          initialMessage={consultContext}
        />

      </main>
    </div>
  );
};

export default App;