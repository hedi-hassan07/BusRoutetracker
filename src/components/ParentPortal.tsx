import React, { useState } from 'react';
import { Bus, School, Student, TripShift } from '../types';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  HeartHandshake,
  Home,
  Lock,
  MapPin,
  MessageSquare,
  Navigation2,
  Pencil,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Users,
  Volume2,
} from 'lucide-react';
import { soundPlayer } from '../utils/audioAlert';
import { EditLocationModal } from './EditLocationModal';
import { AddChildModal } from './AddChildModal';

interface ParentPortalProps {
  students: Student[]; // Contains ONLY this parent's registered children!
  allStudents?: Student[];
  selectedStudentId: string;
  onSelectStudentId: (studentId: string) => void;
  bus: Bus;
  school: School;
  shift: TripShift;
  parentName?: string;
  isAdmin?: boolean;
  onAddChild?: (newChild: {
    name: string;
    grade: string;
    avatarBg: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
  }) => void;
  onSwitchParentDemo?: (studentId: string) => void;
  onParentSendNotice: (studentId: string, messageType: 'running_late' | 'mark_absent') => void;
  onUpdateStudentAddress?: (
    studentId: string,
    update: {
      address: string;
      lat: number;
      lng: number;
      isTemporary: boolean;
      reason?: string;
      updatePermanent?: boolean;
    }
  ) => void;
  onRevertToPermanentAddress?: (studentId: string) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  allStudents = [],
  selectedStudentId,
  onSelectStudentId,
  bus,
  school,
  shift,
  parentName,
  isAdmin = false,
  onAddChild,
  onSwitchParentDemo,
  onParentSendNotice,
  onUpdateStudentAddress,
  onRevertToPermanentAddress,
}) => {
  const [parentNoteSuccess, setParentNoteSuccess] = useState<string | null>(null);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  // Current active child for this parent view (strictly from this parent's kids)
  const currentChild = students.find((s) => s.id === selectedStudentId) || students[0];

  const is1MinProximity =
    currentChild.proximityAlertTriggered ||
    currentChild.status === 'proximity_alert_sent' ||
    currentChild.status === 'bus_arrived';

  const isBoarded = currentChild.status === 'boarded' || currentChild.status === 'at_school';
  const isAtSchool = currentChild.status === 'at_school';
  const isAbsent = currentChild.status === 'absent';

  const handleAction = (type: 'running_late' | 'mark_absent') => {
    onParentSendNotice(currentChild.id, type);
    const msg =
      type === 'running_late'
        ? 'ئاگاداری بۆ شۆفێر نێردرا: تکایە ٢ خولەک چاوەڕوان بن، منداڵەکەت لە دەرگایە.'
        : 'ئاگاداری بۆ شۆفێر و قوتابخانە نێردرا: قوتابی ئەمڕۆ نەهاتووە و وێستگەکە دەپەڕێندرێت.';
    setParentNoteSuccess(msg);
    setTimeout(() => setParentNoteSuccess(null), 4000);
  };

  return (
    <div id="parent-portal" dir="rtl" className="space-y-4 font-sans text-right">
      {/* Parent Account & Child Switcher Ribbon */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-3">
          {/* Top Line: Parent Identity & Privacy badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    ئەژمێری سەرپەرشتیار: <span className="text-emerald-700">{parentName || currentChild.parentName}</span>
                  </h3>
                  <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-bold px-2 py-0.5 rounded-full">
                    {students.length === 1 ? '١ منداڵی تۆمارکراو' : `${students.length} منداڵی تۆمارکراو`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3 text-emerald-600 inline" />
                  <span>تەنها دەتوانیت چاودێری منداڵانی خۆت بکەیت. زانیاری و ناونیشانی خێزانەکانی تر پارێزراوە.</span>
                </p>
              </div>
            </div>

            {/* Quick Demo Switcher for Testing Different Parents (ADMIN ONLY) */}
            {isAdmin && onSwitchParentDemo && allStudents.length > 1 && (
              <div className="flex items-center gap-1.5 self-end sm:self-center bg-amber-500/10 border border-amber-300/40 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] text-amber-800 font-bold hidden md:inline">👑 ئەدمین (تاقیکردنەوەی باوانی تر):</span>
                <select
                  id="demo-parent-switcher-select"
                  aria-label="تاقیکردنەوەی ئەژمێری باوانی تر"
                  value={currentChild.id}
                  onChange={(e) => onSwitchParentDemo(e.target.value)}
                  className="text-xs bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-amber-400 font-sans cursor-pointer font-medium"
                >
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.parentName} ({s.name})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Bottom Line: Child Selection or Single Child Display + Add Child Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-600 flex-shrink-0 ml-1">منداڵەکانت:</span>
              
              {students.map((student) => {
                const isSelected = student.id === currentChild.id;
                const hasAlert = student.proximityAlertTriggered;

                return (
                  <button
                    key={student.id}
                    id={`select-child-${student.id}`}
                    onClick={() => onSelectStudentId(student.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 ring-2 ring-amber-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${student.avatarBg}`} />
                    <span>{student.name}</span>
                    <span className="text-[10px] opacity-75">({student.grade.split(' ')[0]})</span>
                    {hasAlert && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                  </button>
                );
              })}
            </div>

            {/* Add Another Child Button */}
            {onAddChild && (
              <button
                id="open-add-child-modal-btn"
                type="button"
                onClick={() => setIsAddChildOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex-shrink-0 shadow-sm cursor-pointer self-start sm:self-center"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>+ زیادکردنی منداڵێکی تر</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1-MINUTE PROXIMITY ALERT HERO BANNER (Crucial requirement!) */}
      {is1MinProximity && !isBoarded && !isAbsent && (
        <div
          id="proximity-1min-hero-alert"
          className="bg-gradient-to-l from-amber-500 via-amber-400 to-amber-500 text-slate-950 rounded-2xl p-5 shadow-xl border-2 border-amber-600 animate-pulse relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-lg flex-shrink-0">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded">
                  ⚡ ئاگاداری ١ خولەک پێش گەیشتن
                </span>
                <h3 className="font-black text-xl text-slate-950 mt-1 leading-tight">
                  {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} نزیکەی ١ خولەک لە ماڵتان دوورە!
                </h3>
                <p className="text-xs text-slate-900 font-medium mt-0.5">
                  تکایە {currentChild.name.split(' ')[0]} ئامادە بێت لە بەردەم دەرگای ماڵ لە {currentChild.address}.
                </p>
              </div>
            </div>

            <button
              onClick={() => soundPlayer.playProximityChime()}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>تاقیکردنەوەی دەنگی زەنگ</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Live Status Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl ${currentChild.avatarBg} text-white flex items-center justify-center font-black text-xl shadow-md`}
            >
              {currentChild.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg text-slate-900">{currentChild.name}</h4>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {currentChild.grade}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span>
                    ناونیشانی هەمیشەیی: <strong className="text-slate-800">{currentChild.permanentAddress}</strong>
                  </span>
                </div>

                <div className="text-xs text-slate-700 flex items-center gap-1.5 flex-wrap">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>
                    شوێنی ئێستای سواربوون:{' '}
                    <strong className="text-slate-900">{currentChild.address}</strong>
                  </span>
                  {currentChild.isTemporaryAddress ? (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>📍 ناونیشانی کاتی</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      🏠 ناونیشانی هەمیشەیی
                    </span>
                  )}
                </div>
              </div>

              {/* If temporary address is active, display parent comment & revert button */}
              {currentChild.isTemporaryAddress && (
                <div className="mt-2.5 p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900">هۆکاری ناونیشانی کاتی: </span>
                      <span className="text-amber-800 font-medium">
                        {currentChild.addressChangeReason || 'دیاریکراوی کاتی لەلایەن باوانەوە'}
                      </span>
                    </div>
                  </div>

                  {onRevertToPermanentAddress && (
                    <button
                      type="button"
                      id="revert-permanent-address-btn"
                      onClick={() => onRevertToPermanentAddress(currentChild.id)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>گەڕاندنەوە بۆ ناونیشانی هەمیشەیی</span>
                    </button>
                  )}
                </div>
              )}

              {/* Edit Address / Set Temporary Address Button */}
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  id="open-edit-location-btn"
                  onClick={() => setIsEditLocationOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>
                    {currentChild.isTemporaryAddress
                      ? 'دەستکاریکردنی شوێنی کاتی یان تێبینی'
                      : 'دەستکاریکردنی شوێن / دانانی ناونیشانی کاتی'}
                  </span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                سەرپەرشتیار: <strong>{currentChild.parentName}</strong> ({currentChild.parentPhone})
              </p>
            </div>
          </div>

          {/* Current Live State Badge */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-[210px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">کاتی خەمڵێنراوی گەیشتن</span>
            {!bus.isOnDuty ? (
              <div className="text-slate-600 font-bold text-sm flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>شۆفێر دەوامی نییە (وەستاوە)</span>
              </div>
            ) : isBoarded ? (
              <div className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isAtSchool
                    ? `بە سەلامەتی لە قوتابخانەی ${school.name} دایە`
                    : `لەناو پاسی ${bus.busNumber === 'Bus 104' ? '١٠٤' : '١٠٨'} دایە (${currentChild.boardedTime || '7:42 AM'})`}
                </span>
              </div>
            ) : isAbsent ? (
              <div className="text-rose-600 font-bold text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>ئەمڕۆ نەهاتووە</span>
              </div>
            ) : is1MinProximity ? (
              <div className="text-amber-600 font-black text-base flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-amber-500 animate-spin" />
                <span>کەمتر لە ١ خولەک ({currentChild.distanceKm} کم)</span>
              </div>
            ) : (
              <div className="text-slate-900 font-extrabold text-base flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>~{currentChild.etaMinutes} خولەک ({currentChild.distanceKm} کم دوورە)</span>
              </div>
            )}
            <div className="text-[11px] text-slate-500 mt-1">
              ڕیزبەندی وێستگە: <strong>وێستگەی ژمارە #{currentChild.pickupSequence}</strong>
            </div>
          </div>
        </div>

        {/* 4-Step Journey Progression Stepper */}
        <div className="pt-4">
          <h5 className="font-bold text-slate-800 text-xs mb-3 flex items-center justify-between">
            <span>هێڵی کاتی قۆناغەکانی گەشت</span>
            <span className="text-slate-500 font-normal">
              {shift === 'morning_pickup' ? 'نۆبەی بەیانیان بۆ قوتابخانە' : 'نۆبەی دوانیوەڕوان بۆ ماڵەوە'}
            </span>
          </h5>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Step 1: Departed */}
            <div
              className={`p-2.5 rounded-xl border ${
                bus.status !== 'idle'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>١. بەڕێکەوتنی پاس</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {bus.status !== 'idle' ? 'لە کاتی خۆیدا بەڕێکەوتووە' : 'چاوەڕوانی دەستپێکردنە'}
              </p>
            </div>

            {/* Step 2: 1-Min Proximity Alert */}
            <div
              className={`p-2.5 rounded-xl border ${
                is1MinProximity || isBoarded
                  ? 'bg-amber-50 border-amber-200 text-amber-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    is1MinProximity ? 'bg-amber-500 animate-ping' : isBoarded ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                <span>٢. ئاگاداری ١ خولەک</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {is1MinProximity
                  ? 'ئاگاداری ئێستا چالاکە!'
                  : isBoarded
                  ? 'بە سەرکەوتوویی نێردرا'
                  : 'کاتێک ١ خولەک دوور بێت لێدەدات'}
              </p>
            </div>

            {/* Step 3: Boarded */}
            <div
              className={`p-2.5 rounded-xl border ${
                isBoarded
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span className={`w-2 h-2 rounded-full ${isBoarded ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>٣. سواربوونی قوتابی</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {isBoarded ? `بە سەلامەتی لەناو ${bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} دایە` : 'چاوەڕوانی سواربوونە'}
              </p>
            </div>

            {/* Step 4: Arrived at School */}
            <div
              className={`p-2.5 rounded-xl border ${
                isAtSchool
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <span className={`w-2 h-2 rounded-full ${isAtSchool ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>٤. گەیشتن بە قوتابخانە</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {isAtSchool ? 'چووەتە پۆلەکەی' : `کاتی زەنگ: ${school.morningBell}`}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Bus & Driver Card */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              🚌
            </div>
            <div>
              <div className="font-bold text-slate-900">
                {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} • شۆفێر {bus.driverName}
              </div>
              <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                <span>تابلۆ: {bus.plate}</span>
                <span>•</span>
                <span className={bus.isOnDuty ? 'text-emerald-600 font-semibold' : 'text-slate-500 font-medium'}>
                  {bus.isOnDuty ? '🟢 لە دەوامدایە (ڕاستەوخۆ)' : '⚪ دەوامی نییە (وەستاوە)'}
                </span>
                {bus.isOnDuty && <span>• {bus.speedKmh} کم/ک</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              id="call-driver-btn"
              href={`tel:${bus.driverPhone}`}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>پەیوەندی بە شۆفێر</span>
            </a>

            <a
              id="call-school-btn"
              href={`tel:${school.phone}`}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>پەیوەندی بە قوتابخانە</span>
            </a>
          </div>
        </div>

        {/* Parent Communication Shortcuts */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block mb-2">ئاگادارکردنەوەی خێرای شۆفێر و بەڕێوەبەرایەتی</span>
          {parentNoteSuccess && (
            <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{parentNoteSuccess}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              id="parent-running-late-btn"
              onClick={() => handleAction('running_late')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ⏳ تکایە ٢ خولەک چاوەڕوان بن (لە دەرگاین)
            </button>
            <button
              id="parent-mark-absent-btn"
              onClick={() => handleAction('mark_absent')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              ❌ منداڵەکەم نەخۆشە / ئەمڕۆ نایەت بۆ قوتابخانە (پەڕاندنی ماڵ)
            </button>
          </div>
        </div>
      </div>

      {/* Edit Location Modal */}
      {isEditLocationOpen && onUpdateStudentAddress && (
        <EditLocationModal
          isOpen={isEditLocationOpen}
          onClose={() => setIsEditLocationOpen(false)}
          student={currentChild}
          onSaveAddress={(studentId, update) => {
            onUpdateStudentAddress(studentId, update);
            const msg = update.isTemporary
              ? `ناونیشانی کاتی بۆ ${currentChild.name} تۆمارکرا لەگەڵ تێبینی بۆ شۆفێر.`
              : `ناونیشانی هەمیشەیی بۆ ${currentChild.name} بە سەرکەوتوویی نوێکرایەوە.`;
            setParentNoteSuccess(msg);
            setTimeout(() => setParentNoteSuccess(null), 5000);
          }}
        />
      )}

      {/* Add Another Child Modal */}
      {isAddChildOpen && onAddChild && (
        <AddChildModal
          isOpen={isAddChildOpen}
          onClose={() => setIsAddChildOpen(false)}
          parentName={parentName || currentChild.parentName}
          parentPhone={currentChild.parentPhone}
          parentEmail={currentChild.parentEmail}
          existingChild={currentChild}
          onAddChild={(newChild) => {
            onAddChild(newChild);
            const msg = `منداڵی نوێ (${newChild.name}) بە سەرکەوتوویی بۆ ئەم ئەژمێرە زیادکرا.`;
            setParentNoteSuccess(msg);
            setTimeout(() => setParentNoteSuccess(null), 5000);
          }}
        />
      )}
    </div>
  );
};
