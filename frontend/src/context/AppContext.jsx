"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("rl_token") : null;
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.getMe();
        if (res.success && res.user) {
          // Hydrate trusted contact from localStorage if exists
          const localUser = localStorage.getItem("rl_user");
          let parsedLocal = null;
          if (localUser) {
            try {
              parsedLocal = JSON.parse(localUser);
            } catch {}
          }
          setUser({
            ...res.user,
            trustedContact:
              parsedLocal?.trustedContact || res.user.trustedContact || null,
            governmentIdVerified:
              parsedLocal?.governmentIdVerified ??
              res.user.governmentIdVerified,
            verificationStatus:
              parsedLocal?.verificationStatus ?? res.user.verificationStatus,
            vehicleDetails:
              parsedLocal?.vehicleDetails ?? res.user.vehicleDetails,
          });
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem("rl_token");
            localStorage.removeItem("rl_user");
          }
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load user session", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (emailOrPhone) => {
    try {
      const isEmail = emailOrPhone.includes("@");
      const params = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };

      const res = await api.login(params);
      if (res.success && res.user) {
        if (typeof window !== "undefined") {
          if (res.token) {
            localStorage.setItem("rl_token", res.token);
          }
          localStorage.setItem("rl_user", JSON.stringify(res.user));
        }
        setUser(res.user);
        addNotification(`Welcome back, ${res.user.name}!`);
        return true;
      } else {
        alert(res.error || "Login failed.");
        return false;
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to connect to the login service.");
      return false;
    }
  };

  const signup = async (
    name,
    email,
    phone,
    isDriver = false,
    profilePicture,
  ) => {
    try {
      const params = { name, email, phone, isDriver, profilePicture };
      const res = await api.signup(params);
      if (res.success && res.user) {
        if (typeof window !== "undefined") {
          if (res.token) {
            localStorage.setItem("rl_token", res.token);
          }
          localStorage.setItem("rl_user", JSON.stringify(res.user));
        }
        setUser(res.user);
        addNotification(`Welcome to RideLink, ${res.user.name}!`);
        return true;
      } else {
        alert(res.error || "Registration failed.");
        return false;
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to connect to the registration service.");
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rl_token");
      localStorage.removeItem("rl_user");
    }
    setUser(null);
    setNotifications([]);
  };

  const toggleUserRole = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      isDriver: !user.isDriver,
    };
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("rl_user", JSON.stringify(updatedUser));
    }
    addNotification(
      `Switched interface to ${updatedUser.isDriver ? "Driver" : "Passenger"} Mode`,
    );
  };

  const addNotification = (msg) => {
    setNotifications((prev) => [msg, ...prev].slice(0, 10)); // limit to 10
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const triggerMockNotification = (msg) => {
    addNotification(msg);
  };

  const updateTrustedContact = (contact) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      trustedContact: contact,
    };
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("rl_user", JSON.stringify(updatedUser));
    }
    addNotification(
      `Trusted contact saved: ${contact.name} (${contact.relationship})`,
    );
  };

  const verifyDriver = async (license, registration, selfie) => {
    if (!user) return false;
    // Simulate short API update
    const updatedUser = {
      ...user,
      governmentIdVerified: true,
      verificationStatus: "verified",
      profilePicture: selfie || user.profilePicture,
      vehicleDetails: {
        model: user.vehicleDetails?.model || "Tesla Model 3",
        color: user.vehicleDetails?.color || "Midnight Blue",
        plateNumber: registration || "KL-07-CD-1234",
        seats: user.vehicleDetails?.seats || 4,
      },
    };
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("rl_user", JSON.stringify(updatedUser));
    }
    addNotification("Congratulations! You are now a Verified Driver.");
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        toggleUserRole,
        notifications,
        addNotification,
        clearNotifications,
        triggerMockNotification,
        updateTrustedContact,
        verifyDriver,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
