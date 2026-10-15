import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<StudentProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
      if (userData.role === 'student') {
        try {
          const profileData = await api.getStudentProfile();
          setProfile(profileData);
        } catch {
          // ignore profile fetch failure
        }
      }
    } catch {
      api.setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any): Promise<User> => {
    const res = await api.login(credentials);
    setUser(res.user);
    if (res.user.role === 'student') {
      try {
        const profileData = await api.getStudentProfile();
        setProfile(profileData);
      } catch {
        // ignore
      }
    }
    return res.user;
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.register(data);
    setUser(res.user);
    if (res.user.role === 'student') {
      try {
        const profileData = await api.getStudentProfile();
        setProfile(profileData);
      } catch {
        // ignore
      }
    }
    return res.user;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<StudentProfile>) => {
    const updated = await api.updateStudentProfile(data);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, register, logout, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
