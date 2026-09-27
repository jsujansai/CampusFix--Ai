import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { LoginPage } from './components/LoginPage';

// Views
import { DashboardView } from './views/DashboardView';
import { ReportIssueView } from './views/ReportIssueView';
import { TrackIssueView } from './views/TrackIssueView';
import { MyReportsView } from './views/MyReportsView';
import { AIAssistantView } from './views/AIAssistantView';
import { CampusMapView } from './views/CampusMapView';
import { NotificationsView } from './views/NotificationsView';
import { RewardsView } from './views/RewardsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminReportsView } from './views/AdminReportsView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { AdminDepartmentsView } from './views/AdminDepartmentsView';
import { AdminHeatmapView } from './views/AdminHeatmapView';
import { AdminStudentsView } from './views/AdminStudentsView';

const MainAppContent: React.FC = () => {
  const { currentView, user } = useApp();

  // If user is not authenticated or explicitly navigated to login, render full-screen LoginPage
  if (!user || currentView === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white">
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'report':
        return <ReportIssueView />;
      case 'track':
        return <TrackIssueView />;
      case 'reports':
        return <MyReportsView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'map':
        return <CampusMapView />;
      case 'notifications':
        return <NotificationsView />;
      case 'rewards':
        return <RewardsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'admin-reports':
        return <AdminReportsView />;
      case 'admin-students':
        return <AdminStudentsView />;
      case 'admin-departments':
        return <AdminDepartmentsView />;
      case 'admin-analytics':
        return <AdminAnalyticsView />;
      case 'admin-heatmap':
        return <AdminHeatmapView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Header />
      
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Sidebar />
        
        <main className="flex-1 min-w-0 py-6 sm:px-6 overflow-x-hidden">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Overlays & Modals */}
      <AuthModal />
      <ReportDetailModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
