import { 
  User, 
  Report, 
  NotificationItem, 
  Department, 
  StatsSummary, 
  BuildingHotspot, 
  LeaderboardUser, 
  AIAnalysisResult, 
  DuplicateWarning,
  ReportStatus,
  ReportPriority
} from '../types';
import { firestoreDb } from './firestoreDb';

const API_BASE = '/api';

export const api = {
  // Auth backed by Cloud Firestore
  async login(identifier: string, password: string, role?: 'student' | 'admin'): Promise<{ user: User; token: string }> {
    try {
      const user = await firestoreDb.login(identifier, password, role);
      return { user, token: `cf-token-${user.id}` };
    } catch (err: any) {
      // Fallback to server route if needed
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password, role }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {}
      throw new Error(err.message || 'Login failed. Invalid credentials.');
    }
  },

  async register(data: {
    name: string;
    email: string;
    rollNumber: string;
    gender?: 'Male' | 'Female';
    department: string;
    year: string;
    phone?: string;
    password: string;
    avatarUrl?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const user = await firestoreDb.register(data);
      return { user, token: `cf-token-${user.id}` };
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed');
    }
  },

  async getMe(userId?: string): Promise<{ user: User }> {
    if (!userId) throw new Error('User ID required');
    const user = await firestoreDb.login(userId, '', undefined);
    return { user };
  },

  // Reports backed by Cloud Firestore
  async getReports(params: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    reporterId?: string;
    building?: string;
    sort?: string;
  } = {}): Promise<{ reports: Report[]; total: number }> {
    return firestoreDb.getReports(params);
  },

  async getReportById(id: string): Promise<{ report: Report }> {
    const report = await firestoreDb.getReportById(id);
    if (!report) throw new Error(`Report ${id} not found`);
    return { report };
  },

  async createReport(data: {
    title: string;
    category: string;
    description: string;
    location: string;
    building?: string;
    roomOrArea?: string;
    priority?: ReportPriority;
    imageUrl?: string;
    reporterId: string;
  }, currentUser: User): Promise<{ report: Report; message: string }> {
    const report = await firestoreDb.createReport(data, currentUser);
    return { report, message: 'Report created successfully and stored in Cloud Firestore.' };
  },

  async updateReport(
    id: string,
    updates: {
      status?: ReportStatus;
      assignedDepartment?: string;
      assignedStaff?: string;
      priority?: ReportPriority;
      note?: string;
      actorName?: string;
    },
    currentUser: User
  ): Promise<{ report: Report; message: string }> {
    const report = await firestoreDb.updateReport(id, updates, currentUser);
    return { report, message: 'Report updated in Cloud Firestore.' };
  },

  async deleteReport(id: string, currentUser?: User): Promise<{ success: boolean; message: string }> {
    await firestoreDb.deleteReport(id);
    return { success: true, message: 'Report erased from Cloud Firestore.' };
  },

  // Student accounts management (Admin)
  async getStudents(): Promise<{ students: User[] }> {
    const students = await firestoreDb.getStudents();
    return { students };
  },

  async deleteStudentAccount(userId: string, eraseReports: boolean = false, currentUser?: User): Promise<{ success: boolean; message: string }> {
    await firestoreDb.deleteStudentAccount(userId, eraseReports);
    return { success: true, message: 'Student account and login removed successfully.' };
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<{ user: User; message: string }> {
    const user = await firestoreDb.updateUser(userId, updates);
    return { user, message: 'Profile updated successfully.' };
  },

  async addComment(
    reportId: string,
    message: string,
    currentUser: User
  ): Promise<{ comment: any }> {
    const comment = await firestoreDb.addComment(reportId, message, currentUser);
    return { comment };
  },

  async submitFeedback(
    reportId: string,
    rating: number,
    comment: string,
    currentUser: User
  ): Promise<{ feedback: any; message: string }> {
    const feedback = await firestoreDb.submitFeedback(reportId, rating, comment, currentUser);
    return { feedback, message: 'Feedback submitted successfully' };
  },

  // Stats backed by Cloud Firestore
  async getStatsSummary(currentUser?: User | null): Promise<StatsSummary> {
    return firestoreDb.getStatsSummary(currentUser);
  },

  // Campus Map Hotspots computed from Firestore data
  async getMapHotspots(): Promise<{ buildings: BuildingHotspot[] }> {
    const { reports } = await firestoreDb.getReports();
    
    // Campus buildings list with predefined coordinates for SVG interactive map
    const campusBuildings = [
      { id: 'bldg-1', name: 'Central Library', type: 'Academic', x: 28, y: 35, description: 'Quiet study zones, computing labs, reading halls' },
      { id: 'bldg-2', name: 'Main Academic Block', type: 'Academic', x: 50, y: 25, description: 'Faculty offices, smart classrooms, lecture halls 100-400' },
      { id: 'bldg-3', name: 'Tech & Science Complex', type: 'Academic', x: 72, y: 38, description: 'Computing servers, hardware labs, research robotics' },
      { id: 'bldg-4', name: 'Student Union & Canteen', type: 'Dining / Social', x: 38, y: 62, description: 'Main dining hall, clubs, student council' },
      { id: 'bldg-5', name: 'Hostel Block A (North)', type: 'Residential', x: 60, y: 70, description: 'Student resident halls, common laundry' },
      { id: 'bldg-6', name: 'Hostel Block B', type: 'Residential', x: 80, y: 68, description: 'East wing student housing & courtyard' },
      { id: 'bldg-7', name: 'Sports Complex & Gym', type: 'Athletics', x: 18, y: 75, description: 'Indoor badminton, gymnasium, swimming pool' },
      { id: 'bldg-8', name: 'Administration Building', type: 'Administrative', x: 45, y: 48, description: 'Registrar, accounts, campus safety headquarters' }
    ];

    const buildings: BuildingHotspot[] = campusBuildings.map((b) => {
      const matchingReports = reports.filter(r => 
        (r.building && r.building.toLowerCase() === b.name.toLowerCase()) ||
        r.location.toLowerCase().includes(b.name.toLowerCase())
      );

      const activeIssues = matchingReports.filter(r => r.status !== 'Resolved' && r.status !== 'Rejected').length;
      const resolvedIssues = matchingReports.filter(r => r.status === 'Resolved').length;

      return {
        id: b.id,
        name: b.name,
        type: b.type,
        x: b.x,
        y: b.y,
        description: b.description,
        activeIssues,
        resolvedIssues
      };
    });

    return { buildings };
  },

  // Departments backed by Cloud Firestore
  async getDepartments(): Promise<{ departments: Department[] }> {
    const departments = await firestoreDb.getDepartments();
    return { departments };
  },

  async createDepartment(data: { name: string; head: string; contact?: string; activeStaffCount?: number }, currentUser: User): Promise<{ department: Department }> {
    const department = await firestoreDb.createDepartment(data);
    return { department };
  },

  async updateDepartment(id: string, updates: Partial<Department>, currentUser: User): Promise<{ department: Department }> {
    const department = await firestoreDb.updateDepartment(id, updates);
    return { department };
  },

  // Notifications backed by Cloud Firestore
  async getNotifications(currentUser: User): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return firestoreDb.getNotifications(currentUser.id);
  },

  async markNotificationRead(id: string, currentUser: User): Promise<void> {
    await firestoreDb.markNotificationRead(id);
  },

  async markAllNotificationsRead(currentUser: User): Promise<void> {
    await firestoreDb.markAllNotificationsRead(currentUser.id);
  },

  // Leaderboard backed by Cloud Firestore
  async getLeaderboard(): Promise<{ leaderboard: LeaderboardUser[] }> {
    const leaderboard = await firestoreDb.getLeaderboard();
    return { leaderboard };
  },

  // AI features routed to backend Gemini API
  async analyzeIssue(data: { title: string; description: string; location?: string }): Promise<{
    aiResult: AIAnalysisResult;
    duplicateWarning: DuplicateWarning | null;
  }> {
    const res = await fetch(`${API_BASE}/ai/analyze-issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('AI analysis failed');
    return res.json();
  },

  async chatWithAI(message: string, history: any[] = []): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory: history }),
    });
    if (!res.ok) throw new Error('AI chat failed');
    return res.json();
  }
};
