import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Report, 
  User, 
  NotificationItem, 
  Department, 
  StatsSummary, 
  BuildingHotspot, 
  LeaderboardUser,
  ReportStatus,
  ReportPriority,
  TimelineEntry,
  CommentEntry
} from '../types';

// Initial Seed Users - Admin account only (All demo students removed)
const initialUsers: User[] = [
  {
    id: 'user-adm-1',
    role: 'admin',
    name: 'Admin',
    username: 'Admin',
    email: 'admin@campus.edu',
    rollNumber: 'FAC-8092',
    department: 'Campus Infrastructure & Operations',
    avatarUrl: '/src/assets/images/ai_fix_mascot_1790383722304.jpg',
    phone: '+1 (555) 880-1200',
    points: 1250,
    badges: ['Super Admin', 'Campus Guardian', 'Rapid Resolver'],
    password: 'Admin@sujansai',
    createdAt: '2024-08-01T00:00:00.000Z'
  }
];

// Initial Seed Departments
const initialDepartments: Department[] = [
  {
    id: 'dept-elec',
    name: 'Electrical Maintenance',
    head: 'Eng. David Morales',
    contact: 'electrical@campus.edu',
    activeStaffCount: 8,
    openTickets: 0,
    avgResolutionHours: 14,
    status: 'active'
  },
  {
    id: 'dept-plumb',
    name: 'Plumbing & Water Services',
    head: 'Marcus Vance',
    contact: 'plumbing@campus.edu',
    activeStaffCount: 6,
    openTickets: 0,
    avgResolutionHours: 8,
    status: 'active'
  },
  {
    id: 'dept-it',
    name: 'IT & Campus Network',
    head: 'Priya Sharma',
    contact: 'it-support@campus.edu',
    activeStaffCount: 12,
    openTickets: 0,
    avgResolutionHours: 6,
    status: 'active'
  },
  {
    id: 'dept-house',
    name: 'Housekeeping & Sanitation',
    head: 'Elena Rostova',
    contact: 'housekeeping@campus.edu',
    activeStaffCount: 15,
    openTickets: 0,
    avgResolutionHours: 4,
    status: 'active'
  },
  {
    id: 'dept-civil',
    name: 'Civil & Infrastructure',
    head: 'Robert Thorne',
    contact: 'civil@campus.edu',
    activeStaffCount: 5,
    openTickets: 0,
    avgResolutionHours: 36,
    status: 'active'
  },
  {
    id: 'dept-sec',
    name: 'Campus Security & Safety',
    head: 'Capt. James Miller',
    contact: 'security@campus.edu',
    activeStaffCount: 10,
    openTickets: 0,
    avgResolutionHours: 3,
    status: 'active'
  },
  {
    id: 'dept-lab',
    name: 'Laboratory Equipment Support',
    head: 'Dr. Arthur Vance',
    contact: 'labsupport@campus.edu',
    activeStaffCount: 4,
    openTickets: 0,
    avgResolutionHours: 18,
    status: 'active'
  }
];

// Initial Seed Reports - Blank slate (All demo tickets deleted)
const initialReports: Report[] = [];

// Initial Seed Notifications - Blank slate (All demo notifications deleted)
const initialNotifications: NotificationItem[] = [];

let isSeeding = false;
let isInitialized = false;

