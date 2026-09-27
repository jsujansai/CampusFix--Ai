import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  Building, 
  Calendar, 
  Phone, 
  Award, 
  CheckCircle2, 
  Edit3, 
  Lock, 
  ShieldCheck,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Hash,
  GraduationCap,
  KeyRound,
  Check,
  X,
  RefreshCw,
  Camera,
  AlertCircle
} from 'lucide-react';

const avatarPresets = [
  { id: 'av-male', url: '/src/assets/images/campus_hero_student_1790383682884.jpg', label: 'Male Student' },
  { id: 'av-female', url: '/src/assets/images/student_avatar_fem_1790383696802.jpg', label: 'Female Student' },
  { id: 'av-mascot', url: '/src/assets/images/ai_fix_mascot_1790383722304.jpg', label: 'AI Mascot' },
];

const DEPARTMENT_OPTIONS = [
  'Computer Science & Engineering',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil & Infrastructure',
  'Information Technology',
  'Electronics & Communication',
  'Chemical Engineering',
  'Architecture & Planning',
  'Business Administration',
  'Biotechnology & Life Sciences',
  'Physics & Applied Sciences',
  'Campus Infrastructure & Operations',
  'Other'
];

const STUDY_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate (Masters)',
  'PhD Research Scholar'
];

