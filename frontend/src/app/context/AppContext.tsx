"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export interface TrustedContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  rating: number;
  reviewsCount: number;
  isDriver: boolean;
  verificationStatus: string;
  governmentIdVerified: boolean;
  vehicleDetails?: {
    model: string;
    color: string;
    plateNumber: string;
    seats: number;
  } | null;
  bio: string;
  trustedContact?: TrustedContact | null;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, name?: string, isDriver?: boolean) => Promise<boolean>;
  logout: () => void;
  toggleUserRole: () => void;
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
  triggerMockNotification: (msg: string) => void;
  updateTrustedContact: (contact: TrustedContact) => void;
  verifyDriver: (license: string, registration: string, selfie: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    async function loadUser() {
      try {
        // Force mock login token for initial testing if none exists
        if (typeof window !== 'undefined' && !localStorage.getItem('rl_token')) {
          localStorage.setItem('rl_token', 'mock_jwt_token_user_2'); // default to passenger Sarah
        }

        const res = await api.getMe();
        if (res.success && res.user) {
          // Hydrate trusted contact from localStorage if exists
          const localUser = localStorage.getItem('rl_user');
          let parsedLocal: any = null;
          if (localUser) {
            try {
              parsedLocal = JSON.parse(localUser);
            } catch (e) {}
          }
          
          setUser({
            ...res.user,
            trustedContact: parsedLocal?.trustedContact || res.user.trustedContact || null,
            governmentIdVerified: parsedLocal?.governmentIdVerified ?? res.user.governmentIdVerified,
            verificationStatus: parsedLocal?.verificationStatus ?? res.user.verificationStatus,
            vehicleDetails: parsedLocal?.vehicleDetails ?? res.user.vehicleDetails
          });
        }
      } catch (err) {
        console.error("Failed to load user session", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (emailOrPhone: string, name?: string, isDriver: boolean = false) => {
    try {
      const isEmail = emailOrPhone.includes('@');
      const params = isEmail 
        ? { email: emailOrPhone, name, isDriver }
        : { phone: emailOrPhone, name, isDriver };

      const res = await api.login(params);
      if (res.success && res.user) {
        setUser(res.user);
        addNotification(`Welcome back, ${res.user.name}!`);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rl_token');
      localStorage.removeItem('rl_user');
    }
    setUser(null);
    setNotifications([]);
  };

  const toggleUserRole = async () => {
    if (!user) return;
    const nextRole = !user.isDriver;
    
    // Switch to another mock user matching the role to provide complete experience, 
    // or just toggle the current user's role.
    let targetUserToken = '';
    if (nextRole) {
      // Switch to Alex (Driver)
      targetUserToken = 'mock_jwt_token_user_1';
    } else {
      // Switch to Sarah (Passenger)
      targetUserToken = 'mock_jwt_token_user_2';
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('rl_token', targetUserToken);
    }
    
    setLoading(true);
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        // Hydrate locally stored fields for role compatibility
        const localUser = localStorage.getItem('rl_user');
        let parsedLocal: any = null;
        if (localUser) {
          try {
            parsedLocal = JSON.parse(localUser);
          } catch (e) {}
        }

        const hydratedUser = {
          ...res.user,
          trustedContact: parsedLocal?.trustedContact || res.user.trustedContact || null,
          governmentIdVerified: parsedLocal?.governmentIdVerified ?? res.user.governmentIdVerified,
          verificationStatus: parsedLocal?.verificationStatus ?? res.user.verificationStatus,
          vehicleDetails: parsedLocal?.vehicleDetails ?? res.user.vehicleDetails
        };
        setUser(hydratedUser);
        addNotification(`Switched interface to ${hydratedUser.isDriver ? 'Driver' : 'Passenger'} Mode`);
      }
    } catch (err) {
      console.error("Error switching roles", err);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 10)); // limit to 10
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const triggerMockNotification = (msg: string) => {
    addNotification(msg);
  };

  const updateTrustedContact = (contact: TrustedContact) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      trustedContact: contact
    };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rl_user', JSON.stringify(updatedUser));
    }
    addNotification(`Trusted contact saved: ${contact.name} (${contact.relationship})`);
  };

  const verifyDriver = async (license: string, registration: string, selfie: string) => {
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
        seats: user.vehicleDetails?.seats || 4
      }
    };
    
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rl_user', JSON.stringify(updatedUser));
    }
    addNotification("Congratulations! You are now a Verified Driver.");
    return true;
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      login,
      logout,
      toggleUserRole,
      notifications,
      addNotification,
      clearNotifications,
      triggerMockNotification,
      updateTrustedContact,
      verifyDriver
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