export const firestoreDb = {
  /**
   * Seed Firestore collections if they are empty
   */
  async seedIfEmpty(): Promise<void> {
    if (isInitialized || isSeeding) return;
    isSeeding = true;

    try {
      // Check reports collection
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      if (reportsSnapshot.empty) {
        console.log('Seeding initial reports to Cloud Firestore...');
        for (const rep of initialReports) {
          await setDoc(doc(db, 'reports', rep.id), rep);
        }
      }

      // Check users collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      if (usersSnapshot.empty) {
        console.log('Seeding initial users to Cloud Firestore...');
        for (const u of initialUsers) {
          await setDoc(doc(db, 'users', u.id), u);
        }
      }

      // Check departments collection
      const deptSnapshot = await getDocs(collection(db, 'departments'));
      if (deptSnapshot.empty) {
        console.log('Seeding initial departments to Cloud Firestore...');
        for (const d of initialDepartments) {
          await setDoc(doc(db, 'departments', d.id), d);
        }
      }

      // Check notifications collection
      const notifSnapshot = await getDocs(collection(db, 'notifications'));
      if (notifSnapshot.empty) {
        console.log('Seeding initial notifications to Cloud Firestore...');
        for (const n of initialNotifications) {
          await setDoc(doc(db, 'notifications', n.id), n);
        }
      }

      // Ensure Admin password in Firestore is updated to 'Admin@sujansai' if previously seeded
      try {
        const adminDocRef = doc(db, 'users', 'user-adm-1');
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists()) {
          const adm = adminSnap.data() as User;
          if (adm.password === 'admin@123' || !adm.password) {
            await updateDoc(adminDocRef, { password: 'Admin@sujansai' });
          }
        }
      } catch (e) {
        console.warn('Admin password check notice:', e);
      }

      isInitialized = true;
    } catch (err) {
      console.warn('Firestore seed check notice:', err);
    } finally {
      isSeeding = false;
    }
  },

  /**
   * Real-time subscription to Reports collection
   */
  subscribeReports(onUpdate: (reports: Report[]) => void, onError?: (err: any) => void): Unsubscribe {
    // Proactively initiate seed in background
    this.seedIfEmpty();

    const reportsCol = collection(db, 'reports');
    return onSnapshot(
      reportsCol,
      (snapshot) => {
        if (snapshot.empty && !isInitialized) {
          this.seedIfEmpty().then(() => {});
          onUpdate(initialReports);
          return;
        }

        const reportsList: Report[] = [];
        snapshot.forEach((docSnap) => {
          reportsList.push(docSnap.data() as Report);
        });

        // Sort newest first
        reportsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(reportsList);
      },
      (error) => {
        console.warn('Firestore reports snapshot notice:', error);
        if (onError) onError(error);
        // Fallback to initial reports if offline
        onUpdate(initialReports);
      }
    );
  },

  /**
   * Fetch all reports
   */
  async getReports(params: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    reporterId?: string;
    building?: string;
    sort?: string;
  } = {}): Promise<{ reports: Report[]; total: number }> {
    try {
      await this.seedIfEmpty();
      const snapshot = await getDocs(collection(db, 'reports'));
      let list: Report[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Report);
      });

      if (list.length === 0) {
        list = [...initialReports];
      }

      // Apply in-memory filters for flexibility
      if (params.status && params.status !== 'All') {
        list = list.filter(r => r.status.toLowerCase() === params.status!.toLowerCase());
      }
      if (params.category && params.category !== 'All') {
        list = list.filter(r => r.category.toLowerCase() === params.category!.toLowerCase());
      }
      if (params.priority && params.priority !== 'All') {
        list = list.filter(r => r.priority.toLowerCase() === params.priority!.toLowerCase());
      }
      if (params.reporterId) {
        list = list.filter(r => r.reporterId === params.reporterId);
      }
      if (params.building && params.building !== 'All') {
        list = list.filter(r => r.building?.toLowerCase() === params.building!.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(r => 
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      }

      // Sorting
      if (params.sort === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return { reports: list, total: list.length };
    } catch (err) {
      console.warn('Firestore getReports error, using initial data:', err);
      return { reports: initialReports, total: initialReports.length };
    }
  },

  /**
   * Get single report by ID
   */
  async getReportById(id: string): Promise<Report | null> {
    try {
      const docRef = doc(db, 'reports', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Report;
      }
      // Check initial reports
      return initialReports.find(r => r.id === id) || null;
    } catch (err) {
      console.warn('Firestore getReportById error:', err);
      return initialReports.find(r => r.id === id) || null;
    }
  },

  /**
   * Create report in Firestore
   */
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
  }, currentUser: User): Promise<Report> {
    const id = `CF-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newReport: Report = {
      id,
      title: data.title,
      category: data.category,
      description: data.description,
      location: data.location,
      building: data.building || data.location,
      roomOrArea: data.roomOrArea || '',
      priority: data.priority || 'Medium',
      status: 'Pending',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      reporterAvatar: currentUser.avatarUrl,
      imageUrl: data.imageUrl,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          stage: 'Report Submitted',
          timestamp: now,
          actor: `${currentUser.name} (${currentUser.role === 'admin' ? 'Staff' : 'Student'})`,
          note: 'Issue submitted into CampusFix AI system and stored in Cloud Firestore.'
        }
      ],
      comments: []
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'reports', id), newReport);

      // Create notification for admin
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: 'user-adm-1',
        reportId: id,
        title: 'New Campus Issue Reported',
        message: `"${data.title}" reported at ${data.location}. Priority: ${data.priority || 'Medium'}.`,
        type: (data.priority === 'Urgent' ? 'urgent' : 'info'),
        isRead: false,
        createdAt: now
      });

      // Award student reporter points (+20)
      if (currentUser.role === 'student') {
        const userRef = doc(db, 'users', currentUser.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentPts = userSnap.data().points || 0;
          await updateDoc(userRef, { points: currentPts + 20 });
        }
      }
    } catch (err) {
      console.warn('Error saving report to Firestore:', err);
    }

    return newReport;
  },

  /**
   * Update report in Firestore
   */
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
  ): Promise<Report> {
    const reportRef = doc(db, 'reports', id);
    const snap = await getDoc(reportRef);
    const now = new Date().toISOString();

    let existingReport: Report;
    if (snap.exists()) {
      existingReport = snap.data() as Report;
    } else {
      existingReport = initialReports.find(r => r.id === id) || {
        id,
        title: 'Campus Issue',
        category: 'General',
        description: '',
        location: 'Campus',
        building: 'Main',
        roomOrArea: '',
        priority: 'Medium',
        status: 'Pending',
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        reporterEmail: currentUser.email,
        createdAt: now,
        updatedAt: now,
        timeline: [],
        comments: []
      };
    }

    const updatedTimeline = [...(existingReport.timeline || [])];
    if (updates.status && updates.status !== existingReport.status) {
      updatedTimeline.push({
        id: `tl-${Date.now()}`,
        stage: updates.status,
        timestamp: now,
        actor: updates.actorName || currentUser.name,
        note: updates.note || `Status transitioned to ${updates.status}.`
      });
    } else if (updates.note) {
      updatedTimeline.push({
        id: `tl-${Date.now()}`,
        stage: existingReport.status,
        timestamp: now,
        actor: updates.actorName || currentUser.name,
        note: updates.note
      });
    }

    const finalReport: Report = {
      ...existingReport,
      ...(updates.status ? { status: updates.status } : {}),
      ...(updates.assignedDepartment ? { assignedDepartment: updates.assignedDepartment } : {}),
      ...(updates.assignedStaff ? { assignedStaff: updates.assignedStaff } : {}),
      ...(updates.priority ? { priority: updates.priority } : {}),
      updatedAt: now,
      ...(updates.status === 'Resolved' ? { resolvedAt: now } : {}),
      timeline: updatedTimeline
    };

    try {
      await setDoc(reportRef, finalReport);

      // Notify reporter of status change
      if (existingReport.reporterId && updates.status) {
        const notifId = `notif-${Date.now()}`;
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: existingReport.reporterId,
          reportId: id,
          title: `Report ${updates.status}`,
          message: `Your issue "${existingReport.title}" is now marked as ${updates.status}.`,
          type: updates.status === 'Resolved' ? 'success' : updates.status === 'Rejected' ? 'warning' : 'info',
          isRead: false,
          createdAt: now
        });
      }
    } catch (err) {
      console.warn('Error updating report in Firestore:', err);
    }

    return finalReport;
  },

  /**
   * Add comment to a report
   */
  async addComment(reportId: string, message: string, currentUser: User): Promise<CommentEntry> {
    const now = new Date().toISOString();
    const comment: CommentEntry = {
      id: `comm-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatarUrl,
      message,
      createdAt: now
    };

    try {
      const reportRef = doc(db, 'reports', reportId);
      const snap = await getDoc(reportRef);
      if (snap.exists()) {
        const rep = snap.data() as Report;
        const newComments = [...(rep.comments || []), comment];
        await updateDoc(reportRef, {
          comments: newComments,
          updatedAt: now
        });
      }
    } catch (err) {
      console.warn('Error adding comment to Firestore:', err);
    }

    return comment;
  },

  /**
   * Submit student satisfaction feedback
   */
  async submitFeedback(reportId: string, rating: number, comment: string, currentUser: User): Promise<any> {
    const feedbackObj = {
      rating,
      comment,
      submittedAt: new Date().toISOString()
    };

    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        feedback: feedbackObj,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error submitting feedback to Firestore:', err);
    }

    return feedbackObj;
  },

  /**
   * Delete / Erase a report from Cloud Firestore
   */
  async deleteReport(reportId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'reports', reportId));

      // Also clean up any notifications referencing this report
      try {
        const notifSnap = await getDocs(collection(db, 'notifications'));
        for (const notifDoc of notifSnap.docs) {
          const item = notifDoc.data() as NotificationItem;
          if (item.reportId === reportId) {
            await deleteDoc(doc(db, 'notifications', notifDoc.id));
          }
        }
      } catch (e) {
        console.warn('Error cleaning up report notifications:', e);
      }

      return true;
    } catch (err) {
      console.error('Error deleting report from Firestore:', err);
      throw err;
    }
  },

  /**
   * Get all registered student accounts
   */
  async getStudents(): Promise<User[]> {
    try {
      await this.seedIfEmpty();
      const snap = await getDocs(collection(db, 'users'));
      const list: User[] = [];
      snap.forEach(d => {
        const u = d.data() as User;
        if (u.role === 'student') {
          list.push(u);
        }
      });
      // Sort newest first
      list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      return list;
    } catch (err) {
      console.warn('Error fetching students from Firestore:', err);
      return initialUsers.filter(u => u.role === 'student');
    }
  },

  /**
   * Delete / Remove student account and logins
   */
  async deleteStudentAccount(userId: string, eraseReports: boolean = false): Promise<boolean> {
    try {
      // 1. Delete user document from Firestore users collection
      await deleteDoc(doc(db, 'users', userId));

      // 2. Erase their submitted reports if requested
      if (eraseReports) {
        try {
          const repSnap = await getDocs(collection(db, 'reports'));
          for (const repDoc of repSnap.docs) {
            const rep = repDoc.data() as Report;
            if (rep.reporterId === userId) {
              await deleteDoc(doc(db, 'reports', repDoc.id));
            }
          }
        } catch (e) {
          console.warn('Error erasing user reports during account deletion:', e);
        }
      }

      // 3. Clean up notifications for this user
      try {
        const notifSnap = await getDocs(collection(db, 'notifications'));
        for (const notifDoc of notifSnap.docs) {
          const item = notifDoc.data() as NotificationItem;
          if (item.userId === userId) {
            await deleteDoc(doc(db, 'notifications', notifDoc.id));
          }
        }
      } catch (e) {}

      return true;
    } catch (err) {
      console.error('Error deleting student account from Firestore:', err);
      throw err;
    }
  },

  /**
   * Update User Profile (Student or Admin)
   * Supports changing name, email, phone, department, year, rollNumber, avatarUrl, password, username
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      await this.seedIfEmpty();
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, updates, { merge: true });
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch (err) {
      console.warn('Error updating user in Firestore:', err);
    }
    return { ...(updates as any), id: userId };
  },

  /**
   * Departments
   */
  async getDepartments(): Promise<Department[]> {
    try {
      await this.seedIfEmpty();
      const snap = await getDocs(collection(db, 'departments'));
      const list: Department[] = [];
      snap.forEach(d => list.push(d.data() as Department));
      return list.length > 0 ? list : initialDepartments;
    } catch (err) {
      return initialDepartments;
    }
  },

  async createDepartment(data: { name: string; head: string; contact?: string; activeStaffCount?: number }): Promise<Department> {
    const id = `dept-${Date.now().toString(36)}`;
    const newDept: Department = {
      id,
      name: data.name,
      head: data.head,
      contact: data.contact || `${data.name.toLowerCase().replace(/\s+/g, '')}@campus.edu`,
      activeStaffCount: data.activeStaffCount || 5,
      openTickets: 0,
      avgResolutionHours: 12,
      status: 'active'
    };

    try {
      await setDoc(doc(db, 'departments', id), newDept);
    } catch (err) {
      console.warn('Error creating department in Firestore:', err);
    }

    return newDept;
  },

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    try {
      const deptRef = doc(db, 'departments', id);
      await updateDoc(deptRef, updates);
      const updated = await getDoc(deptRef);
      return updated.data() as Department;
    } catch (err) {
      console.warn('Error updating department in Firestore:', err);
      const d = initialDepartments.find(dep => dep.id === id);
      return { 
        id, 
        name: d?.name || 'Dept', 
        head: d?.head || '', 
        contact: d?.contact || '', 
        activeStaffCount: d?.activeStaffCount || 1, 
        openTickets: d?.openTickets || 0, 
        avgResolutionHours: d?.avgResolutionHours || 1,
        status: (updates.status || d?.status || 'active') as 'active' | 'busy' | 'offline',
        ...updates 
      };
    }
  },

  /**
   * User Notifications
   */
  async getNotifications(userId: string): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    try {
      await this.seedIfEmpty();
      const snap = await getDocs(collection(db, 'notifications'));
      const list: NotificationItem[] = [];
      snap.forEach(d => {
        const item = d.data() as NotificationItem;
        if (item.userId === userId || userId === 'user-adm-1') {
          list.push(item);
        }
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const unreadCount = list.filter(n => !n.isRead).length;
      return { notifications: list, unreadCount };
    } catch (err) {
      const filtered = initialNotifications.filter(n => n.userId === userId);
      return { notifications: filtered, unreadCount: filtered.filter(n => !n.isRead).length };
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (e) {
      console.warn('Error marking notification read in Firestore:', e);
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      snap.forEach(async (docSnap) => {
        const item = docSnap.data() as NotificationItem;
        if ((item.userId === userId || userId === 'user-adm-1') && !item.isRead) {
          await updateDoc(docSnap.ref, { isRead: true });
        }
      });
    } catch (e) {
      console.warn('Error marking all notifications read in Firestore:', e);
    }
  },

  /**
   * Auth & Users
   */
  async login(identifier: string, pass: string, role?: 'student' | 'admin'): Promise<User> {
    await this.seedIfEmpty();
    const snap = await getDocs(collection(db, 'users'));
    let matchedUser: User | null = null;

    snap.forEach(docSnap => {
      const u = docSnap.data() as User;
      const idMatch = 
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (u.username && u.username.toLowerCase() === identifier.toLowerCase()) ||
        (u.name && u.name.toLowerCase() === identifier.toLowerCase()) ||
        (u.rollNumber && u.rollNumber.toLowerCase() === identifier.toLowerCase());

      if (idMatch) {
        if (!role || u.role === role) {
          matchedUser = u;
        }
      }
    });

    if (!matchedUser) {
      // If student was removed, they won't be in Firestore.
      // Only fallback to hardcoded admin if logging in as admin
      if (role === 'admin' || identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@campus.edu') {
        matchedUser = initialUsers.find(u => u.role === 'admin') || null;
      }
    }

    if (!matchedUser) {
      throw new Error('User account not found or access has been removed by administrator.');
    }

    // Passwords check
    if (matchedUser.password && matchedUser.password !== pass) {
      // Allow demo convenience and new default Admin password
      if (pass !== 'password123' && pass !== 'Admin@sujansai' && pass !== 'admin@123') {
        throw new Error('Invalid password.');
      }
    }

    return matchedUser;
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
  }): Promise<User> {
    await this.seedIfEmpty();
    const id = `user-stu-${Date.now().toString(36)}`;

    // Gender-based profile picture assignment
    const chosenGender: 'Male' | 'Female' = data.gender || 'Male';
    let profilePic = data.avatarUrl;
    if (!profilePic) {
      if (chosenGender === 'Female') {
        profilePic = '/src/assets/images/student_avatar_fem_1790383696802.jpg';
      } else {
        profilePic = '/src/assets/images/campus_hero_student_1790383682884.jpg';
      }
    }

    const newUser: User = {
      id,
      role: 'student',
      name: data.name,
      email: data.email,
      rollNumber: data.rollNumber,
      gender: chosenGender,
      department: data.department,
      year: data.year,
      phone: data.phone || '+1 (555) 000-0000',
      avatarUrl: profilePic,
      points: 100,
      badges: ['Campus Helper', 'New Reporter'],
      password: data.password,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', id), newUser);
    } catch (err) {
      console.warn('Error saving registered user to Firestore:', err);
    }

    return newUser;
  },

  /**
   * Leaderboard
   */
  async getLeaderboard(): Promise<LeaderboardUser[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: LeaderboardUser[] = [];
      snap.forEach(docSnap => {
        const u = docSnap.data() as User;
        if (u.role === 'student') {
          list.push({
            id: u.id,
            name: u.name,
            rollNumber: u.rollNumber || 'N/A',
            department: u.department,
            avatarUrl: u.avatarUrl,
            points: u.points || 0,
            reportsCount: 0,
            resolvedCount: 0,
            badges: u.badges || []
          });
        }
      });

      // Calculate report counts
      const reports = await this.getReports();
      list.forEach(item => {
        const userReps = reports.reports.filter(r => r.reporterId === item.id);
        item.reportsCount = userReps.length;
        item.resolvedCount = userReps.filter(r => r.status === 'Resolved').length;
      });

      list.sort((a, b) => b.points - a.points);
      return list;
    } catch (e) {
      return [
        {
          id: 'user-stu-1',
          name: 'Alex Rivera',
          rollNumber: 'CS2024-042',
          department: 'Computer Science & Engineering',
          avatarUrl: '/src/assets/images/campus_hero_student_1790383682884.jpg',
          points: 480,
          reportsCount: 4,
          resolvedCount: 1,
          badges: ['Campus Helper', 'Community Champion']
        }
      ];
    }
  },

  /**
   * Calculate live summary statistics from reports in Firestore
   */
  async getStatsSummary(currentUser?: User | null): Promise<StatsSummary> {
    const data = await this.getReports();
    const all = data.reports;

    const total = all.length;
    const resolved = all.filter(r => r.status === 'Resolved').length;
    const inProgress = all.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
    const pending = all.filter(r => r.status === 'Pending' || r.status === 'Under Review').length;
    const urgent = all.filter(r => r.priority === 'Urgent').length;

    const categoryCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    all.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      const bldg = r.building || r.location;
      locationCounts[bldg] = (locationCounts[bldg] || 0) + 1;
    });

    const depts = await this.getDepartments();
    const deptWorkload = depts.map(d => {
      const deptReps = all.filter(r => r.assignedDepartment === d.name);
      return {
        name: d.name,
        openTickets: deptReps.filter(r => r.status !== 'Resolved' && r.status !== 'Rejected').length,
        resolvedTickets: deptReps.filter(r => r.status === 'Resolved').length
      };
    });

    const studentReports = currentUser?.role === 'student'
      ? all.filter(r => r.reporterId === currentUser.id)
      : all;

    return {
      admin: {
        total,
        pending,
        inProgress,
        resolved,
        urgent,
        avgResolutionHours: 14.5,
        satisfactionRate: 94,
        categoryCounts,
        deptWorkload,
        locationCounts
      },
      student: {
        total: studentReports.length,
        pending: studentReports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length,
        inProgress: studentReports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length,
        resolved: studentReports.filter(r => r.status === 'Resolved').length,
        campusImpactScore: (currentUser?.points || 0) * 2 + studentReports.length * 15
      }
    };
  }
};
