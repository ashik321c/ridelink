"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle,
  MapPin,
  MessageSquare,
  Phone,
  X,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function BookingRequestModal({
  ride,
  onClose,
  onSubmitBooking,
  onNavigateToDashboard,
}) {
  const { user, updateTrustedContact } = useApp();
  const [addTrustedContact, setAddTrustedContact] = useState(
    !!user?.trustedContact,
  );
  const [tcName, setTcName] = useState(user?.trustedContact?.name || "");
  const [tcRelation, setTcRelation] = useState(
    user?.trustedContact?.relationship || "",
  );
  const [tcPhone, setTcPhone] = useState(user?.trustedContact?.phone || "");

  const [modalState, setModalState] = useState("review");
  const [pickupPoint, setPickupPoint] = useState(ride.origin);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [passengerMessage, setPassengerMessage] = useState(
    "Hi, I'd like to join your ride.",
  );
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Derive mock registration number and completed rides
  const regNumber =
    ride.driverId === "user_1" ? "KL-07-CD-1234" : "KL-11-AA-5678";
  const completedRides = ride.driverId === "user_1" ? 42 : 18;

  // Simulated acceptance timer
  useEffect(() => {
    if (modalState === "sending") {
      const timer = setTimeout(async () => {
        try {
          if (bookingId) {
            const apiBase =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
            await fetch(`${apiBase}/bookings/${bookingId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("rl_token")}`,
              },
              body: JSON.stringify({ status: "accepted" }),
            }).catch(() =>
              console.warn("Mock status update failed, continuing demo."),
            );
          }
          setModalState("confirmed");
        } catch (err) {
          console.error(err);
          setModalState("confirmed");
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [modalState, bookingId]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (addTrustedContact && tcName && tcRelation && tcPhone) {
        updateTrustedContact({
          name: tcName,
          relationship: tcRelation,
          phone: tcPhone,
        });
      }
      const res = await onSubmitBooking(
        seatsRequested,
        pickupPoint,
        passengerMessage,
      );
      if (res && res.success && res.booking) {
        setBookingId(res.booking.id);
        setModalState("sending");
      } else {
        alert("Unable to send request. Make sure you are logged in!");
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl border border-brand-border shadow-2xl max-w-lg w-full relative overflow-hidden"
        >
          {/* Close Header */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-secondary-text hover:bg-slate-100 transition-all z-20"
          >
            <X size={18} />
          </button>

          {/* STATE 1: REVIEW TRIP & INPUTS */}
          {modalState === "review" && (
            <form onSubmit={handleRequestSubmit} className="space-y-0">
              {/* Header with Driver Details */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-6 flex items-center gap-4 border-b border-brand-border pt-7">
                <img
                  src={ride.driverPhoto}
                  alt={ride.driverName}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md shrink-0"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base font-extrabold text-primary-text">
                      {ride.driverName}
                    </h3>
                    {/* Blue Verified Badge */}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-[9px] font-bold text-primary-blue rounded-md border border-blue-100">
                      <ShieldCheck
                        size={11}
                        className="fill-blue-500 text-white"
                      />{" "}
                      Verified Driver
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-secondary-text">
                    <span className="flex items-center gap-0.5">
                      <Star
                        size={13}
                        className="fill-amber-400 stroke-amber-400"
                      />
                      <strong className="text-slate-800 font-bold">
                        {ride.driverRating}
                      </strong>{" "}
                      Rating
                    </span>
                    <span>•</span>
                    <span className="font-semibold">
                      {completedRides} Completed Rides
                    </span>
                  </div>
                </div>
              </div>

              {/* Main review box */}
              <div className="p-6 space-y-5">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3.5">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-secondary-text block text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        From
                      </span>
                      <span className="font-bold text-primary-text text-sm">
                        {ride.origin}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary-text block text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        To
                      </span>
                      <span className="font-bold text-primary-text text-sm">
                        {ride.destination}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-secondary-text block text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        Departure Details
                      </span>
                      <span className="font-semibold text-primary-text">
                        {ride.date} at {ride.time} AM
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary-text block text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        Vehicle Details
                      </span>
                      <span className="font-semibold text-primary-text block truncate">
                        {ride.vehicle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                        {regNumber}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3 text-xs flex justify-between">
                    <div>
                      <span className="text-secondary-text text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                        Available Seats
                      </span>
                      <span className="font-semibold text-primary-text">
                        {ride.seatsAvailable} seats left
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-secondary-text text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                        Contribution Per Seat
                      </span>
                      <span className="font-extrabold text-primary-blue text-sm">
                        ₹{ride.contributionAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                        Specific Pickup Point
                      </label>
                      <input
                        type="text"
                        value={pickupPoint}
                        onChange={(e) => setPickupPoint(e.target.value)}
                        placeholder="e.g. Near main bus terminal"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                        Number of Seats
                      </label>
                      <select
                        value={seatsRequested}
                        onChange={(e) =>
                          setSeatsRequested(parseInt(e.target.value))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue font-semibold"
                      >
                        {[...Array(ride.seatsAvailable)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i + 1 === 1 ? "seat" : "seats"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-secondary-text font-bold uppercase tracking-wider mb-1.5">
                      Message to Driver (Optional)
                    </label>
                    <textarea
                      value={passengerMessage}
                      onChange={(e) => setPassengerMessage(e.target.value)}
                      placeholder="Hi, I'd like to join your ride."
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-primary-blue resize-none leading-relaxed"
                    />
                  </div>

                  {/* Trusted Contact Optional Section */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addTrustedContact}
                        onChange={(e) => setAddTrustedContact(e.target.checked)}
                        className="rounded border-slate-355 text-primary-blue focus:ring-primary-blue w-4 h-4 cursor-pointer"
                      />

                      <span className="text-xs font-bold text-slate-700 select-none">
                        Add a Trusted Contact for Safety (Optional)
                      </span>
                    </label>

                    {addTrustedContact && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 overflow-hidden"
                      >
                        <div>
                          <input
                            type="text"
                            placeholder="Contact Name"
                            value={tcName}
                            onChange={(e) => setTcName(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-[11px] focus:outline-none focus:border-primary-blue font-semibold"
                            required={addTrustedContact}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Relationship"
                            value={tcRelation}
                            onChange={(e) => setTcRelation(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-[11px] focus:outline-none focus:border-primary-blue font-semibold"
                            required={addTrustedContact}
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={tcPhone}
                            onChange={(e) => setTcPhone(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-brand-border rounded-xl text-[11px] focus:outline-none focus:border-primary-blue font-semibold"
                            required={addTrustedContact}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Confirm footer */}
                <div className="flex items-center justify-between border-t border-brand-border pt-5 mt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary-text tracking-wider">
                      Total Ride Contribution
                    </span>
                    <p className="text-2xl font-extrabold text-primary-blue">
                      ₹{ride.contributionAmount * seatsRequested}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3.5 bg-primary-blue hover:bg-dark-blue text-white font-extrabold text-xs rounded-xl hover:shadow-lg hover:shadow-primary-blue/20 transition-all disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Request Ride"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STATE 2: REQUEST SENT, WAITING CONFIRMATION */}
          {modalState === "sending" && (
            <div className="p-8 text-center space-y-8">
              <div className="space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
                  <div className="w-12 h-12 rounded-full border-4 border-t-primary-blue border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-extrabold text-primary-text">
                    Your request has been sent.
                  </h3>
                  <p className="text-xs text-secondary-text font-medium">
                    Waiting for driver confirmation...
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left space-y-4">
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-secondary-text">
                  Booking Process
                </h4>
                <div className="relative flex flex-col space-y-5">
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200" />

                  <div className="flex items-center gap-3 relative">
                    <div className="w-5 h-5 rounded-full bg-brand-success text-white flex items-center justify-center text-[10px] font-bold z-10">
                      ✓
                    </div>
                    <span className="text-xs font-semibold text-secondary-text">
                      Search Ride
                    </span>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    <div className="w-5 h-5 rounded-full bg-primary-blue text-white flex items-center justify-center text-[10px] font-bold z-10 animate-pulse">
                      ✓
                    </div>
                    <span className="text-xs font-bold text-primary-blue">
                      Request Sent
                    </span>
                  </div>

                  <div className="flex items-center gap-3 relative">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold z-10">
                      3
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      Driver Accepted
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onNavigateToDashboard}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-brand-border text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: RIDE CONFIRMED */}
          {modalState === "confirmed" && (
            <div className="p-8 text-center space-y-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="w-16 h-16 rounded-full bg-emerald-50 text-brand-success flex items-center justify-center mx-auto ring-8 ring-emerald-500/10"
                >
                  <CheckCircle size={32} />
                </motion.div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-extrabold text-brand-success">
                    Ride Confirmed ✅
                  </h3>
                  <p className="text-xs text-secondary-text font-medium leading-relaxed max-w-sm mx-auto">
                    Great news! {ride.driverName} has accepted your ride
                    request. You are ready to travel.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left space-y-3.5">
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200/50 pb-1.5">
                  Trip Information
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-text">
                      Pickup Location:
                    </span>
                    <span className="font-bold text-primary-text flex items-center gap-1">
                      <MapPin size={13} className="text-primary-blue" />{" "}
                      {pickupPoint}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-text">Driver Contact:</span>
                    <span className="font-bold text-primary-text flex items-center gap-1">
                      <Phone size={13} className="text-slate-400" /> +91 98765
                      43210
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-text">
                      Vehicle Reg Number:
                    </span>
                    <span className="font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">
                      {regNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-text">
                      Total Contribution:
                    </span>
                    <span className="font-extrabold text-brand-success">
                      ₹{ride.contributionAmount * seatsRequested}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onNavigateToDashboard}
                  className="flex-1 py-3 bg-primary-blue text-white hover:bg-dark-blue text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={14} /> Open Live Chat & Map
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-3 border border-brand-border text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
