import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initial Seed Data & In-memory Store
interface User {
  id: string;
  role: 'student' | 'admin';
  name: string;
  username?: string;
  email: string;
  rollNumber?: string;
  department: string;
  year?: string;
  avatarUrl: string;
  phone?: string;
  points: number;
  badges: string[];
  password: string;
}

interface TimelineEntry {
  id: string;
  stage: 'Report Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  timestamp: string;
  actor: string;
  note: string;
}

interface CommentEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'admin';
  userAvatar?: string;
  message: string;
  createdAt: string;
}

interface Report {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  building: string;
  roomOrArea: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
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
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
}

interface NotificationItem {
  id: string;
  userId: string;
  reportId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  isRead: boolean;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  contact: string;
  activeStaffCount: number;
  openTickets: number;
  avgResolutionHours: number;
  status: 'active' | 'busy' | 'offline';
}

// Initial Users
const users: User[] = [
  {
    id: 'user-stu-1',
    role: 'student',
    name: 'Alex Rivera',
    email: 'alex.student@campus.edu',
    rollNumber: 'CS2024-042',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    avatarUrl: '/src/assets/images/campus_hero_student_1790383682884.jpg',
    phone: '+1 (555) 382-9012',
    points: 480,
    badges: ['Campus Helper', 'Problem Solver', 'Community Champion', 'Fast Reporter'],
    password: 'password123',
  },
  {
    id: 'user-stu-2',
    role: 'student',
    name: 'Maya Patel',
    email: 'maya.patel@campus.edu',
    rollNumber: 'EE2023-018',
    department: 'Electrical & Electronics',
    year: '4th Year',
    avatarUrl: '/src/assets/images/student_avatar_fem_1790383696802.jpg',
    phone: '+1 (555) 491-7788',
    points: 320,
    badges: ['Campus Helper', 'Guardian Eye'],
    password: 'password123',
  },
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
    password: 'admin@123',
  }
];

// Initial Departments
let departments: Department[] = [
  {
    id: 'dept-elec',
    name: 'Electrical Maintenance',
    head: 'Eng. David Morales',
    contact: 'electrical@campus.edu',
    activeStaffCount: 8,
    openTickets: 3,
    avgResolutionHours: 14,
    status: 'active'
  },
  {
    id: 'dept-plumb',
    name: 'Plumbing & Water Services',
    head: 'Marcus Vance',
    contact: 'plumbing@campus.edu',
    activeStaffCount: 6,
    openTickets: 2,
    avgResolutionHours: 8,
    status: 'active'
  },
  {
    id: 'dept-it',
    name: 'IT & Campus Network',
    head: 'Priya Sharma',
    contact: 'it-support@campus.edu',
    activeStaffCount: 12,
    openTickets: 4,
    avgResolutionHours: 6,
    status: 'active'
  },
  {
    id: 'dept-house',
    name: 'Housekeeping & Sanitation',
    head: 'Elena Rostova',
    contact: 'housekeeping@campus.edu',
    activeStaffCount: 15,
    openTickets: 1,
    avgResolutionHours: 4,
    status: 'active'
  },
  {
    id: 'dept-civil',
    name: 'Civil & Infrastructure',
    head: 'Robert Thorne',
    contact: 'civil@campus.edu',
    activeStaffCount: 5,
    openTickets: 2,
    avgResolutionHours: 36,
    status: 'busy'
  },
  {
    id: 'dept-sec',
    name: 'Campus Security & Safety',
    head: 'Capt. James Miller',
    contact: 'security@campus.edu',
    activeStaffCount: 10,
    openTickets: 1,
    avgResolutionHours: 3,
    status: 'active'
  },
  {
    id: 'dept-lab',
    name: 'Laboratory Equipment Support',
    head: 'Dr. Arthur Vance',
    contact: 'labsupport@campus.edu',
    activeStaffCount: 4,
    openTickets: 1,
    avgResolutionHours: 18,
    status: 'active'
  }
];