export const ProfileView: React.FC = () => {
  const { user, reports, showToast, setCurrentView, updateUserProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  // Password Change Fields
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync state whenever user changes or entering edit mode
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setYear(user.year || '1st Year');
      setRollNumber(user.rollNumber || '');
      setSelectedAvatar(user.avatarUrl || avatarPresets[0].url);
    }
  }, [user, isEditing]);

  const isAdmin = user?.role === 'admin';
  const userReports = user ? reports.filter(r => r.reporterId === user.id) : [];
  const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;

  // Handle custom image file upload with lightweight 256x256 compression
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedAvatar(compressedDataUrl);
          showToast('Custom profile picture uploaded!', 'info');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedAvatar(customUrlInput.trim());
    setShowUrlField(false);
    showToast('Profile image URL applied.', 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!email.trim() || !email.includes('@')) {
      showToast('Please provide a valid Gmail / Email address.', 'warning');
      return;
    }

    if (isAdmin && !username.trim()) {
      showToast('Admin User Name cannot be empty.', 'warning');
      return;
    }

    if (!isAdmin && !name.trim()) {
      showToast('Student name cannot be empty.', 'warning');
      return;
    }

    // Password validation if changing password
    if (changePasswordOpen && (newPassword || confirmPassword)) {
      if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters long.', 'warning');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match. Please verify.', 'error');
        return;
      }
    }

    try {
      setSaving(true);

      const updates: any = {
        name: isAdmin ? (username.trim() || name.trim()) : name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl: selectedAvatar,
        department: department.trim()
      };

      if (isAdmin) {
        updates.username = username.trim();
      } else {
        updates.rollNumber = rollNumber.trim().toUpperCase();
        updates.year = year;
      }

      if (changePasswordOpen && newPassword) {
        updates.password = newPassword;
      }

      await updateUserProfile(updates);

      showToast(
        isAdmin 
          ? 'Admin User Name, Email, and details updated in database! ✅'
          : 'Student profile, Gmail, details & password updated successfully! ✅',
        'success'
      );

      setIsEditing(false);
      setChangePasswordOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Top Profile Card */}
      <div className="relative overflow-hidden rounded-[28px] glass-panel p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0 group">
            <img
              src={user?.avatarUrl || selectedAvatar}
              alt={user?.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-blue-500/30 shadow-xl transition-all"
            />
            <span className={`absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm ${
              isAdmin ? 'bg-indigo-600' : 'bg-blue-600'
            }`}>
              {isAdmin ? 'ADMINISTRATOR' : 'STUDENT'}
            </span>
          </div>

          {/* User Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] truncate">
                {isAdmin ? (user?.username || user?.name || 'Admin') : (user?.name || 'Student Name')}
              </h1>
              {user?.rollNumber && !isAdmin && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  {user.rollNumber}
                </span>
              )}
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Operations Lead</span>
                </span>
              )}
            </div>

            <p className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">
              {user?.department || (isAdmin ? 'Campus Infrastructure & Operations' : 'General Engineering')} 
              {!isAdmin && user?.year && ` • ${user.year}`}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>{user?.email || 'No email set'}</span>
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </span>
              )}
              {isAdmin && user?.username && (
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
                  <span>User Name: <strong className="text-slate-700 dark:text-slate-200">{user.username}</strong></span>
                </span>
              )}
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                  isEditing 
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : (isAdmin ? 'Edit Admin Profile & Credentials' : 'Edit Student Profile')}</span>
              </button>

              {!isAdmin && (
                <button
                  onClick={() => setCurrentView('rewards')}
                  className="px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>View Rewards ({user?.points || 0} pts)</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* EDIT PROFILE DRAWER / FORM */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="glass-card rounded-[28px] p-6 sm:p-7 border border-blue-500/30 dark:border-slate-800 space-y-6 animate-in slide-in-from-top-3 duration-300 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-['Space_Grotesk']">
                <Edit3 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>{isAdmin ? 'Edit Admin Profile & Credentials' : 'Edit Student Profile & Details'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAdmin 
                  ? 'Update your administrator email, User Name handle, and access credentials.' 
                  : 'Update your Gmail, phone, department, study year, roll number, avatar, or password.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ========================================================
              SECTION 1: CUSTOM PROFILE PICTURE & AVATAR
             ======================================================== */}
          <div className="space-y-3 bg-slate-50/80 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Profile Picture & Custom Photo</span>
              </label>
              <span className="text-[11px] text-slate-400">Choose preset or upload custom</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Current Preview */}
              <div className="relative">
                <img 
                  src={selectedAvatar} 
                  alt="Avatar Preview" 
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-600 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full">
                  <Check className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-2">
                {avatarPresets.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`p-1 rounded-xl ring-2 transition-all flex flex-col items-center group ${
                      selectedAvatar === av.url ? 'ring-blue-600 scale-105 shadow-sm' : 'ring-transparent opacity-60 hover:opacity-100'
                    }`}
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{av.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Custom Upload Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0 sm:ml-auto">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleCustomImageUpload} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Upload Custom Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {/* Optional URL Input */}
            {showUrlField && (
              <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Paste direct image URL (https://...)"
                  className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* ========================================================
              SECTION 2: USER CORE FIELDS (Gmail, Phone, Roll, Dept, Year)
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* If Admin: User Name Field */}
            {isAdmin ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Admin User Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Admin or OpsManager"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Used for logging into Operations Center</span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Full Student Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Email / Gmail Field (Available for both Student and Admin) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>{isAdmin ? 'Admin Email ID *' : 'Gmail / College Email *'}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Used for sign in and issue resolution alerts</span>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Department (Select or Custom) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Department</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Department...</option>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Student-only: Roll Number and Study Year */}
            {!isAdmin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>Roll Number / Student ID</span>
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 21BCE1042"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Study Year</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    {STUDY_YEARS.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

          </div>

          {/* ========================================================
              SECTION 3: CHANGE PASSWORD (For Student & Admin)
             ======================================================== */}
          <div className="border-t border-slate-200/70 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(!changePasswordOpen)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Change Account Password
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {changePasswordOpen ? 'Click to collapse password update' : 'Click to create a new password for login'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
                {changePasswordOpen ? 'Cancel' : 'Update Password'}
              </span>
            </button>

            {changePasswordOpen && (
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full text-xs p-2.5 pr-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full text-xs p-2.5 pr-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {newPassword && confirmPassword && (
                  <p className={`text-[11px] font-semibold flex items-center gap-1 ${
                    newPassword === confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                  }`}>
                    {newPassword === confirmPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes to Cloud</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Stats Summary for Student / Operations Summary for Admin */}
      {!isAdmin ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Reports Lodged</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{userReports.length}</p>
            <span className="text-[10px] text-slate-400">Total campus tickets</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Problems Fixed</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
            <span className="text-[10px] text-slate-400">Verified repairs</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Contribution Score</span>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 mt-1">{user?.points || 0}</p>
            <span className="text-[10px] text-slate-400">Helper points</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Impact Rank</span>
            <p className="text-2xl font-extrabold text-amber-500 mt-1">#1</p>
            <span className="text-[10px] text-slate-400">Campus leader</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Admin Role</span>
            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">Operations Lead</p>
            <span className="text-[10px] text-slate-400">Full administrative access</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Reports Managed</span>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 mt-1">{reports.length}</p>
            <span className="text-[10px] text-slate-400">Across all campus zones</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Database Status</span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Firestore Connected</p>
            <span className="text-[10px] text-slate-400">Cloud Live Synchronization</span>
          </div>
        </div>
      )}

      {/* Badges Preview */}
      <div className="glass-card rounded-[28px] p-6 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>{isAdmin ? 'System Authorizations & Badges' : 'Your Achievements & Badges'}</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {user?.badges && user.badges.length > 0 ? (
            user.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold"
              >
                <span>⭐</span>
                <span>{badge}</span>
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">Participate in reports to earn helper badges!</span>
          )}
        </div>
      </div>

    </div>
  );
};
