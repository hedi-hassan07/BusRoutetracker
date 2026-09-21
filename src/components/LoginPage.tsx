import React, { useState } from 'react';
import {
  Bus as BusIcon,
  Users,
  School as SchoolIcon,
  ShieldCheck,
  Smartphone,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  Fuel,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AuthUser, Bus, School, Student, TripShift, UserRole } from '../types';
import { HowToUseModal } from './HowToUseModal';

interface LoginPageProps {
  buses: Bus[];
  students: Student[];
  school: School;
  currentShift: TripShift;
  onLogin: (user: AuthUser, selectedShift?: TripShift) => void;
  onContinueAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  buses,
  students,
  school,
  currentShift,
  onLogin,
  onContinueAsGuest,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);

  // Driver fields
  const [driverIdentifier, setDriverIdentifier] = useState<string>('0750 445 8821');
  const [driverPin, setDriverPin] = useState<string>('1040');

  // Parent fields
  const [parentContact, setParentContact] = useState<string>('sara.ali@example.com');
  const [parentPasscode, setParentPasscode] = useState<string>('••••••••');

  // Manager fields
  const [managerEmail, setManagerEmail] = useState<string>('dispatch@horizonacademy.edu');
  const [managerPassword, setManagerPassword] = useState<string>('••••••••');

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!driverIdentifier.trim()) {
      setErrorMessage('تکایە ژمارەی مۆبایل یان ناسنامەی شۆفێر بنووسە');
      return;
    }

    const cleanInput = driverIdentifier.replace(/[\s-]/g, '').toLowerCase();
    const matchedBus =
      buses.find(
        (b) =>
          b.driverPhone.replace(/[\s-]/g, '').includes(cleanInput) ||
          b.driverName.toLowerCase().includes(cleanInput) ||
          b.id.toLowerCase() === cleanInput ||
          b.plate.toLowerCase().includes(cleanInput) ||
          b.busNumber.toLowerCase().includes(cleanInput)
      ) || buses[0];

    const user: AuthUser = {
      id: matchedBus.id,
      name: matchedBus.driverName,
      role: 'driver',
      emailOrPhone: driverIdentifier,
      busId: matchedBus.id,
      busNumber: matchedBus.busNumber,
      avatarBg: 'bg-amber-500',
      title: 'شۆفێری پاسی قوتابخانە',
      schoolName: school.name,
    };

    onLogin(user, currentShift);
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!parentContact.trim()) {
      setErrorMessage('تکایە ژمارەی مۆبایل یان ئیمەیڵی تۆمارکراو بنووسە');
      return;
    }

    const cleanInput = parentContact.replace(/[\s-]/g, '').toLowerCase();
    const matchedStudent =
      students.find(
        (s) =>
          s.parentEmail.toLowerCase().includes(cleanInput) ||
          s.parentPhone.replace(/[\s-]/g, '').includes(cleanInput) ||
          s.parentName.toLowerCase().includes(cleanInput) ||
          s.name.toLowerCase().includes(cleanInput)
      ) || students[0];

    const matchedStudents = students.filter(
      (s) =>
        s.parentEmail.toLowerCase() === matchedStudent.parentEmail.toLowerCase() ||
        s.parentPhone.replace(/[\s-]/g, '') === matchedStudent.parentPhone.replace(/[\s-]/g, '') ||
        s.parentName.toLowerCase() === matchedStudent.parentName.toLowerCase()
    );
    const studentIds = matchedStudents.map((s) => s.id);

    const user: AuthUser = {
      id: `usr_parent_${matchedStudent.id}`,
      name: matchedStudent.parentName,
      role: 'parent',
      emailOrPhone: parentContact,
      studentId: matchedStudent.id,
      studentIds: studentIds.length > 0 ? studentIds : [matchedStudent.id],
      studentName: matchedStudent.name,
      avatarBg: 'bg-emerald-500',
      title: `سەرپەرشتیاری ${matchedStudent.name}`,
      schoolName: school.name,
    };

    onLogin(user);
  };

  const handleManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!managerEmail.trim()) {
      setErrorMessage('تکایە ئیمەیڵی فەرمی کارمەندی بەڕێوەبەرایەتی بنووسە');
      return;
    }

    const user: AuthUser = {
      id: 'usr_manager_vance',
      name: school.principalName,
      role: 'manager',
      emailOrPhone: managerEmail,
      avatarBg: 'bg-indigo-600',
      title: 'بەڕێوەبەری هاتوچۆ و سەلامەتی قوتابخانە',
      schoolName: school.name,
    };

    onLogin(user);
  };

  // Quick 1-click Demo Fillers
  const fillDriverDemo = (busId: string = 'bus_104') => {
    setSelectedRole('driver');
    const bus = buses.find((b) => b.id === busId) || buses[0];
    setDriverIdentifier(bus.driverPhone);
    setDriverPin(bus.id === 'bus_104' ? '1040' : '1080');
    setErrorMessage(null);
  };

  const fillParentDemo = (studentId: string = 'stu_1') => {
    setSelectedRole('parent');
    const stu = students.find((s) => s.id === studentId) || students[0];
    setParentContact(stu.parentEmail);
    setParentPasscode('482910');
    setErrorMessage(null);
  };

  const fillManagerDemo = () => {
    setSelectedRole('manager');
    setManagerEmail('dispatch@horizonacademy.edu');
    setManagerPassword('SchoolAdmin2026!');
    setErrorMessage(null);
  };

  return (
    <div
      id="login-page"
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans"
    >
      {/* Background visual ambiance */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
            <BusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">ڕێگای پارێزراو</span>
              <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                سیستەمی پاسی قوتابخانە
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">چاودێری ڕاستەوخۆ، ئاگاداری ١ خولەک، و ڕێکخستنی کورتترین ڕێگا</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="how-to-use-btn"
            onClick={() => setIsHowToUseOpen(true)}
            className="text-xs text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 font-bold"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>چۆن کاردەکات؟ (ڕێنمایی)</span>
          </button>

          {onContinueAsGuest && (
            <button
              id="continue-as-guest-btn"
              onClick={onContinueAsGuest}
              className="text-xs text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <span>گەڕان و تاقیکردنەوە</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="max-w-xl mx-auto w-full my-6 z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          {/* Card Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              بەخێربێن بۆ سیستەمی چاودێری پاس
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              دەوری خۆت هەڵبژێرە بۆ چوونەژوورەوەی ڕێگەپێدراو
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div
            id="login-role-selector"
            className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-6"
          >
            <button
              id="select-role-driver"
              type="button"
              onClick={() => {
                setSelectedRole('driver');
                setErrorMessage(null);
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition text-center cursor-pointer ${
                selectedRole === 'driver'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BusIcon className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold leading-tight">شۆفێری پاس</span>
              <span className={`text-[10px] hidden sm:block ${selectedRole === 'driver' ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                تەنها پاسی خۆی
              </span>
            </button>

            <button
              id="select-role-parent"
              type="button"
              onClick={() => {
                setSelectedRole('parent');
                setErrorMessage(null);
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition text-center cursor-pointer ${
                selectedRole === 'parent'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold leading-tight">دایک و باوک</span>
              <span className={`text-[10px] hidden sm:block ${selectedRole === 'parent' ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                تەنها منداڵی خۆت
              </span>
            </button>

            <button
              id="select-role-manager"
              type="button"
              onClick={() => {
                setSelectedRole('manager');
                setErrorMessage(null);
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition text-center cursor-pointer ${
                selectedRole === 'manager'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <SchoolIcon className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold leading-tight">بەڕێوەبەر (ئەدمین)</span>
              <span className={`text-[10px] hidden sm:block ${selectedRole === 'manager' ? 'text-slate-800 font-semibold' : 'text-amber-400 font-medium'}`}>
                بینینی هەموو بەشەکان
              </span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ROLE 1: BUS DRIVER LOGIN FORM */}
          {selectedRole === 'driver' && (
            <form id="driver-login-form" onSubmit={handleDriverSubmit} className="space-y-4">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">داشبۆردی شۆفێر لەسەر مۆبایل</span>
                    <span className="text-[11px] text-slate-400">
                      پشتگیری پەخشی شوێنی مۆبایل و دوگمەی دەستپێکردنی دەوام
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  GPS چالاکە
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ژمارەی مۆبایل یان ناسنامەی شۆفێر
                </label>
                <input
                  id="driver-phone-input"
                  type="text"
                  value={driverIdentifier}
                  onChange={(e) => setDriverIdentifier(e.target.value)}
                  placeholder="بۆ نموونە: 0750 445 8821"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  کۆدی نهێنی چوار ژمارەیی (PIN)
                </label>
                <div className="relative">
                  <input
                    id="driver-pin-input"
                    type={showPassword ? 'text' : 'password'}
                    value={driverPin}
                    onChange={(e) => setDriverPin(e.target.value)}
                    maxLength={6}
                    placeholder="1040"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition pl-10 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>پاس، ڕێڕەو و وێستگەکان بە شێوەی خۆکارانە لە ئەژمێری شۆفێرەکەدا دەکرێنەوە</span>
                </span>
                <span className="text-amber-400 font-bold text-[11px]">بەستراوە</span>
              </div>

              <button
                id="driver-submit-btn"
                type="submit"
                className="w-full mt-2 py-3.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>چوونەژوورەوە بۆ کۆنسۆڵی شۆفێر</span>
              </button>
            </form>
          )}

          {/* ROLE 2: PARENT / GUARDIAN LOGIN FORM */}
          {selectedRole === 'parent' && (
            <form id="parent-login-form" onSubmit={handleParentSubmit} className="space-y-4">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">دەروازەی چاودێری دایک و باوک</span>
                    <span className="text-[11px] text-slate-400">
                      چاودێری ڕاستەوخۆی پاسی منداڵەکەت و زەنگی ئاگاداری ١ خولەک
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                  ئەژمێری باوان
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ئیمەیڵ یان ژمارەی مۆبایلی سەرپەرشتیار
                </label>
                <input
                  id="parent-email-input"
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="بۆ نموونە: sara.ali@example.com"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-right"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    وشەی نهێنی یان کۆدی ئاسایش
                  </label>
                  <span className="text-[11px] text-amber-400 hover:underline cursor-pointer">
                    ناردنی کۆدی یەکجاری بە کورتەنامە
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="parent-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={parentPasscode}
                    onChange={(e) => setParentPasscode(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition pl-10 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>ئاگاداری ١ خولەک پێش گەیشتن چالاکە:</strong> کاتێک پاسەکە ٤٥٠ مەتر نزیک دەبێتەوە لە ماڵەکەتان، بە دەنگی زەنگ و ئاگاداری ڕاستەوخۆ لەسەر مۆبایلەکەت ئاگاداردەکرێیتەوە.
                </span>
              </div>

              <button
                id="parent-submit-btn"
                type="submit"
                className="w-full mt-2 py-3.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>چوونەژوورەوە بۆ دەروازەی دایک و باوک</span>
              </button>
            </form>
          )}

          {/* ROLE 3: SCHOOL MANAGER / DISPATCH LOGIN FORM */}
          {selectedRole === 'manager' && (
            <form id="manager-login-form" onSubmit={handleManagerSubmit} className="space-y-4">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-xs font-bold text-white block mb-0.5">{school.name}</span>
                <span className="text-[11px] text-slate-400">
                  بەڕێوەبەر: {school.principalName} • تەلەفۆن: {school.phone}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ئیمەیڵی فەرمی بەڕێوەبەری هاتوچۆ
                </label>
                <input
                  id="manager-email-input"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="dispatch@horizonacademy.edu"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  وشەی نهێنی بەڕێوەبەرایەتی
                </label>
                <div className="relative">
                  <input
                    id="manager-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition pl-10 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>سەلامەتی و پشتڕاستکردنەوەی دووقۆناغی</span>
                </span>
                <span className="text-emerald-400 font-bold text-[11px]">چالاکە</span>
              </div>

              <button
                id="manager-submit-btn"
                type="submit"
                className="w-full mt-2 py-3.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <SchoolIcon className="w-4 h-4" />
                <span>چوونەژوورەوە بۆ ژووری کۆنتڕۆڵی قوتابخانە</span>
              </button>
            </form>
          )}

          {/* Quick Demo 1-Click Login Shortcuts */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 text-center">
              ⚡ چوونەژوورەوەی خێرا (تاقیکردنەوە بە یەک کرتە)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                id="demo-driver-btn"
                type="button"
                onClick={() => fillDriverDemo('bus_104')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 text-right transition flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <BusIcon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-200 block truncate">کاک کاوە ئەحمەد</span>
                  <span className="text-[10px] text-amber-400 block">شۆفێری پاس • تەنها گەشتی پاس</span>
                </div>
              </button>

              <button
                id="demo-parent-btn"
                type="button"
                onClick={() => fillParentDemo('stu_1')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 text-right transition flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-200 block truncate">سارا عەلی</span>
                  <span className="text-[10px] text-emerald-400 block">باوان • تەنها منداڵانی خۆت</span>
                </div>
              </button>

              <button
                id="demo-manager-btn"
                type="button"
                onClick={fillManagerDemo}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-amber-400/50 hover:border-amber-400 text-right transition flex items-center gap-2.5 bg-gradient-to-l from-indigo-950/40 to-slate-950"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <SchoolIcon className="w-4 h-4 text-amber-400" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-amber-300 block truncate">د. کەنار محەمەد</span>
                  <span className="text-[10px] text-amber-400 font-bold block">👑 ئەدمین (دەسەڵاتی تەواو)</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Value Highlights Footer */}
      <footer className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 z-10">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200 mb-0.5">ئاگاداری ١ خولەک پێش گەیشتن</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              دایک و باوکان بە دەنگ و پەیام ئاگاداردەکرێنەوە کاتێک پاسەکە ٤٥٠ مەتر لە ماڵەکەیان نزیک دەبێتەوە.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200 mb-0.5">پاشەکەوتی ٢٦٪ لە بەنزین</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              سیستەمە زیرەکەکە کورتترین ڕێگای پاس ڕێکدەخات بۆ کەمکردنەوەی ماوە و خەرجی سوتەمەنی.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200 mb-0.5">دەستپێکردنی کار لە مۆبایلەوە</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              شۆفێران بە یەک دەستلێدان لە مۆبایلەکەیان دەوام چالاک دەکەن و پەخشی ڕاستەوخۆ دەنێرن.
            </p>
          </div>
        </div>
      </footer>

      {/* How To Use Modal */}
      <HowToUseModal isOpen={isHowToUseOpen} onClose={() => setIsHowToUseOpen(false)} />
    </div>
  );
};