// Initial Reports
let reports: Report[] = [
  {
    id: 'CF-2024-1001',
    title: 'Flickering High-Bay Light in 2nd Floor Reading Hall',
    category: 'Electrical',
    description: 'The overhead fluorescent and LED bay in reading zone B has been buzzing loudly and flickering intermittently, making it difficult for students to study in the evening hours.',
    location: 'Central Library',
    building: 'Central Library',
    roomOrArea: '2nd Floor, Quiet Reading Zone B',
    priority: 'High',
    status: 'In Progress',
    reporterId: 'user-stu-1',
    reporterName: 'Alex Rivera',
    reporterEmail: 'alex.student@campus.edu',
    reporterAvatar: '/src/assets/images/campus_hero_student_1790383682884.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
    assignedDepartment: 'Electrical Maintenance',
    assignedStaff: 'Technician Ray Cooper',
    expectedResolutionDays: 1,
    createdAt: '2026-09-24T09:30:00Z',
    updatedAt: '2026-09-25T11:15:00Z',
    timeline: [
      {
        id: 'tl-1',
        stage: 'Report Submitted',
        timestamp: '2026-09-24T09:30:00Z',
        actor: 'Alex Rivera (Student)',
        note: 'Ticket submitted with photo evidence and location tag.'
      },
      {
        id: 'tl-2',
        stage: 'Under Review',
        timestamp: '2026-09-24T10:15:00Z',
        actor: 'Admin',
        note: 'AI categorization confirmed. Priority elevated to High due to midterm study hours.'
      },
      {
        id: 'tl-3',
        stage: 'Assigned',
        timestamp: '2026-09-24T14:00:00Z',
        actor: 'Operations Desk',
        note: 'Dispatched to Electrical Maintenance unit.'
      },
      {
        id: 'tl-4',
        stage: 'In Progress',
        timestamp: '2026-09-25T11:15:00Z',
        actor: 'Technician Ray Cooper',
        note: 'Ballast replacement underway; waiting for specialized ladder.'
      }
    ],
    comments: [
      {
        id: 'comm-1',
        userId: 'user-stu-1',
        userName: 'Alex Rivera',
        userRole: 'student',
        userAvatar: '/src/assets/images/campus_hero_student_1790383682884.jpg',
        message: 'Thanks for looking into this quickly! It is right above tables 14-18.',
        createdAt: '2026-09-24T11:00:00Z'
      },
      {
        id: 'comm-2',
        userId: 'user-adm-1',
        userName: 'Admin',
        userRole: 'admin',
        userAvatar: '/src/assets/images/ai_fix_mascot_1790383722304.jpg',
        message: 'Ray from the maintenance team is scheduled to replace the ballast by 4 PM today.',
        createdAt: '2026-09-25T11:20:00Z'
      }
    ]
  },
  {
    id: 'CF-2024-1002',
    title: 'High Pressure Water Pipe Leakage in Washroom',
    category: 'Plumbing',
    description: 'A pressurized cold water elbow joint under the middle sink is leaking heavily, causing water to pool toward the main corridor.',
    location: 'Hostel Block B',
    building: 'Hostel Block B',
    roomOrArea: 'Ground Floor East Wing Washroom',
    priority: 'Urgent',
    status: 'Under Review',
    reporterId: 'user-stu-2',
    reporterName: 'Maya Patel',
    reporterEmail: 'maya.patel@campus.edu',
    reporterAvatar: '/src/assets/images/student_avatar_fem_1790383696802.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    assignedDepartment: 'Plumbing & Water Services',
    createdAt: '2026-09-25T14:45:00Z',
    updatedAt: '2026-09-25T15:00:00Z',
    timeline: [
      {
        id: 'tl-10',
        stage: 'Report Submitted',
        timestamp: '2026-09-25T14:45:00Z',
        actor: 'Maya Patel (Student)',
        note: 'Reported immediate slip hazard.'
      },
      {
        id: 'tl-11',
        stage: 'Under Review',
        timestamp: '2026-09-25T15:00:00Z',
        actor: 'CampusFix AI Engine',
        note: 'Safety hazard detected. Marked Urgent automatically.'
      }
    ],
    comments: []
  },
  {
    id: 'CF-2024-1003',
    title: 'Severe Wi-Fi Signal Drop & High Packet Loss',
    category: 'Wi-Fi / IT',
    description: 'During CS laboratory sessions, Wi-Fi access point AP-CS-302 repeatedly drops connections for all 35 students during online evaluations.',
    location: 'Tech & Science Complex',
    building: 'Tech & Science Complex',
    roomOrArea: 'Lab 3 (3rd Floor)',
    priority: 'High',
    status: 'In Progress',
    reporterId: 'user-stu-1',
    reporterName: 'Alex Rivera',
    reporterEmail: 'alex.student@campus.edu',
    reporterAvatar: '/src/assets/images/campus_hero_student_1790383682884.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    assignedDepartment: 'IT & Campus Network',
    assignedStaff: 'Network Admin Priya',
    expectedResolutionDays: 1,
    createdAt: '2026-09-23T16:20:00Z',
    updatedAt: '2026-09-25T08:30:00Z',
    timeline: [
      {
        id: 'tl-21',
        stage: 'Report Submitted',
        timestamp: '2026-09-23T16:20:00Z',
        actor: 'Alex Rivera',
        note: 'Issue submitted with ping latency test logs.'
      },
      {
        id: 'tl-22',
        stage: 'Assigned',
        timestamp: '2026-09-24T09:00:00Z',
        actor: 'IT Helpdesk',
        note: 'Forwarded to Priya for firmware upgrade.'
      },
      {
        id: 'tl-23',
        stage: 'In Progress',
        timestamp: '2026-09-25T08:30:00Z',
        actor: 'Priya Sharma',
        note: 'Switch port rebooted. Installing secondary dual-band AP.'
      }
    ],
    comments: []
  },
  {
    id: 'CF-2024-1004',
    title: 'Damaged Wooden Park Bench with Exposed Nails',
    category: 'Road / Pathway',
    description: 'Bench along the botanical garden walkway had a cracked cedar plank with two protruding nails that could tear clothing or injure someone.',
    location: 'North Lawn Pathway',
    building: 'North Lawn & Walkways',
    roomOrArea: 'Between Library and Student Union',
    priority: 'Medium',
    status: 'Resolved',
    reporterId: 'user-stu-1',
    reporterName: 'Alex Rivera',
    reporterEmail: 'alex.student@campus.edu',
    reporterAvatar: '/src/assets/images/campus_hero_student_1790383682884.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
    assignedDepartment: 'Civil & Infrastructure',
    assignedStaff: 'Woodshop Lead Kenji',
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-22T16:00:00Z',
    resolvedAt: '2026-09-22T16:00:00Z',
    timeline: [
      {
        id: 'tl-31',
        stage: 'Report Submitted',
        timestamp: '2026-09-20T10:00:00Z',
        actor: 'Alex Rivera',
        note: 'Reported with GPS spot near magnolia tree.'
      },
      {
        id: 'tl-32',
        stage: 'Assigned',
        timestamp: '2026-09-21T09:30:00Z',
        actor: 'Civil Ops',
        note: 'Carpentry crew dispatched.'
      },
      {
        id: 'tl-33',
        stage: 'Resolved',
        timestamp: '2026-09-22T16:00:00Z',
        actor: 'Woodshop Lead Kenji',
        note: 'Old plank removed, sanded teak replacement installed and weather-sealed.'
      }
    ],
    comments: [],
    feedback: {
      rating: 5,
      comment: 'Super fast response! Walked by today and the new bench looks beautiful and safe.',
      submittedAt: '2026-09-23T08:15:00Z'
    }
  },
  {
    id: 'CF-2024-1005',
    title: 'Classroom 402 AC Unit Rattling & Blowing Warm Air',
    category: 'Classroom',
    description: 'During afternoon lectures, the split AC in room 402 emits a loud rattling vibration and fails to cool the room below 28°C.',
    location: 'Main Academic Block',
    building: 'Main Academic Block',
    roomOrArea: 'Room 402, 4th Floor',
    priority: 'Medium',
    status: 'Assigned',
    reporterId: 'user-stu-2',
    reporterName: 'Maya Patel',
    reporterEmail: 'maya.patel@campus.edu',
    reporterAvatar: '/src/assets/images/student_avatar_fem_1790383696802.jpg',
    assignedDepartment: 'Electrical Maintenance',
    createdAt: '2026-09-24T13:10:00Z',
    updatedAt: '2026-09-25T09:40:00Z',
    timeline: [
      {
        id: 'tl-41',
        stage: 'Report Submitted',
        timestamp: '2026-09-24T13:10:00Z',
        actor: 'Maya Patel',
        note: 'Logged after Physics lecture.'
      },
      {
        id: 'tl-42',
        stage: 'Assigned',
        timestamp: '2026-09-25T09:40:00Z',
        actor: 'Admin',
        note: 'Scheduled for filter and compressor refrigerant check.'
      }
    ],
    comments: []
  },
  {
    id: 'CF-2024-1006',
    title: 'Overflowing Recycling Bins Outside Student Canteen',
    category: 'Cleanliness',
    description: 'The dual recycling and compost receptacles near the outdoor patio are overflowing with food trays and beverage cups.',
    location: 'Student Union & Canteen',
    building: 'Student Union & Canteen',
    roomOrArea: 'Outdoor Dining Patio',
    priority: 'Medium',
    status: 'Pending',
    reporterId: 'user-stu-1',
    reporterName: 'Alex Rivera',
    reporterEmail: 'alex.student@campus.edu',
    reporterAvatar: '/src/assets/images/campus_hero_student_1790383682884.jpg',
    assignedDepartment: 'Housekeeping & Sanitation',
    createdAt: '2026-09-25T16:10:00Z',
    updatedAt: '2026-09-25T16:10:00Z',
    timeline: [
      {
        id: 'tl-51',
        stage: 'Report Submitted',
        timestamp: '2026-09-25T16:10:00Z',
        actor: 'Alex Rivera',
        note: 'Reported after lunch rush.'
      }
    ],
    comments: []
  },
  {
    id: 'CF-2024-1007',
    title: 'North Gate Barrier Arm Sensor Sticking Down',
    category: 'Security',
    description: 'The automated RFID barrier arm at the vehicle entrance fails to rise smoothly, causing small bicycle and scooter traffic jams during morning arrival.',
    location: 'Campus Security & Gate',
    building: 'Main North Entrance',
    roomOrArea: 'Lane 1 Barrier Gate',
    priority: 'High',
    status: 'Assigned',
    reporterId: 'user-stu-2',
    reporterName: 'Maya Patel',
    reporterEmail: 'maya.patel@campus.edu',
    reporterAvatar: '/src/assets/images/student_avatar_fem_1790383696802.jpg',
    assignedDepartment: 'Campus Security & Safety',
    createdAt: '2026-09-24T08:15:00Z',
    updatedAt: '2026-09-25T07:20:00Z',
    timeline: [
      {
        id: 'tl-61',
        stage: 'Report Submitted',
        timestamp: '2026-09-24T08:15:00Z',
        actor: 'Maya Patel',
        note: 'Reported gate delay.'
      },
      {
        id: 'tl-62',
        stage: 'Assigned',
        timestamp: '2026-09-25T07:20:00Z',
        actor: 'Capt. James Miller',
        note: 'Optical sensor recalibration planned.'
      }
    ],
    comments: []
  },
  {
    id: 'CF-2024-1008',
    title: 'Broken Lab Fume Hood Blower Switch in Chem Lab 1',
    category: 'Laboratory',
    description: 'Fume hood #4 in Organic Chemistry lab has a stuck motor toggle switch that fails to engage negative ventilation pressure.',
    location: 'Tech & Science Complex',
    building: 'Tech & Science Complex',
    roomOrArea: 'Chemistry Wing, Lab 104',
    priority: 'Urgent',
    status: 'Resolved',
    reporterId: 'user-stu-1',
    reporterName: 'Alex Rivera',
    reporterEmail: 'alex.student@campus.edu',
    reporterAvatar: '/src/assets/images/campus_hero_student_1790383682884.jpg',
    assignedDepartment: 'Laboratory Equipment Support',
    assignedStaff: 'Safety Specialist Dr. Arthur',
    createdAt: '2026-09-18T11:00:00Z',
    updatedAt: '2026-09-19T15:30:00Z',
    resolvedAt: '2026-09-19T15:30:00Z',
    timeline: [
      {
        id: 'tl-71',
        stage: 'Report Submitted',
        timestamp: '2026-09-18T11:00:00Z',
        actor: 'Alex Rivera',
        note: 'Flagged safety risk in Lab 104.'
      },
      {
        id: 'tl-72',
        stage: 'Resolved',
        timestamp: '2026-09-19T15:30:00Z',
        actor: 'Dr. Arthur Vance',
        note: 'Switch replaced and ventilation CFM airflow verified with anemometer.'
      }
    ],
    comments: [],
    feedback: {
      rating: 5,
      comment: 'Essential for our Friday lab session. Fixed cleanly!',
      submittedAt: '2026-09-20T09:00:00Z'
    }
  }
];

