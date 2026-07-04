"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Car, Star, CheckCircle } from "lucide-react";

export default function RideCard({ ride, onBook, bookingStatus = "none" }) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 12px 30px rgba(37, 99, 235, 0.08)" }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-brand-border rounded-3xl p-6 relative overflow-hidden transition-all group"
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Blue hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-blue/0 via-primary-blue/0 to-primary-blue/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top section: Driver details & Price */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={ride.driverPhoto}
            alt={ride.driverName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
          />

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-primary-text">
                {ride.driverName}
              </h4>
              {ride.driverRating >= 4.8 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-[10px] font-bold text-primary-blue rounded-md">
                  Top Rated
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-secondary-text">
              <Star size={13} className="fill-amber-400 stroke-amber-400" />
              <span className="font-bold text-slate-700">
                {ride.driverRating}
              </span>
              <span>• Verified Driver</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-secondary-text font-bold">
            Ride Contribution
          </p>
          <p className="text-xl font-extrabold text-primary-blue">
            ₹{ride.contributionAmount}
          </p>
        </div>
      </div>

      {/* Middle section: Trip details */}
      <div className="space-y-3.5 mb-5 relative pl-4">
        {/* Connector Line */}
        <div className="absolute top-2.5 bottom-2.5 left-[21px] w-0.5 bg-slate-200 border-dashed border-l" />

        <div className="flex items-start gap-3 relative">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-blue mt-1 shrink-0 ring-4 ring-blue-50" />
          <div>
            <p className="text-xs text-secondary-text font-semibold">Origin</p>
            <p className="text-sm font-bold text-primary-text">{ride.origin}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 relative">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-success mt-1 shrink-0 ring-4 ring-emerald-50" />
          <div>
            <p className="text-xs text-secondary-text font-semibold">
              Destination
            </p>
            <p className="text-sm font-bold text-primary-text">
              {ride.destination}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata tags: Date, Time, Vehicle, Seats */}
      <div className="grid grid-cols-2 gap-2 text-xs text-secondary-text mb-6">
        <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Calendar size={14} className="text-slate-400" />
          <span>{ride.date}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <Clock size={14} className="text-slate-400" />
          <span>{ride.time} AM</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100 col-span-2">
          <Car size={14} className="text-slate-400 shrink-0" />
          <span className="truncate">{ride.vehicle}</span>
        </div>
      </div>

      {/* Bottom section: Seats & Book CTA */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-secondary-text font-bold">
            Seats Left
          </p>
          <p className="text-sm font-bold text-primary-text">
            {ride.seatsAvailable}{" "}
            <span className="text-xs font-normal text-secondary-text">
              / {ride.totalSeats} seats
            </span>
          </p>
        </div>

        {bookingStatus === "none" ? (
          <button
            onClick={() => onBook(ride.id)}
            disabled={ride.seatsAvailable === 0}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${ride.seatsAvailable > 0 ? "bg-primary-blue hover:bg-dark-blue text-white hover:shadow-lg hover:shadow-primary-blue/20" : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"}`}
          >
            {ride.seatsAvailable > 0 ? "Request Ride" : "Fully Booked"}
          </button>
        ) : bookingStatus === "pending" ? (
          <span className="inline-flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200">
            Pending Approval
          </span>
        ) : bookingStatus === "accepted" ? (
          <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
            <CheckCircle size={14} /> Confirmed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
            Rejected
          </span>
        )}
      </div>
    </motion.div>
  );
}
