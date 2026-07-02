"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Phone, Mail, ShieldCheck, Camera, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useApp();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [inputVal, setInputVal] = useState('');
  const [name, setName] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal) return;

    if (method === 'phone' && !otpMode) {
      setOtpMode(true);
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(async () => {
      const success = await login(inputVal, name, isDriver);
      setLoading(false);
      if (success) {
        onClose();
        // Reset state
        setInputVal('');
        setName('');
        setOtpMode(false);
        setOtp('');
        setSelfieUploaded(false);
      }
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(async () => {
      const success = await login('google@ridelink.com', 'Google User', isDriver);
      setLoading(false);
      if (success) {
        onClose();
      }
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl border border-brand-border"
        >
          {/* Header */}
          <div className="p-6 pb-0 flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary-text">Welcome to RideLink</h3>
            <button 
              onClick={onClose} 
              className="p-1 rounded-full text-secondary-text hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!otpMode ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-2">
                    I want to travel as
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsDriver(false)}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all ${!isDriver ? 'bg-white text-primary-blue shadow-sm' : 'text-secondary-text hover:text-primary-text'}`}
                    >
                      Passenger
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDriver(true)}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all ${isDriver ? 'bg-white text-primary-blue shadow-sm' : 'text-secondary-text hover:text-primary-text'}`}
                    >
                      Driver
                    </button>
                  </div>
                </div>

                <div className="flex border-b border-brand-border pb-1 mb-2">
                  <button
                    type="button"
                    onClick={() => { setMethod('phone'); setInputVal(''); }}
                    className={`flex items-center gap-1.5 pb-2 text-sm font-semibold px-2 border-b-2 transition-all ${method === 'phone' ? 'border-primary-blue text-primary-blue' : 'border-transparent text-secondary-text'}`}
                  >
                    <Phone size={16} /> Phone Number
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMethod('email'); setInputVal(''); }}
                    className={`flex items-center gap-1.5 pb-2 text-sm font-semibold px-2 border-b-2 transition-all ${method === 'email' ? 'border-primary-blue text-primary-blue' : 'border-transparent text-secondary-text'}`}
                  >
                    <Mail size={16} /> Email
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-secondary-text mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-secondary-text mb-1">
                      {method === 'phone' ? 'Phone Number' : 'Email Address'}
                    </label>
                    <input
                      type={method === 'phone' ? 'tel' : 'email'}
                      placeholder={method === 'phone' ? '+91 98765 43210' : 'you@example.com'}
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold"
                      required
                    />
                  </div>

                  {/* Profile Photo upload simulation */}
                  <div>
                    <label className="block text-xs font-medium text-secondary-text mb-1">Profile Photo (Selfie)</label>
                    {selfieUploaded ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-brand-success">
                        <span className="flex items-center gap-1.5"><Check size={14} /> selfie_uploaded.jpg</span>
                        <button type="button" onClick={() => setSelfieUploaded(false)} className="text-secondary-text hover:text-slate-700">Remove</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelfieUploaded(true)}
                        className="w-full flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-slate-200 hover:border-primary-blue rounded-xl text-xs text-secondary-text font-bold hover:bg-slate-50 transition-all"
                      >
                        <Camera size={16} /> Upload selfie photo
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 text-sm font-bold text-white bg-primary-blue rounded-xl hover:bg-dark-blue hover:shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : method === 'phone' ? 'Send OTP' : 'Sign In'}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-secondary-text">
                    We sent a 6-digit OTP code to <strong className="text-primary-text">{inputVal}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1 text-center">Enter Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center tracking-widest text-lg font-bold px-4 py-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-sm font-bold text-white bg-primary-blue rounded-xl hover:bg-dark-blue transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Verify & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpMode(false)}
                  className="w-full py-2 text-xs font-semibold text-secondary-text hover:text-primary-text transition-colors"
                >
                  Go Back
                </button>
              </div>
            )}

            {!otpMode && (
              <>
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-border"></div>
                  </div>
                  <span className="relative px-3 text-xs text-secondary-text bg-white">or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-2.5 border border-brand-border rounded-xl text-sm font-semibold text-primary-text hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53 2.87-4.53z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </>
            )}

            <div className="flex items-start gap-2 pt-2 border-t border-brand-border text-[10px] text-secondary-text">
              <ShieldCheck size={16} className="text-brand-success shrink-0" />
              <span>By continuing, you agree to {"RideLink's"} Terms of Service and Privacy Policy. All rides are protected under verified driver safeguards.</span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
