import React from 'react';
import { useApp, AppView } from '../context/AppContext';
import { 
  Home, 
  PlusCircle, 
  MapPin, 
  FileText, 
  Sparkles, 
  Map, 
  Bell, 
  Award, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  BarChart3, 
  Layers, 
  X,
  Flame,
  Users
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    user, 
    currentView, 
    setCurrentView, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    unreadNotifs
  } = useApp();

  const isAdmin = user?.role === 'admin';

  interface NavItem {
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  const studentNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'report', label: 'Report Issue', icon: PlusCircle },
    { id: 'track', label: 'Track Issues', icon: MapPin },
    { id: 'reports', label: 'My Reports', icon: FileText },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'map', label: 'Campus Map', icon: Map },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
    { id: 'rewards', label: 'Rewards & Impact', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Operations Center', icon: Home },
    { id: 'admin-reports', label: 'All Reports', icon: FileText },
    { id: 'admin-students', label: 'Students & Logins', icon: Users },
    { id: 'admin-departments', label: 'Departments', icon: Building2 },
    { id: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin-heatmap', label: 'Issue Heatmap', icon: Flame },
    { id: 'map', label: 'Campus Map', icon: Map },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const handleNavClick = (viewId: AppView) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-3 select-none">
      <div>
        {/* Top collapse button on desktop */}
        <div className="hidden md:flex items-center justify-end pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <button
            onClick={() => setSidebarCollapsed((prev: boolean) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all relative group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                
                {!sidebarCollapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}

                {/* Badge count */}
                {item.badge && !sidebarCollapsed && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
                {item.badge && sidebarCollapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Student Impact / Quick Card */}
      {!sidebarCollapsed && user && user.role === 'student' && (
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800/90 dark:to-slate-800/50 border border-blue-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              🌱
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Campus Impact</p>
              <p className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">{user.points} Contribution Points</p>
            </div>
          </div>
          <button
            onClick={() => handleNavClick('report')}
            className="w-full mt-1 py-1.5 px-3 text-xs font-bold text-center text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
          >
            + Quick Report
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block shrink-0 sticky top-18 h-[calc(100vh-4.5rem)] glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-20 ${
          sidebarCollapsed ? 'w-18' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-blue-600">CampusFix</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">AI</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
