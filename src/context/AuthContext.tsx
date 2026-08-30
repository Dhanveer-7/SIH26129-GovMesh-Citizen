import React, { createContext, useContext, useState, useEffect } from 'react';
import { CitizenProfile } from '../types';
import { mockCitizen } from '../mock/data';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: CitizenProfile | null;
  otpSent: boolean;
  mobileNumber: string;
  login: (mobile: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  register: (name: string, mobile: string, email: string) => Promise<boolean>;
  logout: () => void;
  reAuthenticate: (pin: string) => Promise<boolean>;
  updateProfile: (updated: Partial<CitizenProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('govmesh_auth') === 'true';
  });
  const [user, setUser] = useState<CitizenProfile | null>(() => {
    const saved = localStorage.getItem('govmesh_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem('govmesh_auth', 'true');
      localStorage.setItem('govmesh_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('govmesh_auth');
      localStorage.removeItem('govmesh_user');
    }
  }, [isAuthenticated, user]);

  const login = async (mobile: string): Promise<boolean> => {
    // Validate mobile number length/digits
    if (!/^\+?[0-9]{10,12}$/.test(mobile.replace(/\s+/g, ''))) {
      return false;
    }
    setMobileNumber(mobile);
    
    // Call service layer (resolves to true/false or hits backend)
    await api.login(mobile);
    
    setOtpSent(true);
    return true;
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    // Call service layer
    const result = await api.verifyOtp(mobileNumber, otp);
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user || {
        ...mockCitizen,
        mobile: mobileNumber || mockCitizen.mobile
      });
      setOtpSent(false);
      return true;
    }
    return false;
  };

  const register = async (name: string, mobile: string, email: string): Promise<boolean> => {
    const newUser: CitizenProfile = {
      name,
      citizenId: `GM-CIT-${Math.floor(10000 + Math.random() * 90000)}`,
      mobile,
      email,
      address: "Add details in Profile tab",
      district: "Not Specified",
      state: "Maharashtra",
      verificationStatus: "VERIFIED",
      preferredLanguage: "en"
    };

    // Call service layer
    await api.register(name, mobile, email);

    setUser(newUser);
    setMobileNumber(mobile);
    setOtpSent(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setOtpSent(false);
    setMobileNumber('');
  };

  const reAuthenticate = async (pin: string): Promise<boolean> => {
    // Simulated PIN check (default pin 1234 or 123456)
    return pin === '1234' || pin === '123456';
  };

  const updateProfile = (updated: Partial<CitizenProfile>) => {
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, ...updated };
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      otpSent,
      mobileNumber,
      login,
      verifyOtp,
      register,
      logout,
      reAuthenticate,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
