import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Report, NotificationItem, UserRole, ReportCategory, ReportPriority } from '../types';
import { api } from '../services/api';
import { firestoreDb } from '../services/firestoreDb';

export type AppView = 
  | 'login'
  | 'dashboard'
  | 'report'
  | 'track'
  | 'reports'
  | 'ai-assistant'
  | 'map'
  | 'notifications'
  | 'rewards'
  | 'profile'
  | 'settings'
  | 'admin-dashboard'
  | 'admin-reports'
  | 'admin-students'
  | 'admin-departments'
  | 'admin-analytics'
  | 'admin-heatmap';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  trackingTicketId: string | null;
  setTrackingTicketId: (id: string | null) => void;
  reports: Report[];
  loadingReports: boolean;
  databaseConnected: boolean;
  refreshReports: () => Promise<void>;
  notifications: NotificationItem[];
  unreadNotifs: number;
  refreshNotifications: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authInitialTab: 'student' | 'admin' | 'signup';
  setAuthInitialTab: (tab: 'student' | 'admin' | 'signup') => void;
  prefilledCategory: ReportCategory | null;
  setPrefilledCategory: (cat: ReportCategory | null) => void;
  prefilledPriority: ReportPriority | null;
  setPrefilledPriority: (priority: ReportPriority | null) => void;
  startQuickReport: (category: ReportCategory, defaultPriority?: ReportPriority) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  login: (identifier: string, pass: string, role?: UserRole) => Promise<void>;
  registerStudent: (data: any) => Promise<void>;
  logout: () => void;
  switchUserRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<User | undefined>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check cached user session, default to null so user experiences the Login Page
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cf_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === 'admin' && parsed.name === 'Dr. Sarah Jenkins') {
          parsed.name = 'Admin';
          localStorage.setItem('cf_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [trackingTicketId, setTrackingTicketId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [databaseConnected, setDatabaseConnected] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'student' | 'admin' | 'signup'>('student');
  const [prefilledCategory, setPrefilledCategory] = useState<ReportCategory | null>(null);
  const [prefilledPriority, setPrefilledPriority] = useState<ReportPriority | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('cf_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cf_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshReports = async () => {
    try {
      setLoadingReports(true);
      const data = await api.getReports();
      setReports(data.reports);
      setDatabaseConnected(true);
    } catch (err) {
      console.error('Error fetching reports from database:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications(user);
      setNotifications(data.notifications);
      setUnreadNotifs(data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Initial load and live real-time synchronization with Cloud Firestore
  useEffect(() => {
    setLoadingReports(true);
    const unsubscribe = firestoreDb.subscribeReports(
      (updatedReports) => {
        setReports(updatedReports);
        setLoadingReports(false);
        setDatabaseConnected(true);
      },
      (error) => {
        console.warn('Real-time Firestore subscription error:', error);
        setDatabaseConnected(false);
        setLoadingReports(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cf_user', JSON.stringify(user));
      refreshNotifications();
    } else {
      localStorage.removeItem('cf_user');
      setNotifications([]);
      setUnreadNotifs(0);
    }
  }, [user]);

  const login = async (identifier: string, pass: string, role?: UserRole) => {
    try {
      const res = await api.login(identifier, pass, role);
      setUser(res.user);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${res.user.name}! 👋`, 'success');
      if (res.user.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const registerStudent = async (data: any) => {
    try {
      const res = await api.register(data);
      setUser(res.user);
      setIsAuthModalOpen(false);
      showToast(`Account created! Welcome to CampusFix AI, ${res.user.name}! 🌱`, 'success');
      setCurrentView('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentView('login');
    setIsAuthModalOpen(false);
    localStorage.removeItem('cf_user');
    showToast('You have been logged out safely.', 'info');
  };

  const switchUserRole = async (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      try {
        const res = await api.login('Admin', 'Admin@sujansai', 'admin');
        setUser(res.user);
        setCurrentView('admin-dashboard');
        showToast('Switched to Campus Operations (Admin) Mode 🛠️', 'info');
      } catch (err) {
        showToast('Could not switch to Admin account', 'error');
      }
    } else {
      try {
        const res = await api.login('alex.student@campus.edu', 'password123', 'student');
        setUser(res.user);
        setCurrentView('dashboard');
        showToast('Switched to Student Portal 🎒', 'info');
      } catch (err) {
        showToast('Could not switch to Student account', 'error');
      }
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<User | undefined> => {
    if (!user) return undefined;
    try {
      const res = await api.updateUser(user.id, updates);
      const mergedUser: User = { ...user, ...res.user, ...updates };
      setUser(mergedUser);
      localStorage.setItem('cf_user', JSON.stringify(mergedUser));
      return mergedUser;
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  };

  const startQuickReport = (cat: ReportCategory, defaultPriority?: ReportPriority) => {
    setPrefilledCategory(cat);
    if (defaultPriority) {
      setPrefilledPriority(defaultPriority);
    }
    setCurrentView('report');
    showToast(`Quick action activated: Category set to "${cat}". Fill in location & details to submit.`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        currentView,
        setCurrentView,
        selectedReportId,
        setSelectedReportId,
        trackingTicketId,
        setTrackingTicketId,
        reports,
        loadingReports,
        databaseConnected,
        refreshReports,
        notifications,
        unreadNotifs,
        refreshNotifications,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authInitialTab,
        setAuthInitialTab,
        prefilledCategory,
        setPrefilledCategory,
        prefilledPriority,
        setPrefilledPriority,
        startQuickReport,
        darkMode,
        toggleDarkMode,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        toasts,
        showToast,
        removeToast,
        login,
        registerStudent,
        logout,
        switchUserRole,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