// Initial Notifications
let notifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-stu-1',
    reportId: 'CF-2024-1001',
    title: 'Technician Assigned',
    message: 'Your report "Flickering High-Bay Light" has been assigned to Ray Cooper (Electrical Maintenance).',
    type: 'info',
    isRead: false,
    createdAt: '2026-09-24T14:00:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-stu-1',
    reportId: 'CF-2024-1004',
    title: 'Report Resolved 🎉',
    message: 'Great news! "Damaged Wooden Park Bench" has been fixed. Tap to submit feedback & earn 50 Campus Impact points.',
    type: 'success',
    isRead: false,
    createdAt: '2026-09-22T16:05:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-stu-1',
    reportId: 'CF-2024-1003',
    title: 'Work In Progress',
    message: 'IT network team has begun secondary dual-band AP installation in Lab 3.',
    type: 'info',
    isRead: true,
    createdAt: '2026-09-25T08:35:00Z'
  },
  {
    id: 'notif-4',
    userId: 'user-adm-1',
    reportId: 'CF-2024-1002',
    title: 'Urgent Issue Reported ⚠️',
    message: 'New Urgent Water Leakage reported in Hostel Block B Washroom.',
    type: 'urgent',
    isRead: false,
    createdAt: '2026-09-25T14:46:00Z'
  }
];

