"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Car,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
} from "lucide-react";
import AuthModal from "./AuthModal";

export default function Navbar({ activeTab = "home", setActiveTab }) {
  const { user, logout, toggleUserRole } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "glass py-3 border-b shadow-sm" : "bg-transparent py-5"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavClick("home")}
            >
              <div className="p-2 bg-primary-blue text-white rounded-xl shadow-md shadow-primary-blue/30">
                <Car size={22} className="stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-blue to-dark-blue bg-clip-text text-transparent">
                RideLink
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleNavClick("home")}
                className={`text-sm font-semibold transition-colors ${activeTab === "home" ? "text-primary-blue" : "text-secondary-text hover:text-primary-text"}`}
              >
                Home
              </button>
              {(!user || !user.isDriver) && (
                <button
                  onClick={() => handleNavClick("find-ride")}
                  className={`text-sm font-semibold transition-colors ${activeTab === "find-ride" ? "text-primary-blue" : "text-secondary-text hover:text-primary-text"}`}
                >
                  Find Ride
                </button>
              )}
              {(!user || user.isDriver) && (
                <button
                  onClick={() => handleNavClick("offer-ride")}
                  className={`text-sm font-semibold transition-colors ${activeTab === "offer-ride" ? "text-primary-blue" : "text-secondary-text hover:text-primary-text"}`}
                >
                  Offer Ride
                </button>
              )}
              <button
                onClick={() => handleNavClick("safety")}
                className={`text-sm font-semibold transition-colors ${activeTab === "safety" ? "text-primary-blue" : "text-secondary-text hover:text-primary-text"}`}
              >
                Safety
              </button>
            </div>

            {/* Desktop User Panel */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNavClick("dashboard")}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-primary-blue rounded-xl hover:bg-dark-blue hover:shadow-md hover:shadow-primary-blue/20 transition-all"
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </button>

                  {/* Profile Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setProfileDropdownOpen(!profileDropdownOpen)
                      }
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-blue/25"
                      />
                    </button>

                    {profileDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setProfileDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 focus:outline-none z-20 border border-brand-border">
                          <div className="px-4 py-3 border-b border-brand-border">
                            <p className="text-sm font-bold text-primary-text truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-secondary-text truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleNavClick("dashboard");
                                setProfileDropdownOpen(false);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-secondary-text hover:text-primary-text hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <UserIcon size={16} /> Profile Settings
                            </button>
                            <button
                              onClick={() => {
                                logout();
                                setProfileDropdownOpen(false);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <LogOut size={16} /> Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="text-sm font-semibold text-secondary-text hover:text-primary-text transition-colors px-4 py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="text-sm font-bold text-white bg-primary-blue hover:bg-dark-blue hover:shadow-lg hover:shadow-primary-blue/25 px-5 py-2.5 rounded-xl transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 rounded-xl text-secondary-text hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-b absolute top-full left-0 right-0 py-4 px-6 space-y-3 shadow-xl">
            <button
              onClick={() => handleNavClick("home")}
              className={`block w-full text-left py-2 font-semibold ${activeTab === "home" ? "text-primary-blue" : "text-secondary-text"}`}
            >
              Home
            </button>
            {(!user || !user.isDriver) && (
              <button
                onClick={() => handleNavClick("find-ride")}
                className={`block w-full text-left py-2 font-semibold ${activeTab === "find-ride" ? "text-primary-blue" : "text-secondary-text"}`}
              >
                Find Ride
              </button>
            )}
            {(!user || user.isDriver) && (
              <button
                onClick={() => handleNavClick("offer-ride")}
                className={`block w-full text-left py-2 font-semibold ${activeTab === "offer-ride" ? "text-primary-blue" : "text-secondary-text"}`}
              >
                Offer Ride
              </button>
            )}
            <button
              onClick={() => handleNavClick("safety")}
              className={`block w-full text-left py-2 font-semibold ${activeTab === "safety" ? "text-primary-blue" : "text-secondary-text"}`}
            >
              Safety
            </button>

            {user ? (
              <div className="pt-4 border-t border-brand-border space-y-2">
                <button
                  onClick={() => handleNavClick("dashboard")}
                  className="flex w-full items-center gap-2 py-2 font-semibold text-primary-blue"
                >
                  <LayoutDashboard size={18} /> Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 py-2 font-semibold text-red-600"
                >
                  <LogOut size={18} /> Log Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-brand-border flex gap-3">
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center font-semibold border rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center font-bold text-white bg-primary-blue rounded-xl"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
