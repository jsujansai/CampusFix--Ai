export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  username?: string;
  rollNumber?: string;
  gender?: 'Male' | 'Female';
  department: string;
  year?: string;
  avatarUrl: string;
  phone?: string;
  points: number;
  badges: string[];
  password?: string;
  createdAt?: string;
}

export type ReportCategory = 
  | 'Maintenance'
  | 'IT Support'
  | 'Safety'
  | 'Electrical'
  | 'Plumbing'
  | 'Wi-Fi / IT'
  | 'Classroom'
  | 'Laboratory'
  | 'Cleanliness'
  | 'Road / Pathway'
  | 'Hostel'
  | 'Security'
  | 'Library'
  | 'Other';

export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ReportStatus = 
  | 'Pending'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export interface TimelineEntry {
  id: string;
  stage: ReportStatus | 'Report Submitted';
  timestamp: string;
  actor: string;
  note: string;
}

export interface CommentEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  message: string;
  createdAt: string;
}

export interface FeedbackData {
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface Report {
  id: string;
  title: string;
  category: ReportCategory | string;
  description: string;
  location: string;
  building: string;
  roomOrArea: string;
  priority: ReportPriority;
  status: ReportStatus;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatar?: string;
  imageUrl?: string;
  assignedDepartment?: string;
  assignedStaff?: string;
  expectedResolutionDays?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEntry[];
  comments: CommentEntry[];
  feedback?: FeedbackData;
}

export interface NotificationItem {
  id: string;
  userId: string;
  reportId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  isRead: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  contact: string;
  activeStaffCount: number;
  openTickets: number;
  avgResolutionHours: number;
  status: 'active' | 'busy' | 'offline';
}

export interface BuildingHotspot {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  description: string;
  activeIssues: number;
  resolvedIssues: number;
}

export interface StatsSummary {
  admin: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    urgent: number;
    avgResolutionHours: number;
    satisfactionRate: number;
    categoryCounts: Record<string, number>;
    deptWorkload: Array<{ name: string; openTickets: number; resolvedTickets: number }>;
    locationCounts: Record<string, number>;
  };
  student: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    campusImpactScore: number;
  };
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string;
  department: string;
  rollNumber?: string;
  year?: string;
  points: number;
  badges: string[];
  reportsCount: number;
  resolvedCount: number;
}

export interface AIAnalysisResult {
  category: ReportCategory;
  priority: ReportPriority;
  suggestedDepartment: string;
  summary: string;
  recommendedAction: string;
  safetyWarning?: string | null;
}

export interface DuplicateWarning {
  id: string;
  title: string;
  status: ReportStatus;
  location: string;
}