// Helper: Gemini AI Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/* =========================================================
   REST API Endpoints
========================================================= */

// 1. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, role } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please provide user name/email and password.' });
  }

  const query = identifier.trim().toLowerCase();
  const user = users.find(u => 
    (
      u.email.toLowerCase() === query || 
      (u.rollNumber && u.rollNumber.toLowerCase() === query) ||
      (u.username && u.username.toLowerCase() === query) ||
      (u.role === 'admin' && query === 'admin')
    ) &&
    (u.password === password || (u.role === 'admin' && (password === 'admin@123' || password === 'admin123')))
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid user name/email or password. Check credentials and try again.' });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ error: `Account does not have ${role} privileges.` });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser, token: `mock-jwt-${user.id}-${Date.now()}` });
});

// 2. Auth: Register Student
app.post('/api/auth/register', (req, res) => {
  const { name, email, rollNumber, department, year, phone, password, avatarUrl } = req.body;

  if (!name || !email || !rollNumber || !department || !password) {
    return res.status(400).json({ error: 'Please fill in all required registration fields.' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this college email already exists.' });
  }

  const newUser: User = {
    id: `user-stu-${Date.now()}`,
    role: 'student',
    name: name.trim(),
    email: email.trim().toLowerCase(),
    rollNumber: rollNumber.trim().toUpperCase(),
    department: department.trim(),
    year: year || '1st Year',
    avatarUrl: avatarUrl || '/src/assets/images/campus_hero_student_1790383682884.jpg',
    phone: phone || '',
    points: 0,
    badges: ['Campus Helper'],
    password: password
  };

  users.push(newUser);

  // Welcome notification
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: newUser.id,
    title: 'Welcome to CampusFix AI! 👋',
    message: 'Thanks for joining CampusFix! Spotted any campus issues that need fixing?',
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  const { password: _, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser, token: `mock-jwt-${newUser.id}-${Date.now()}` });
});

// 3. Auth: Current User Info
app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'user-stu-1';
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User session not found.' });
  }
  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// 4. Reports: List with filters
