import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, isSupabaseConfigured } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName, phone);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg">
                {isSignUp ? 'Join CiviQ' : 'Welcome to CiviQ'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSignUp ? 'Create an account to report & investigate civic hazards' : 'Sign in to file reports and upvote issues'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Supabase status badge */}
        <div className="px-6 pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 font-medium">
            <ShieldCheck size={14} className={isSupabaseConfigured ? 'text-emerald-500' : 'text-blue-500'} />
            <span>
              {isSupabaseConfigured 
                ? 'Secured with live Supabase Authentication' 
                : 'Demo Session active (connect Supabase keys for cloud sync)'}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shriraj Deshmukh"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gurugram Mobile (+91)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <span>{loading ? 'Please wait...' : (isSignUp ? 'Create Citizen Account' : 'Sign In')}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Footer switch */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => setIsSignUp(false)} 
                className="text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button 
                type="button" 
                onClick={() => setIsSignUp(true)} 
                className="text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Register as Citizen
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
