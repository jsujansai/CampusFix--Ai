import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Sparkles, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building, 
  Calendar, 
  Phone, 
  CheckCircle, 
  ShieldCheck, 
  Radio, 
  HeartHandshake,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

const avatarOptions = [
  { id: 'av-1', url: '/src/assets/images/campus_hero_student_1790383682884.jpg', label: 'Male Student' },
  { id: 'av-2', url: '/src/assets/images/student_avatar_fem_1790383696802.jpg', label: 'Female Student' },
  { id: 'av-3', url: '/src/assets/images/ai_fix_mascot_1790383722304.jpg', label: 'AI Mascot' },
];

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authInitialTab, 
    login, 
    registerStudent,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'student' | 'admin' | 'signup'>(authInitialTab);

  // Login form state
  const [identifier, setIdentifier] = useState(authInitialTab === 'admin' ? 'Admin' : '');
  const [password, setPassword] = useState(authInitialTab === 'admin' ? 'Admin@sujansai' : '');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(authInitialTab);
    if (authInitialTab === 'admin') {
      setIdentifier('Admin');
      setPassword('Admin@sujansai');
    } else {
      setIdentifier('');
      setPassword('');
    }
  }, [authInitialTab, isAuthModalOpen]);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRoll, setSignupRoll] = useState('');
  const [signupGender, setSignupGender] = useState<'Male' | 'Female'>('Male');
  const [signupDept, setSignupDept] = useState('');
  const [signupYear, setSignupYear] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  if (!isAuthModalOpen) return null;

  const currentAvatarUrl = signupGender === 'Female'
    ? '/src/assets/images/student_avatar_fem_1790383696802.jpg'
    : '/src/assets/images/campus_hero_student_1790383682884.jpg';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const role = activeTab === 'admin' ? 'admin' : 'student';
      await login(identifier, password, role);
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupRoll.trim() || !signupPass) {
      showToast('Please fill in all mandatory fields.', 'warning');
      return;
    }
    if (!signupDept) {
      showToast('Please select your department.', 'warning');
      return;
    }
    if (!signupYear) {
      showToast('Please select your year of study.', 'warning');
      return;
    }
    if (!acceptTerms) {
      showToast('Please accept the campus community guidelines and terms.', 'warning');
      return;
    }
    if (signupPass !== signupConfirmPass) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      await registerStudent({
        name: signupName,
        email: signupEmail,
        rollNumber: signupRoll,
        gender: signupGender,
        department: signupDept,
        year: signupYear,
        phone: signupPhone,
        password: signupPass,
        avatarUrl: currentAvatarUrl,
      });
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row my-auto max-h-[92vh]">
        
        {/* Close button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Campus Environment & 3D Student Visuals (Directly matching user design reference) */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 flex-col justify-between overflow-hidden text-white">
          {/* Subtle background decoration */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center"
            style={{ backgroundImage: `url('/src/assets/images/campus_environment_1790383710501.jpg')` }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>CampusFix AI v2.4 • Smart Campus</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm font-['Space_Grotesk']">
              A Better<br />
              <span className="text-cyan-200">Campus</span><br />
              Together.
            </h1>

            <p className="mt-3 text-sm text-blue-100/90 max-w-xs font-medium">
              Empowering students and administration to spot, report, and rapidly fix infrastructure problems together.
            </p>
          </div>

          {/* 3D Student Avatar & Floating Cards */}
          <div className="relative z-10 my-4 flex items-center justify-center">
            <div className="relative group">
              {/* Speech bubble */}
              <div className="absolute -top-7 -right-4 z-20 bg-white text-slate-900 px-3 py-1.5 rounded-xl rounded-bl-none shadow-xl border border-slate-200 flex items-center gap-1.5 animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span className="text-xs font-bold">Better Campus, Brighter Tomorrow!</span>
              </div>

              <img
                src="/src/assets/images/campus_hero_student_1790383682884.jpg"
                alt="Campus Student"
                className="w-48 h-48 rounded-3xl object-cover shadow-2xl ring-4 ring-white/30 transform group-hover:scale-105 transition-all duration-300"
              />
              {/* Floating pill badge */}
              <div className="absolute -bottom-3 -right-4 glass-card px-3.5 py-1.5 rounded-2xl shadow-xl border border-white/40 flex items-center gap-2 text-slate-800 animate-subtle-float">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold tracking-wide">Report • Solve • Improve!</span>
              </div>
            </div>
          </div>

          {/* 4 Feature highlight cards (matching reference image) */}
          <div className="relative z-10 grid grid-cols-2 gap-2.5 mt-2">
            <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
                <Lightbulb className="w-3.5 h-3.5 fill-amber-950" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">Report Issues</span>
                <p className="text-[10px] text-blue-100/80 truncate">GPS tagged in 30s</p>
              </div>
            </div>

            <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">Track in Real-Time</span>
                <p className="text-[10px] text-blue-100/80 truncate">Live dispatcher timeline</p>
              </div>
            </div>

            <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-400 text-cyan-950 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">AI Assistance</span>
                <p className="text-[10px] text-blue-100/80 truncate">Auto-categorize & priority</p>
              </div>
            </div>

            <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">Safer Campus</span>
                <p className="text-[10px] text-blue-100/80 truncate">Points & badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Glass/White Authentication Card */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[88vh]">
          <div>
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {activeTab === 'signup' ? 'Join the Community 🌱' : 'Welcome Back! 👋'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeTab === 'signup'
                    ? 'Create your CampusFix student profile to report & earn badges.'
                    : 'Log in to report infrastructure issues and track live repairs.'}
                </p>
              </div>
            </div>

            {/* Segmented Tab Selector */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  setIdentifier('');
                  setPassword('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'student'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Student Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setIdentifier('Admin');
                  setPassword('Admin@sujansai');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* LOGIN FORM (Student / Admin) */}
            {activeTab !== 'signup' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {activeTab === 'student' ? 'College Email or Roll Number' : 'User Name'}
                  </label>
                  <div className="relative">
                    {activeTab === 'student' ? (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeTab === 'student' ? 'Enter college email or roll number' : 'Admin'}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent to registered email address.', 'info'); }} className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Log In to CampusFix</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Jordan Lee"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={signupRoll}
                      onChange={(e) => setSignupRoll(e.target.value)}
                      placeholder="e.g. CS2025-104"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">College Email</label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@campus.edu"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Department *</label>
                    <select
                      required
                      value={signupDept}
                      onChange={(e) => setSignupDept(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="" disabled>Select Department</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Business & Management">Business & Management</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Year of Study *</label>
                    <select
                      required
                      value={signupYear}
                      onChange={(e) => setSignupYear(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="" disabled>Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Gender and Profile Picture Auto-Assignment */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      Gender & Profile Photo Assignment *
                    </label>
                    <span className="text-[10px] text-slate-400">Profile pic assigned automatically</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignupGender('Male')}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                        signupGender === 'Male'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 ring-1 ring-blue-500 text-blue-900 dark:text-blue-100 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <img
                        src="/src/assets/images/campus_hero_student_1790383682884.jpg"
                        alt="Male student profile"
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block">👨 Male</span>
                        <span className="text-[10px] text-slate-400 block truncate">Male student avatar</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignupGender('Female')}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                        signupGender === 'Female'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 ring-1 ring-rose-500 text-rose-900 dark:text-rose-100 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <img
                        src="/src/assets/images/student_avatar_fem_1790383696802.jpg"
                        alt="Female student profile"
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-rose-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block">👩 Female</span>
                        <span className="text-[10px] text-slate-400 block truncate">Female student avatar</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={signupPass}
                      onChange={(e) => setSignupPass(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={signupConfirmPass}
                      onChange={(e) => setSignupConfirmPass(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    I agree to the CampusFix Community Standards and responsible reporting pledge.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Create Account & Join CampusFix</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Student Avatars Row matching design reference */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center -space-x-2">
                <img src="/src/assets/images/campus_hero_student_1790383682884.jpg" alt="Student" className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" />
                <img src="/src/assets/images/student_avatar_fem_1790383696802.jpg" alt="Student" className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" />
                <img src="/src/assets/images/ai_fix_mascot_1790383722304.jpg" alt="Mascot" className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" />
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  +1.4k
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Active students fixing campus daily
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