app.get('/api/reports', (req, res) => {
  const { status, category, priority, search, reporterId, building, sort } = req.query;

  let result = [...reports];

  if (status && status !== 'All') {
    result = result.filter(r => r.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (category && category !== 'All') {
    result = result.filter(r => r.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (priority && priority !== 'All') {
    result = result.filter(r => r.priority.toLowerCase() === (priority as string).toLowerCase());
  }

  if (reporterId) {
    result = result.filter(r => r.reporterId === reporterId);
  }

  if (building && building !== 'All') {
    result = result.filter(r => r.building.toLowerCase().includes((building as string).toLowerCase()));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sort === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === 'priority') {
    const priorityWeights: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
    result.sort((a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0));
  } else {
    // Default newest
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ reports: result, total: result.length });
});

// 5. Reports: Single Report details
app.get('/api/reports/:id', (req, res) => {
  const report = reports.find(r => r.id.toLowerCase() === req.params.id.toLowerCase());
  if (!report) {
    return res.status(404).json({ error: `Report ${req.params.id} not found.` });
  }
  return res.json({ report });
});

// 6. Reports: Create new issue
app.post('/api/reports', (req, res) => {
  const { title, category, description, location, building, roomOrArea, priority, imageUrl, reporterId } = req.body;

  if (!title || !description || !location) {
    return res.status(400).json({ error: 'Title, description, and location are required.' });
  }

  const reporter = users.find(u => u.id === reporterId) || users[0];
  const newId = `CF-2024-${1000 + reports.length + 1}`;
  const now = new Date().toISOString();

  const newReport: Report = {
    id: newId,
    title: title.trim(),
    category: category || 'Other',
    description: description.trim(),
    location: location.trim(),
    building: building || location.trim(),
    roomOrArea: roomOrArea || '',
    priority: priority || 'Medium',
    status: 'Pending',
    reporterId: reporter.id,
    reporterName: reporter.name,
    reporterEmail: reporter.email,
    reporterAvatar: reporter.avatarUrl,
    imageUrl: imageUrl || '',
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        id: `tl-${Date.now()}`,
        stage: 'Report Submitted',
        timestamp: now,
        actor: `${reporter.name} (${reporter.role === 'student' ? 'Student' : 'Staff'})`,
        note: 'Issue successfully lodged in CampusFix AI dispatch network.'
      }
    ],
    comments: []
  };

  reports.unshift(newReport);

  // Award user points
  reporter.points += 50;

  // Create notifications
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: reporter.id,
    reportId: newId,
    title: 'Report Submitted! 🚀',
    message: `Your report "${newReport.title}" (${newId}) is submitted. You gained +50 points!`,
    type: 'success',
    isRead: false,
    createdAt: now
  });

  notifications.unshift({
    id: `notif-adm-${Date.now()}`,
    userId: 'user-adm-1',
    reportId: newId,
    title: `New Report: ${newReport.title}`,
    message: `${reporter.name} reported an issue in ${newReport.location} [${newReport.priority} Priority].`,
    type: newReport.priority === 'Urgent' ? 'urgent' : 'info',
    isRead: false,
    createdAt: now
  });

  return res.status(201).json({ report: newReport, message: 'Report submitted successfully!' });
});

// 7. Reports: Update status / assign / resolve
app.patch('/api/reports/:id', (req, res) => {
  const report = reports.find(r => r.id.toLowerCase() === req.params.id.toLowerCase());
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const { status, assignedDepartment, assignedStaff, priority, note, actorName } = req.body;
  const now = new Date().toISOString();

  if (priority) {
    report.priority = priority;
  }
  if (assignedDepartment) {
    report.assignedDepartment = assignedDepartment;
  }
  if (assignedStaff) {
    report.assignedStaff = assignedStaff;
  }

  if (status && status !== report.status) {
    const previousStatus = report.status;
    report.status = status;
    if (status === 'Resolved') {
      report.resolvedAt = now;
      // Award student resolution points
      const reporter = users.find(u => u.id === report.reporterId);
      if (reporter) {
        reporter.points += 50;
      }
    } else if (previousStatus === 'Resolved' && (status === 'Reopened' || status === 'In Progress' || status === 'Under Review')) {
      report.resolvedAt = undefined;
    }

    report.timeline.push({
      id: `tl-${Date.now()}`,
      stage: status as any,
      timestamp: now,
      actor: actorName || 'Campus Administration',
      note: note || `Status updated to ${status}.`
    });

    // Notify reporter
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: report.reporterId,
      reportId: report.id,
      title: status === 'Reopened' ? `Issue Reopened: ${report.id}` : `Complaint Status: ${status}`,
      message: status === 'Reopened' 
        ? `Your ticket "${report.title}" was reopened for facility re-inspection: ${note || 'Issue not resolved'}`
        : `Your report "${report.title}" status has changed to "${status}".`,
      type: status === 'Resolved' ? 'success' : status === 'Reopened' ? 'warning' : 'info',
      isRead: false,
      createdAt: now
    });

    // If reopened by student, alert all campus administrators
    if (status === 'Reopened' || (previousStatus === 'Resolved' && status !== 'Resolved')) {
      users.filter(u => u.role === 'admin').forEach(admin => {
        notifications.unshift({
          id: `notif-${Date.now()}-${admin.id}`,
          userId: admin.id,
          reportId: report.id,
          title: `⚠️ Ticket Reopened: ${report.id}`,
          message: `${actorName || 'Student'} reopened ticket "${report.title}". Reason: ${note || 'Issue not solved'}`,
          type: 'warning',
          isRead: false,
          createdAt: now
        });
      });
    }
  } else if (note) {
    report.timeline.push({
      id: `tl-${Date.now()}`,
      stage: report.status as any,
      timestamp: now,
      actor: actorName || 'Campus Administration',
      note: note
    });
  }

  report.updatedAt = now;
  return res.json({ report, message: 'Report updated successfully.' });
});

