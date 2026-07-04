"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { X, Phone, Mail, ShieldCheck, Camera, Check } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup } = useApp();
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [method, setMethod] = useState("phone"); // phone | email
  const [inputVal, setInputVal] = useState(""); // login email or phone
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [isDriver, setIsDriver] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal) return;

    if (method === "phone" && !otpMode) {
      setOtpMode(true);
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      const success = await login(inputVal);
      setLoading(false);
      if (success) {
        onClose();
        resetForm();
      }
    }, 1200);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPhone) return;

    setLoading(true);
    setTimeout(async () => {
      const photoUrl =
        !isDriver && selfieUploaded
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"
          : "";
      const success = await signup(signupName, signupEmail, signupPhone, isDriver, photoUrl);
      setLoading(false);
      if (success) {
        onClose();
        resetForm();
      }
    }, 1200);
  };

  const resetForm = () => {
    setInputVal("");
    setOtpMode(false);
    setOtp("");
    setSignupName("");
    setSignupEmail("");
    setSignupPhone("");
    setSelfieUploaded(false);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(async () => {
      const success = await login("google@ridelink.com");
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
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-secondary-text hover:bg-slate-100 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Tab Selection */}
          <div className="flex border-b border-brand-border bg-slate-50">
            <button
              onClick={() => {
                setAuthMode("login");
                resetForm();
              }}
              className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all ${
                authMode === "login"
                  ? "border-primary-blue text-primary-blue bg-white"
                  : "border-transparent text-secondary-text hover:text-primary-text"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                resetForm();
              }}
              className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all ${
                authMode === "signup"
                  ? "border-primary-blue text-primary-blue bg-white"
                  : "border-transparent text-secondary-text hover:text-primary-text"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-6">
            {authMode === "login" ? (
              /* LOGIN FLOW */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center pb-2">
                  <h3 className="text-xl font-bold text-primary-text">Welcome Back</h3>
                  <p className="text-xs text-secondary-text">Enter your credentials to access your account</p>
                </div>

                {!otpMode ? (
                  <>
                    <div className="flex border-b border-brand-border pb-1 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMethod("phone");
                          setInputVal("");
                        }}
                        className={`flex items-center gap-1.5 pb-2 text-sm font-semibold px-2 border-b-2 transition-all ${
                          method === "phone" ? "border-primary-blue text-primary-blue" : "border-transparent text-secondary-text"
                        }`}
                      >
                        <Phone size={16} /> Phone
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMethod("email");
                          setInputVal("");
                        }}
                        className={`flex items-center gap-1.5 pb-2 text-sm font-semibold px-2 border-b-2 transition-all ${
                          method === "email" ? "border-primary-blue text-primary-blue" : "border-transparent text-secondary-text"
                        }`}
                      >
                        <Mail size={16} /> Email
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-secondary-text mb-1">
                        {method === "phone" ? "Registered Phone Number" : "Registered Email Address"}
                      </label>
                      <input
                        type={method === "phone" ? "tel" : "email"}
                        placeholder={method === "phone" ? "+91 98765 43210" : "you@example.com"}
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold font-sans"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 mt-2 text-sm font-bold text-white bg-primary-blue rounded-xl hover:bg-dark-blue hover:shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : method === "phone" ? (
                        "Send OTP"
                      ) : (
                        "Log In"
                      )}
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
                      <label className="block text-xs font-medium text-secondary-text mb-1 text-center">
                        Enter Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center tracking-widest text-lg font-bold px-4 py-3 bg-slate-50 border border-brand-border rounded-xl focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold font-sans"
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
                      ) : (
                        "Verify & Log In"
                      )}
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
              </form>
            ) : (
              /* SIGNUP FLOW */
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div className="text-center pb-1">
                  <h3 className="text-xl font-bold text-primary-text">Create Account</h3>
                  <p className="text-xs text-secondary-text">Join RideLink to share rides and split costs</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-text uppercase tracking-wider mb-1.5">
                    I want to register as a
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsDriver(false)}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                        !isDriver ? "bg-white text-primary-blue shadow-sm" : "text-secondary-text hover:text-primary-text"
                      }`}
                    >
                      Passenger
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDriver(true)}
                      className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                        isDriver ? "bg-white text-primary-blue shadow-sm" : "text-secondary-text hover:text-primary-text"
                      }`}
                    >
                      Driver
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-0.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-0.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-0.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue font-semibold font-sans"
                    required
                  />
                </div>

                {/* Profile Photo upload simulation (Passenger Only - Optional) */}
                {!isDriver && (
                  <div>
                    <label className="block text-xs font-medium text-secondary-text mb-0.5">
                      Profile Photo (Selfie - Optional)
                    </label>
                    {selfieUploaded ? (
                      <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-bold text-brand-success">
                        <span className="flex items-center gap-1">
                          <Check size={12} /> selfie_uploaded.jpg
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelfieUploaded(false)}
                          className="text-secondary-text hover:text-slate-700 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelfieUploaded(true)}
                        className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-slate-200 hover:border-primary-blue rounded-xl text-xs text-secondary-text font-bold hover:bg-slate-50 transition-all font-sans"
                      >
                        <Camera size={14} /> Upload profile photo
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-1.5 text-sm font-bold text-white bg-primary-blue rounded-xl hover:bg-dark-blue hover:shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Register Account"
                  )}
                </button>
              </form>
            )}

            {/* Social Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border"></div>
              </div>
              <span className="relative px-3 text-xs text-secondary-text bg-white">or continue with</span>
            </div>

            {/* Social logins */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 border border-brand-border rounded-xl text-sm font-semibold text-primary-text hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 font-sans"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53 2.87-4.53z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            {/* Toggle mode footer */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  resetForm();
                }}
                className="text-xs font-bold text-primary-blue hover:text-dark-blue hover:underline transition-colors font-sans"
              >
                {authMode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </div>

            {/* Footer policy */}
            <div className="flex items-start gap-2 pt-4 border-t border-brand-border mt-4 text-[10px] text-secondary-text">
              <ShieldCheck size={16} className="text-brand-success shrink-0" />
              <span>
                By continuing, you agree to RideLink's Terms of Service and Privacy Policy. All rides are protected under
                verified driver safeguards.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
