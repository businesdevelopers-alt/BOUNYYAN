import React from 'react';
import { ShieldCheck, CheckCircle2, Zap, FileText, ArrowRight, Building2 } from 'lucide-react';
import { ViewState } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl text-slate-900">CodeCheck<span className="text-blue-600">SA</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('login')}
                className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigate('signup')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                Updated for SBC 201 & 801 (2024)
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Automated Saudi Building Code <span className="text-blue-600">Compliance</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Ensure your engineering drawings meet Saudi Technical Regulations instantly. Reduce rejection rates and speed up MOMRAH approvals with AI-powered validation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onNavigate('signup')}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button 
                   onClick={() => onNavigate('login')}
                   className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  View Demo
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Civil Defense Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>AutoCAD & BIM Support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-10 blur-3xl"></div>
               <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                           <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900">Villa_AlMalqa_Final.dwg</h3>
                           <p className="text-xs text-slate-500">Scanning for SBC 201 Compliance...</p>
                        </div>
                     </div>
                     <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">Processing</span>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                           <h4 className="font-semibold text-green-800 text-sm">Egress Width Compliance</h4>
                           <p className="text-xs text-green-700 mt-1">Corridors meet the minimum 1.2m width requirement per SBC 201.</p>
                        </div>
                     </div>
                     <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                        <Zap className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                           <h4 className="font-semibold text-red-800 text-sm">Missing Fire Extinguisher</h4>
                           <p className="text-xs text-red-700 mt-1">Zone B (Kitchen) requires a Class K extinguisher per SBC 801.</p>
                        </div>
                     </div>
                     <div className="bg-slate-100 h-24 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                        <span className="text-xs text-slate-400 font-mono">Analyzing Sheet A-104...</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Engineering Consultants Trust Us</h2>
               <p className="text-slate-500">We translate complex Saudi Building Codes into automated checkpoints, saving you hours of manual review time.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                  {
                     icon: ShieldCheck,
                     title: "SBC Compliance Engine",
                     desc: "Automatically checks designs against the latest Saudi Building Code (201, 801, 501, 601) and Civil Defense regulations."
                  },
                  {
                     icon: Building2,
                     title: "BIM & CAD Integration",
                     desc: "Works seamlessly with your existing workflow. Support for DWG, DXF, Revit (RVT), and IFC formats."
                  },
                  {
                     icon: Zap,
                     title: "Instant Feedback",
                     desc: "Get actionable reports with specific code references and fix recommendations in seconds, not days."
                  }
               ].map((feature, i) => (
                  <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                     <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-400 text-sm">© 2024 SaudiCode Validator AI. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-6">
               <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy Policy</a>
               <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms of Service</a>
               <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">SBC Documentation</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;