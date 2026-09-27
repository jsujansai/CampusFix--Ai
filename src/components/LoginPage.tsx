import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  HeartHandshake,
  ArrowRight,
  Eye,
  EyeOff,
  Lightbulb,
  X,
  Compass,
  AlertCircle
} from 'lucide-react';

const avatarOptions = [
  { id: 'av-1', url: '/src/assets/images/campus_hero_student_1790383682884.jpg', label: 'Male Student' },
  { id: 'av-2', url: '/src/assets/images/student_avatar_fem_1790383696802.jpg', label: 'Female Student' },
  { id: 'av-3', url: '/src/assets/images/ai_fix_mascot_1790383722304.jpg', label: 'AI Mascot' },
];

export const LoginPage: React.FC = () => {
  const { 
    login, 
    registerStudent, 
    showToast, 
    setCurrentView,
    setUser
  } = useApp() as any;

  const [activeTab, setActiveTab] = useState<'student' | 'admin' | 'signup'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Login form state
  const [identifier, setIdentifier] = useState(activeTab === 'admin' ? 'Admin' : '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'code' | 'done'>('email');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  const currentAvatarUrl = signupGender === 'Female'
    ? '/src/assets/images/student_avatar_fem_1790383696802.jpg'
    : '/src/assets/images/campus_hero_student_1790383682884.jpg';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast(activeTab === 'admin' ? 'Please enter User Name and password.' : 'Please enter college email/roll number and password.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const role = activeTab === 'admin' ? 'admin' : 'student';
      await login(identifier.trim(), password, role);
    } catch (err: any) {
      // error handled in context toast
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
      showToast('Please accept the campus community guidelines to proceed.', 'warning');
      return;
    }
    if (signupPass !== signupConfirmPass) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (signupPass.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        name: signupName.trim(),
        email: signupEmail.trim(),
        rollNumber: signupRoll.trim().toUpperCase(),
        gender: signupGender,
        department: signupDept,
        year: signupYear,
        phone: signupPhone.trim(),
        password: signupPass,
        avatarUrl: currentAvatarUrl,
      });
    } catch (err: any) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 'email') {
      if (!forgotEmail) {
        showToast('Please enter your university email.', 'warning');
        return;
      }
      setForgotStep('code');
      showToast(`Verification code sent to ${forgotEmail}. (Demo code: 849201)`, 'info');
      setResetCode('849201');
    } else if (forgotStep === 'code') {
      if (!resetCode || !newPassword) {
        showToast('Please enter both verification code and new password.', 'warning');
        return;
      }
      setForgotStep('done');
      showToast('Password updated successfully! Logging you in...', 'success');
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotStep('email');
        login(forgotEmail, newPassword || 'password123', 'student');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white">
      
      {/* =========================================================
          LEFT COLUMN: Campus Environment & 3D Student Visuals 
          (Directly matching user design reference & uploaded image)
      ========================================================= */}
      <div className="relative w-full md:w-1/2 lg:w-7/12 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-hidden min-h-[520px] md:min-h-screen">
        
        {/* Background photo with overlay blending */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center pointer-events-none scale-105 transform hover:scale-100 transition-transform duration-1000"
          style={{ backgroundImage: `url('/src/assets/images/campus_environment_1790383710501.jpg')` }}
        />

        {/* Ambient lighting glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BRAND HEADER */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {/* Graduation Cap + Wrench Logo */}
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 p-2 shadow-xl flex items-center justify-center group hover:rotate-6 transition-transform">
                <svg className="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  <path d="m14 14 3 3" strokeWidth="2.5" stroke="currentColor" />
                  <path d="M19 16.5a1.5 1.5 0 0 0-2.1-2.1l-1.4 1.4" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight text-white font-['Space_Grotesk']">
                    CampusFix
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-cyan-200 text-xs font-black tracking-wide border border-white/25">
                    AI
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium">Smart Campus Infrastructure Management</p>
              </div>
            </div>
          </div>

          {/* Hero Headline */}
          <div className="mt-4 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md font-['Space_Grotesk']">
              A Better<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-100">
                Campus
              </span><br />
              Together.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-blue-100/90 font-medium leading-relaxed max-w-lg">
              Empowering students and administration to spot, report, and rapidly fix infrastructure problems with real-time tracking and Gemini AI.
            </p>
          </div>
        </div>

        {/* 3D STUDENT VISUAL WITH CHEERFUL SPEECH BUBBLE */}
        <div className="relative z-10 my-6 sm:my-8 flex flex-col items-center justify-center">
          <div className="relative">
            {/* Speech bubble badge above avatar */}
            <div className="absolute -top-7 -right-4 sm:-top-8 sm:-right-8 z-20 bg-white text-slate-900 px-4 py-2 rounded-2xl rounded-bl-none shadow-2xl border border-slate-200 flex items-center gap-2 animate-bounce duration-1000">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                Better Campus, Brighter Tomorrow!
              </span>
            </div>

            {/* 3D Student image card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-300 rounded-[32px] blur-md opacity-50 group-hover:opacity-80 transition duration-500" />
              <img
                src="/src/assets/images/campus_hero_student_1790383682884.jpg"
                alt="3D Animated Campus Student"
                className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-cover rounded-[30px] shadow-2xl ring-4 ring-white/30 transform group-hover:scale-102 transition-all duration-300"
              />
              
              {/* Floating Bottom Pill Badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md px-4 py-1.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 text-white whitespace-nowrap animate-subtle-float">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold tracking-wide">Report • Solve • Improve!</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 FEATURE CARDS (2x2 Grid) */}
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto md:mx-0 w-full mb-4">
          
          {/* 1. Report Issues (Yellow Lightbulb) */}
          <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-3.5 hover:bg-white/18 transition-all shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-md">
                <Lightbulb className="w-4 h-4 fill-amber-950" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-white block truncate">Report Issues</span>
                <p className="text-[11px] sm:text-xs text-blue-100/80 truncate">Photo & GPS tagged in 30s</p>
              </div>
            </div>
          </div>

          {/* 2. Track in Real-Time (Red Megaphone) */}
          <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-3.5 hover:bg-white/18 transition-all shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-white block truncate">Track in Real-Time</span>
                <p className="text-[11px] sm:text-xs text-blue-100/80 truncate">Live dispatcher timeline</p>
              </div>
            </div>
          </div>

          {/* 3. AI Assistance (Cyan Bot / Sparkles) */}
          <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-3.5 hover:bg-white/18 transition-all shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-400 text-cyan-950 flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-white block truncate">AI Assistance</span>
                <p className="text-[11px] sm:text-xs text-blue-100/80 truncate">Auto-categorize & priority</p>
              </div>
            </div>
          </div>

          {/* 4. Safer Campus (Emerald Shield) */}
          <div className="bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-3.5 hover:bg-white/18 transition-all shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-white block truncate">Safer Campus</span>
                <p className="text-[11px] sm:text-xs text-blue-100/80 truncate">Earn points & badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM QUOTE / COMMUNITY NOTE */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-100">
          <p className="italic font-medium font-serif tracking-wide text-sm sm:text-base text-cyan-100">
            “Small reports create big changes.”
          </p>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-white/70">
            Campus Community Initiative 🌱
          </span>
        </div>
      </div>


      {/* =========================================================
          RIGHT COLUMN: Modern Clean Authentication Panel 
          (Login, Sign Up, Quick 1-Click Demo Profiles & Google SSO)
      ========================================================= */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-slate-50 dark:bg-slate-900 p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto">
          
          {/* Header Title & Subtitle */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-300 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Campus Single Sign-On</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'signup' 
                ? 'Join the Community 🌱' 
                : activeTab === 'admin' 
                  ? 'Operations Portal 🛠️' 
                  : 'Welcome Back! 👋'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {activeTab === 'signup'
                ? 'Create your student profile to report campus issues and earn rewards.'
                : activeTab === 'admin'
                  ? 'Sign in with campus staff credentials to manage tickets & dispatch crews.'
                  : 'Sign in with your college email or student roll number to continue.'}
            </p>
          </div>

          {/* Segmented Tab Bar */}
          <div className="flex p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-2xl mb-6 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setIdentifier('');
                setPassword('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'student'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setIdentifier('');
                setPassword('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-cyan-300 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* =========================================================
              FORM 1: LOGIN (Student or Admin)
          ========================================================= */}
          {activeTab !== 'signup' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {activeTab === 'student' ? 'College Email or Roll Number' : 'User Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={activeTab === 'student' ? 'Enter college email or roll number' : 'Admin'}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(identifier.includes('@') ? identifier : (identifier.toLowerCase() === 'admin' ? 'admin@campus.edu' : ''));
                      setForgotModalOpen(true);
                    }}
                    className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Remember credentials</span>
                </label>

                <span className="text-[11px] text-slate-400">Encrypted AES-256</span>
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to CampusFix</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* =========================================================
                FORM 2: REGISTRATION (Join Community)
            ========================================================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder=" "
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder=" "
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupRoll}
                    onChange={(e) => setSignupRoll(e.target.value)}
                    placeholder=" "
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    required
                    value={signupDept}
                    onChange={(e) => setSignupDept(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="" disabled>Select Department</option>
                    <option value="Computer Science & Engineering">Computer Science & Eng</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                    <option value="BioTechnology & Sciences">BioTechnology & Sciences</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Year of Study *
                  </label>
                  <select
                    required
                    value={signupYear}
                    onChange={(e) => setSignupYear(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Gender Selection & Profile Photo Auto-Assignment */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Gender (Profile Photo Assignment) *
                  </label>
                  <span className="text-[10px] text-slate-400">Assigned automatically</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupGender('Male')}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      signupGender === 'Male'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 ring-1 ring-blue-500 text-blue-900 dark:text-blue-100 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <img
                      src="/src/assets/images/campus_hero_student_1790383682884.jpg"
                      alt="Male student avatar"
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
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                      signupGender === 'Female'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 ring-1 ring-rose-500 text-rose-900 dark:text-rose-100 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <img
                      src="/src/assets/images/student_avatar_fem_1790383696802.jpg"
                      alt="Female student avatar"
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-rose-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">👩 Female</span>
                      <span className="text-[10px] text-slate-400 block truncate">Female student avatar</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPass}
                    onChange={(e) => setSignupPass(e.target.value)}
                    placeholder=" "
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupConfirmPass}
                    onChange={(e) => setSignupConfirmPass(e.target.value)}
                    placeholder=" "
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Guidelines acceptance */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                    I agree to verify genuine infrastructure issues and uphold the university's community standards.
                  </span>
                </label>
              </div>

              {/* Signup Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create My Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switch Tab Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            {activeTab === 'signup' ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('student')}
                  className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                New to CampusFix?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL: FORGOT PASSWORD RESET
      ========================================================= */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Reset Your Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your college email to receive a secure recovery code.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="mt-5 space-y-4">
              {forgotStep === 'email' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Send Verification Code →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Verification Code (Demo: 849201)
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="849201"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none tracking-widest text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Update Password & Sign In
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
