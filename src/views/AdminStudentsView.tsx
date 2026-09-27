import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { User, Report } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  Trash2, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Award, 
  FileText, 
  Calendar, 
  Building, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle,
  X,
  UserX,
  Lock
} from 'lucide-react';

export const AdminStudentsView: React.FC = () => {
  const { user, reports, refreshReports, showToast } = useApp();

  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Deletion Modal State
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [eraseReports, setEraseReports] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents();
      setStudents(res.students);
    } catch (err: any) {
      showToast('Failed to load student accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        student.name.toLowerCase().includes(q) ||
        (student.rollNumber && student.rollNumber.toLowerCase().includes(q)) ||
        student.email.toLowerCase().includes(q) ||
        student.department.toLowerCase().includes(q);

      const matchesDept = departmentFilter === 'All' || student.department === departmentFilter;
      const matchesGender = genderFilter === 'All' || student.gender === genderFilter;

      return matchesSearch && matchesDept && matchesGender;
    });
  }, [students, searchQuery, departmentFilter, genderFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const male = students.filter(s => s.gender === 'Male').length;
    const female = students.filter(s => s.gender === 'Female').length;
    const totalReportsFiled = students.reduce((acc, s) => {
      const count = reports.filter(r => r.reporterId === s.id).length;
      return acc + count;
    }, 0);
    return { total, male, female, totalReportsFiled };
  }, [students, reports]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [students]);

  // Handle Remove Student
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setIsDeleting(true);
      await api.deleteStudentAccount(studentToDelete.id, eraseReports, user || undefined);
      showToast(`Student account ${studentToDelete.name} (${studentToDelete.rollNumber || studentToDelete.email}) was removed. Login credentials erased.`, 'success');
      
      // Update local state
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      if (eraseReports) {
        await refreshReports();
      }
      setStudentToDelete(null);
      setEraseReports(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to remove student account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 text-xs font-semibold border border-blue-500/20 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Control Panel • Student Access & Authentication</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
            Student Accounts & Logins
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review registered campus students, monitor community participation, or revoke login credentials and erase unauthorized accounts.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Students</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400">Registered accounts</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Male Students</span>
            <span className="text-sm">👨</span>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{stats.male}</p>
          <span className="text-[10px] text-slate-400">Male profile assignments</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Female Students</span>
            <span className="text-sm">👩</span>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{stats.female}</p>
          <span className="text-[10px] text-slate-400">Female profile assignments</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Reports Submitted</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.totalReportsFiled}</p>
          <span className="text-[10px] text-slate-400">Active campus tickets</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, roll number, email, or department..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male 👨</option>
              <option value="Female">Female 👩</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student Accounts List / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">Loading student accounts from Firestore...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-slate-500 border border-slate-200/80 dark:border-slate-800">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Student Accounts Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or gender/department filter.</p>
          </div>
        ) : (
          filteredStudents.map(student => {
            const studentReports = reports.filter(r => r.reporterId === student.id);
            const isMale = student.gender === 'Male';
            const isFemale = student.gender === 'Female';

            return (
              <div
                key={student.id}
                className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Avatar & Identity Details */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={student.avatarUrl || (isFemale ? '/src/assets/images/student_avatar_fem_1790383696802.jpg' : '/src/assets/images/campus_hero_student_1790383682884.jpg')}
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm"
                    />
                    {student.gender && (
                      <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${
                        isFemale 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      }`}>
                        {isFemale ? '👩 F' : '👨 M'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </h3>
                      {student.rollNumber && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                          {student.rollNumber}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400">
                        {student.department}
                      </span>
                      {student.year && (
                        <span className="text-[10px] text-slate-400">
                          • {student.year}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {student.email}
                      </span>
                      {student.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {student.phone}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stats & Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                        <Award className="w-3 h-3" />
                        {student.points || 0} pts
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/60">
                        <FileText className="w-3 h-3" />
                        {studentReports.length} {studentReports.length === 1 ? 'Report' : 'Reports'}
                      </span>

                      {student.badges && student.badges.slice(0, 2).map((badge, idx) => (
                        <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          🏅 {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setStudentToDelete(student);
                      setEraseReports(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:border-transparent transition-all shadow-2xs active:scale-95"
                    title="Remove student account and erase login credentials"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Remove Account & Login</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal to Remove Student Account */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-rose-200 dark:border-rose-900/80 p-6 space-y-4">
            
            {/* Header */}
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Student Account
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Irreversible security & authentication action
                </p>
              </div>
            </div>

            {/* Target Student Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
              <img
                src={studentToDelete.avatarUrl || '/src/assets/images/campus_hero_student_1790383682884.jpg'}
                alt=""
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-300"
              />
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{studentToDelete.name}</p>
                <p className="text-slate-500 font-mono text-[11px]">{studentToDelete.rollNumber || 'No Roll #'} • {studentToDelete.email}</p>
                <p className="text-[11px] text-slate-400">{studentToDelete.department} ({studentToDelete.gender || 'Not specified'})</p>
              </div>
            </div>

            {/* Warning Message */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove this student's account? Their login access will be immediately revoked and they will no longer be able to sign in to CampusFix AI.
            </p>

            {/* Optional checkbox to erase reports submitted by this user */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eraseReports}
                  onChange={(e) => setEraseReports(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                    Also erase all reports submitted by this student
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Permanently delete all tickets ({reports.filter(r => r.reporterId === studentToDelete.id).length} reports) filed under this account from Cloud Firestore.
                  </span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing Account...</span>
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    <span>Confirm & Remove Account</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
