import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { ViewState } from '../types';

interface LoginPageProps {
  onNavigate: (view: ViewState) => void;
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    // Mock authentication delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Visual */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-blue-600/20 z-10"></div>
        <img 
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2531&auto=format&fit=crop" 
            alt="Modern Architecture" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-20 text-white max-w-md">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-10 h-10 text-blue-400" />
                <h1 className="text-3xl font-bold">CodeCheck<span className="text-blue-400">SA</span></h1>
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">Validate your designs with precision.</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
                Join thousands of engineers and architects in Saudi Arabia using AI to ensure code compliance and accelerate project approvals.
            </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative">
        <button 
            onClick={() => onNavigate('landing')} 
            className="absolute top-8 left-8 text-slate-400 hover:text-slate-700 flex items-center gap-2 text-sm transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="max-w-sm w-full mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 mb-8">Please enter your details to sign in.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="engineer@consulting.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">Forgot Password?</a>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <button onClick={() => onNavigate('signup')} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                    Sign up for free
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;