// 8. Reports: Add Comment
app.post('/api/reports/:id/comments', (req, res) => {
  const report = reports.find(r => r.id.toLowerCase() === req.params.id.toLowerCase());
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const { userId, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Comment message cannot be empty.' });
  }

  const author = users.find(u => u.id === userId) || users[0];
  const newComment: CommentEntry = {
    id: `comm-${Date.now()}`,
    userId: author.id,
    userName: author.name,
    userRole: author.role,
    userAvatar: author.avatarUrl,
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  report.comments.push(newComment);
  report.updatedAt = new Date().toISOString();

  // Notify opposite party
  const recipientId = author.role === 'student' ? 'user-adm-1' : report.reporterId;
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: recipientId,
    reportId: report.id,
    title: `New Comment on ${report.id}`,
    message: `${author.name}: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
    type: 'info',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ comment: newComment });
});

// 9. Reports: Submit Feedback
app.post('/api/reports/:id/feedback', (req, res) => {
  const report = reports.find(r => r.id.toLowerCase() === req.params.id.toLowerCase());
  if (!report) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  const { rating, comment } = req.body;
  if (!rating) {
    return res.status(400).json({ error: 'Star rating is required.' });
  }

  report.feedback = {
    rating: Number(rating),
    comment: comment?.trim() || '',
    submittedAt: new Date().toISOString()
  };

  // Bonus points for giving feedback
  const reporter = users.find(u => u.id === report.reporterId);
  if (reporter) {
    reporter.points += 25;
  }

  return res.json({ feedback: report.feedback, message: 'Thank you for your feedback! +25 bonus points.' });
});

// 10. Stats: Student Summary & Admin Operations
app.get('/api/stats/summary', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const userReports = userId ? reports.filter(r => r.reporterId === userId) : [];

  const totalAll = reports.length;
  const pendingAll = reports.filter(r => r.status === 'Pending').length;
  const underReviewAll = reports.filter(r => r.status === 'Under Review').length;
  const inProgressAll = reports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
  const resolvedAll = reports.filter(r => r.status === 'Resolved').length;
  const urgentAll = reports.filter(r => r.priority === 'Urgent').length;

  // Category Breakdown
  const categoryCounts: Record<string, number> = {};
  reports.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  // Department Workload
  const deptWorkload = departments.map(d => ({
    name: d.name,
    openTickets: reports.filter(r => r.assignedDepartment === d.name && r.status !== 'Resolved').length,
    resolvedTickets: reports.filter(r => r.assignedDepartment === d.name && r.status === 'Resolved').length,
  }));

  // Building / Location counts
  const locationCounts: Record<string, number> = {};
  reports.forEach(r => {
    locationCounts[r.building] = (locationCounts[r.building] || 0) + 1;
  });

  // Student specific stats
  const studentStats = {
    total: userReports.length,
    pending: userReports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length,
    inProgress: userReports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length,
    resolved: userReports.filter(r => r.status === 'Resolved').length,
    campusImpactScore: (userReports.filter(r => r.status === 'Resolved').length * 45) + 30,
  };

  return res.json({
    admin: {
      total: totalAll,
      pending: pendingAll + underReviewAll,
      inProgress: inProgressAll,
      resolved: resolvedAll,
      urgent: urgentAll,
      avgResolutionHours: 12.4,
      satisfactionRate: 96.2,
      categoryCounts,
      deptWorkload,
      locationCounts
    },
    student: studentStats
  });
});

// 11. Campus Map Hotspots
app.get('/api/map/hotspots', (req, res) => {
  const buildings = [
    {
      id: 'b-library',
      name: 'Central Library',
      type: 'Academic',
      x: 35, // percentage on campus grid
      y: 40,
      description: 'Floors 1-3, Quiet Study, Digital Media Labs',
      activeIssues: reports.filter(r => r.building.includes('Library') && r.status !== 'Resolved').length,
      resolvedIssues: reports.filter(r => r.building.includes('Library') && r.status === 'Resolved').length,
    },
    {
      id: 'b-tech',
      name: 'Tech & Science Complex',
      type: 'Laboratory & Tech',
      x: 65,
      y: 30,
      description: 'Computer Labs 1-4, Robotics Wing, Chemistry Lab',
      activeIssues: reports.filter(r => r.building.includes('Tech') && r.status !== 'Resolved').length,
      resolvedIssues: reports.filter(r => r.building.includes('Tech') && r.status === 'Resolved').length,
    },
    {
      id: 'b-main',
      name: 'Main Academic Block',
      type: 'Lecture Halls',
      x: 50,
      y: 55,
      description: 'Classrooms 101-504, Dean Office, Faculty Lounges',
      activeIssues: reports.filter(r => r.building.includes('Main Academic') && r.status !== 'Resolved').length,
      resolvedIssues: reports.filter(r => r.building.includes('Main Academic') && r.status === 'Resolved').length,
    },
    {
      id: 'b-hostel-b',
      name: 'Hostel Block B',
      type: 'Residential',
      x: 82,
      y: 65,
      description: 'Student Dormitories, Dining Common, Recreation Hall',
      activeIssues: reports.filter(r => r.building.includes('Hostel') && r.status !== 'Resolved').length,
      resolvedIssues: reports.filter(r => r.building.includes('Hostel') && r.status === 'Resolved').length,
    },
    {
      id: 'b-student-union',
      name: 'Student Union & Canteen',
      type: 'Dining & Recreation',
      x: 25,
      y: 70,
      description: 'Food Court, Student Clubs, Campus Bookstore',
      activeIssues: reports.filter(r => r.building.includes('Student Union') && r.status !== 'Resolved').length,
      resolvedIssues: reports.filter(r => r.building.includes('Student Union') && r.status === 'Resolved').length,
    },
    {
      id: 'b-sports',
      name: 'Sports Complex & Arena',
      type: 'Athletics',
      x: 18,
      y: 25,
      description: 'Indoor Stadium, Swimming Pool, Running Track',
      activeIssues: reports.filter(r => r.building.includes('Sports') && r.status !== 'Resolved').length,
      resolvedIssues: reports.filter(r => r.building.includes('Sports') && r.status === 'Resolved').length,
    },
    {
      id: 'b-security',
      name: 'Main North Entrance & Security',
      type: 'Safety & Security',
      x: 50,
      y: 12,
      description: 'Campus Control Center, Visitor Check-in, RFID Barrier',
      activeIssues: reports.filter(r => r.building.includes('Security') || r.building.includes('North Entrance')).length,
      resolvedIssues: 0,
    }
  ];

  return res.json({ buildings });
});

// 12. Departments
app.get('/api/departments', (req, res) => {
  return res.json({ departments });
});

app.post('/api/departments', (req, res) => {
  const { name, head, contact, activeStaffCount } = req.body;
  if (!name || !head) {
    return res.status(400).json({ error: 'Department name and head are required.' });
  }
  const newDept: Department = {
    id: `dept-${Date.now()}`,
    name,
    head,
    contact: contact || `${name.toLowerCase().replace(/\s+/g, '')}@campus.edu`,
    activeStaffCount: activeStaffCount || 4,
    openTickets: 0,
    avgResolutionHours: 12,
    status: 'active'
  };
  departments.push(newDept);
  return res.status(201).json({ department: newDept });
});

app.patch('/api/departments/:id', (req, res) => {
  const dept = departments.find(d => d.id === req.params.id);
  if (!dept) {
    return res.status(404).json({ error: 'Department not found.' });
  }
  Object.assign(dept, req.body);
  return res.json({ department: dept });
});

// 13. Notifications
app.get('/api/notifications', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;

  const userNotifs = notifications.filter(n => 
    n.userId === userId || 
    (userRole === 'admin' && n.userId === 'user-adm-1') ||
    n.userId === 'all'
  );

  return res.json({ notifications: userNotifs, unreadCount: userNotifs.filter(n => !n.isRead).length });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
  }
  return res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  notifications.forEach(n => {
    if (n.userId === userId || n.userId === 'user-adm-1') {
      n.isRead = true;
    }
  });
  return res.json({ success: true });
});

// 14. Leaderboard & Rewards
app.get('/api/leaderboard', (req, res) => {
  const sortedStudents = users
    .filter(u => u.role === 'student')
    .map(s => {
      const stuReports = reports.filter(r => r.reporterId === s.id);
      return {
        id: s.id,
        name: s.name,
        avatarUrl: s.avatarUrl,
        department: s.department,
        year: s.year,
        points: s.points,
        badges: s.badges,
        reportsCount: stuReports.length,
        resolvedCount: stuReports.filter(r => r.status === 'Resolved').length
      };
    })
    .sort((a, b) => b.points - a.points);

  return res.json({ leaderboard: sortedStudents });
});

// 15. AI: Analyze Issue (Smart Triage & Recommendation)
app.post('/api/ai/analyze-issue', async (req, res) => {
  const { title, description, location } = req.body;
  if (!title && !description) {
    return res.status(400).json({ error: 'Please provide issue title or description for AI analysis.' });
  }

  // Check for potential duplicate in open reports
  const duplicateCandidate = reports.find(r => 
    r.status !== 'Resolved' &&
    ((location && r.location.toLowerCase().includes(location.toLowerCase())) ||
     (title && r.title.toLowerCase().includes(title.toLowerCase().slice(0, 15))))
  );

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const prompt = `You are CampusFix AI, the smart college campus maintenance engine.
Analyze this reported campus problem:
Title: "${title || ''}"
Description: "${description || ''}"
Location: "${location || ''}"

Return ONLY a JSON object with this exact schema:
{
  "category": "Electrical" | "Plumbing" | "Wi-Fi / IT" | "Classroom" | "Laboratory" | "Cleanliness" | "Road / Pathway" | "Hostel" | "Security" | "Library" | "Other",
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "suggestedDepartment": string,
  "summary": string,
  "recommendedAction": string,
  "safetyWarning": string | null
}`;

      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      return res.json({
        aiResult: parsed,
        duplicateWarning: duplicateCandidate ? {
          id: duplicateCandidate.id,
          title: duplicateCandidate.title,
          status: duplicateCandidate.status,
          location: duplicateCandidate.location
        } : null
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', err?.message);
    }
  }

  // Robust Heuristic Engine fallback
  const combined = `${title || ''} ${description || ''}`.toLowerCase();
  let category = 'Other';
  let priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium';
  let dept = 'Campus Operations';

  if (combined.includes('light') || combined.includes('spark') || combined.includes('electric') || combined.includes('wire') || combined.includes('switch')) {
    category = 'Electrical';
    dept = 'Electrical Maintenance';
    priority = combined.includes('spark') || combined.includes('smoke') ? 'Urgent' : 'High';
  } else if (combined.includes('water') || combined.includes('leak') || combined.includes('pipe') || combined.includes('sink') || combined.includes('toilet') || combined.includes('flush')) {
    category = 'Plumbing';
    dept = 'Plumbing & Water Services';
    priority = combined.includes('flood') || combined.includes('heavy') ? 'Urgent' : 'High';
  } else if (combined.includes('wifi') || combined.includes('wi-fi') || combined.includes('internet') || combined.includes('network') || combined.includes('router') || combined.includes('lan')) {
    category = 'Wi-Fi / IT';
    dept = 'IT & Campus Network';
    priority = 'Medium';
  } else if (combined.includes('bench') || combined.includes('road') || combined.includes('pothole') || combined.includes('path') || combined.includes('curb')) {
    category = 'Road / Pathway';
    dept = 'Civil & Infrastructure';
    priority = 'Low';
  } else if (combined.includes('fume') || combined.includes('centrifuge') || combined.includes('beaker') || combined.includes('chemical') || combined.includes('lab')) {
    category = 'Laboratory';
    dept = 'Laboratory Equipment Support';
    priority = 'Urgent';
  } else if (combined.includes('trash') || combined.includes('garbage') || combined.includes('cleaning') || combined.includes('spill') || combined.includes('stain')) {
    category = 'Cleanliness';
    dept = 'Housekeeping & Sanitation';
    priority = 'Medium';
  }

  return res.json({
    aiResult: {
      category,
      priority,
      suggestedDepartment: dept,
      summary: `Automated assessment: ${category} issue logged for rapid dispatch.`,
      recommendedAction: priority === 'Urgent' ? 'Immediate safety barricade and emergency technician notification.' : 'Queue for standard dispatch during next work shift.',
      safetyWarning: priority === 'Urgent' ? 'Possible hazard detected. Students advised to maintain safe distance.' : null
    },
    duplicateWarning: duplicateCandidate ? {
      id: duplicateCandidate.id,
      title: duplicateCandidate.title,
      status: duplicateCandidate.status,
      location: duplicateCandidate.location
    } : null
  });
});

// 16. AI: CampusFix Assistant Chat
app.post('/api/ai/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  // Context on current open reports and campus services
  const openCount = reports.filter(r => r.status !== 'Resolved').length;
  const recentReports = reports.slice(0, 5).map(r => `[${r.id}] ${r.title} (${r.status}, ${r.location})`).join('\n');

  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const systemPrompt = `You are "CampusFix Bot", the friendly, super-knowledgeable, and encouraging 3D AI companion for college campus infrastructure.
You help students report problems (lights, plumbing, Wi-Fi, lab equipment, AC, cleanliness), track existing report statuses, find departments, and provide safety guidelines.
Tone: Warm, collegiate, helpful, concise, structured with bullet points where appropriate.
Campus Data:
- Total active campus reports: ${openCount}
- Recent reports:
${recentReports}
- Departments: Electrical Maintenance, Plumbing, IT & Campus Network, Housekeeping, Civil & Infrastructure, Campus Security, Laboratory Equipment Support.
Emergency line: Campus Security x8800.
Always remind students they can submit an issue in the "Report Issue" tab with an uploaded photo!`;

      const promptWithHistory = `${systemPrompt}\n\nUser: ${message}\nCampusFix Bot:`;
      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptWithHistory,
      });

      return res.json({ reply: response.text?.trim() || 'I am here to help you keep our campus in top shape! What can I check for you?' });
    } catch (err: any) {
      console.warn('Gemini chat error:', err?.message);
    }
  }

  // Friendly conversational fallback
  const lower = message.toLowerCase();
  let reply = "I'm your CampusFix AI assistant! I can help you report an issue, check on ticket progress, or connect with campus maintenance.";

  if (lower.includes('light') || lower.includes('electrical')) {
    reply = "💡 For broken lights or electrical hazards, head to the 'Report Issue' page and select 'Electrical Maintenance'. If sparks or bare wires are visible, please avoid touching them and notify Campus Security immediately!";
  } else if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet')) {
    reply = "📶 IT & Campus Network handles Wi-Fi AP outages. We currently have ticket CF-2024-1003 in progress for Lab 3. If you're experiencing drops in another hall, report it with your specific building and room number!";
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('plumbing')) {
    reply = "💧 Plumbing issues are prioritized by our Rapid Response team. We currently have a water leak in Hostel Block B under review. To report a new one, include a quick photo so the team brings the right pipe fittings!";
  } else if (lower.includes('status') || lower.includes('where is my') || lower.includes('track')) {
    reply = `📍 You can track any report in real-time in the 'Track Issues' tab! Just enter your Ticket ID (e.g. CF-2024-1001) to see live timestamps, assigned technicians, and status transitions.`;
  } else if (lower.includes('points') || lower.includes('reward') || lower.includes('badge')) {
    reply = "🏆 You earn +50 points for every verified campus report submitted, +100 points when it's resolved, and +25 points for rating the repair quality! Check the 'Rewards' tab to see your ranking and unlock badges like 'Campus Guardian'.";
  }

  return res.json({ reply });
});

/* =========================================================
   Vite Middleware / Static Serving
========================================================= */

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      port: 3000,
      host: '0.0.0.0'
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusFix AI server running on http://0.0.0.0:${PORT}`);
});
