"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Phone, Send, MapPin, X, AlertTriangle, Check } from 'lucide-react';
import { TrustedContact } from '../context/AppContext';

interface SosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trustedContact?: TrustedContact | null;
}

export default function SosDrawer({ isOpen, onClose, trustedContact }: SosDrawerProps) {
  const [alertSent, setAlertSent] = useState(false);
  const [smsSimulated, setSmsSimulated] = useState(false);

  if (!isOpen) return null;

  const triggerSOS = () => {
    setAlertSent(true);
    setSmsSimulated(true);
    setTimeout(() => {
      setSmsSimulated(false);
    }, 4000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        {/* Backdrop close area */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.5 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="bg-white rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-red-100 shadow-2xl max-w-md w-full overflow-hidden relative z-10 p-6 space-y-6"
        >
          {/* Close Header */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-red-600 font-extrabold text-base">
              <ShieldAlert size={20} className="animate-pulse" />
              <span>Emergency SOS Dashboard</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* SOS Big Button Action */}
          {!alertSent ? (
            <div className="text-center space-y-5 py-4">
              <p className="text-xs text-secondary-text leading-relaxed">
                Tapping the emergency button below will immediately broadcast your live GPS coordinates to your family contact and alert the RideLink safety response team.
              </p>
              
              <button
                onClick={triggerSOS}
                className="w-40 h-40 rounded-full bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black text-xl shadow-xl shadow-red-500/30 flex flex-col items-center justify-center gap-2 border-[8px] border-red-50 hover:scale-105 active:scale-95 transition-all mx-auto animate-pulse"
              >
                <AlertTriangle size={36} />
                <span>TAP SOS</span>
              </button>
              
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Hold for 1 second or tap to trigger
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Confirmed Sent */}
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-800 text-xs leading-relaxed">
                <ShieldAlert size={24} className="shrink-0 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm mb-1">Emergency SOS Broadcast Active!</h4>
                  <p className="font-semibold text-red-700">
                    We successfully transmitted your live coordinates <strong className="text-red-900">9.9816° N, 76.2999° E</strong> to your trusted contact {trustedContact ? `(${trustedContact.relationship}: ${trustedContact.name})` : "family contacts"} and dispatched an alert to our safety monitors.
                  </p>
                </div>
              </div>

              {/* simulated SMS preview */}
              {smsSimulated && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-900 text-white rounded-2xl p-4 text-[11px] leading-relaxed shadow-lg border border-slate-800 relative"
                >
                  <span className="absolute top-2 right-3 text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">SMS Broadcast Sent</span>
                  <p className="font-bold text-slate-400 mb-1">Preview of SMS sent to {trustedContact?.name || 'Contact'}:</p>
                  <p className="text-slate-200">
                    "ALERT: Sarah Prasad has triggered emergency SOS on her RideLink trip to Kannur. Track coordinates live: http://localhost:3000/?track=ride_1&alert=sos"
                  </p>
                </motion.div>
              )}

              {/* Location details */}
              <div className="bg-slate-50 border p-4 rounded-2xl space-y-2.5 text-xs text-secondary-text">
                <div className="flex items-center justify-between">
                  <span>Current Coordinates:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1"><MapPin size={13} className="text-red-500" /> 9.9816° N, 76.2999° E</span>
                </div>
                {trustedContact && (
                  <div className="flex items-center justify-between">
                    <span>Contact Notified:</span>
                    <span className="font-bold text-slate-800">{trustedContact.name} ({trustedContact.relationship})</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Support Status:</span>
                  <span className="font-extrabold text-emerald-600 uppercase flex items-center gap-1">
                    <Check size={13} /> Support Monitoring
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Helpline list */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Quick Helpline Contacts</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl font-bold text-red-700 hover:bg-red-100 transition-colors"
              >
                <Phone size={14} /> Police (112)
              </a>
              <a
                href="tel:108"
                className="flex items-center justify-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl font-bold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Phone size={14} /> Ambulance (108)
              </a>
            </div>
            
            <button
              onClick={() => triggerSOS()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Send size={13} /> Alert RideLink Support Desk
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
