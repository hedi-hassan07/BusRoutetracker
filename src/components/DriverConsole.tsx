import React, { useState } from 'react';
import { Bus, OptimizationMetrics, School, StopWaypoint, Student, TripShift } from '../types';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Fuel,
  LocateFixed,
  MapPin,
  Navigation,
  Pause,
  Phone,
  Play,
  Power,
  PowerOff,
  Radio,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Sparkles,
  UserCheck,
  UserX,
} from 'lucide-react';

interface DriverConsoleProps {
  bus: Bus;
  students: Student[];
  school: School;
  waypoints: StopWaypoint[];
  metrics: OptimizationMetrics;
  shift: TripShift;
  onToggleDuty: () => void;
  onTogglePhoneGps?: () => void;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  onResetSimulation: () => void;
  onSetSimulationSpeed: (speed: number) => void;
  onBoardStudent: (studentId: string) => void;
  onMarkAbsent: (studentId: string) => void;
  onSkipStop: (studentId: string) => void;
  onOptimizeRoute: () => void;
  onReportDelay: () => void;
  onTriggerEmergency: () => void;
  onSelectStudent: (studentId: string) => void;
}

export const DriverConsole: React.FC<DriverConsoleProps> = ({
  bus,
  students,
  school,
  waypoints,
  metrics,
  shift,
  onToggleDuty,
  onTogglePhoneGps,
  onStartSimulation,
  onPauseSimulation,
  onResetSimulation,
  onSetSimulationSpeed,
  onBoardStudent,
  onMarkAbsent,
  onSkipStop,
  onOptimizeRoute,
  onReportDelay,
  onTriggerEmergency,
  onSelectStudent,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Find next pending or active student
  const activeStudent = students.find(
    (s) => s.status === 'home_waiting' || s.status === 'proximity_alert_sent' || s.status === 'bus_arrived'
  );

  const boardedCount = students.filter((s) => s.status === 'boarded' || s.status === 'at_school').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const totalCount = students.length;
  const progressPercent = totalCount > 0 ? Math.round(((boardedCount + absentCount) / totalCount) * 100) : 0;

  const handleOptimizeClick = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      onOptimizeRoute();
      setIsOptimizing(false);
    }, 600);
  };

  return (
    <div id="driver-console" dir="rtl" className="space-y-4 font-sans text-right">
      {/* Mobile Phone Driver Status & Shift Activation Card */}
      <div
        id="driver-duty-card"
        className={`rounded-2xl p-4 sm:p-5 border shadow-sm transition-all ${
          bus.isOnDuty
            ? 'bg-gradient-to-l from-emerald-950 via-slate-900 to-slate-900 text-white border-emerald-500/40 shadow-emerald-950/20'
            : 'bg-white text-slate-800 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg flex-shrink-0 transition-transform ${
                bus.isOnDuty
                  ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-emerald-500/30'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  id="driver-duty-status-badge"
                  className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    bus.isOnDuty
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      bus.isOnDuty ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                    }`}
                  />
                  <span>{bus.isOnDuty ? '🟢 لە دەوامدایە (چالاکە)' : '⚪ دەوامی نییە (وەستاوە)'}</span>
                </span>
                <span className={`text-xs font-mono font-bold ${bus.isOnDuty ? 'text-amber-400' : 'text-slate-500'}`}>
                  {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}
                </span>
              </div>
              <h3 className="font-bold text-base mt-1 leading-tight">
                {bus.driverName} • کۆنسۆڵی مۆبایل
              </h3>
              <p className={`text-xs mt-0.5 ${bus.isOnDuty ? 'text-slate-300' : 'text-slate-500'}`}>
                {bus.isOnDuty
                  ? `دەستپێکردن: کاتژمێر ${bus.dutyStartedAt || '07:15 AM'} • پەخشی ڕاستەوخۆ بۆ باوان و بەڕێوەبەرایەتی دەڕوات`
                  : 'دەوام ناچالاکە. کرتە لە "چالاککردن" بکە تا پەخشی شوێن و ڕێڕەوی پاس دەستپێبکات.'}
              </p>
            </div>
          </div>

          {/* Primary Mobile Touch-Friendly Button to Activate or Deactivate */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {bus.isOnDuty ? (
              <button
                id="driver-deactivate-btn"
                onClick={onToggleDuty}
                className="min-h-[48px] px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                title="کرتە بکە کاتێک کارت تەواو بوو بۆ داخستنی دەوام"
              >
                <PowerOff className="w-4 h-4" />
                <span>ناچالاککردن (تەواوکردنی کار)</span>
              </button>
            ) : (
              <button
                id="driver-activate-btn"
                onClick={onToggleDuty}
                className="min-h-[48px] px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                title="کرتە بکە بۆ دەستپێکردنی دەوام و پەخشکردنی جی پی ئێس"
              >
                <Power className="w-4 h-4" />
                <span>چالاککردن (دەستپێکردنی کار)</span>
              </button>
            )}

            {onTogglePhoneGps && bus.isOnDuty && (
              <button
                id="driver-toggle-real-gps-btn"
                onClick={onTogglePhoneGps}
                className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  bus.phoneGpsActive
                    ? 'bg-slate-800 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700'
                }`}
                title="پەیوەستکردنی جی پی ئێسی ڕاستەقینەی مۆبایل"
              >
                <LocateFixed className="w-4 h-4" />
                <span>GPSی مۆبایل</span>
              </button>
            )}
          </div>
        </div>

        {/* Offline notice when shift is deactivated */}
        {!bus.isOnDuty && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span>پەخشی شوێن ڕاگیراوە چونکە شۆفێر لە دەوامدا نییە</span>
            </span>
            <span className="font-semibold text-slate-700">ئامادەیە بۆ دەوامی داهاتوو</span>
          </div>
        )}
      </div>

      {/* If driver is OFF DUTY, show standby banner */}
      {!bus.isOnDuty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-amber-950 mb-0.5">شۆفێر ئێستا لە دەوامدا نییە (وەستاوە)</span>
            <p className="text-amber-800">
              ئێستا کارەکەت لە دۆخی وەستاندایە و دایک و باوکان پاسەکە وەک وەستاو لە قوتابخانە دەبینن. 
              کاتێک ئامادە بوویت بۆ کۆکردنەوەی قوتابیان، لە سەرەوە کرتە لە <strong>"چالاککردن (دەستپێکردنی کار)"</strong> بکە.
            </p>
          </div>
        </div>
      )}

      {/* Route Fuel & Time Savings KPI Banner */}
      <div className="bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">ڕێکخستنی کورتترین ڕێگای زیرەک (TSP)</h3>
                <span className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  -{metrics.percentDistanceSaved}٪ بەنزین و دووری
                </span>
              </div>
              <p className="text-xs text-slate-600">
                بەهۆی کورتکردنەوەی ڕێگاکە {metrics.fuelSavedLiters} لیتر بەنزین و {metrics.timeSavedMin} خولەک کات پاشەکەوت دەکرێت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="recalculate-route-btn"
              onClick={handleOptimizeClick}
              disabled={isOptimizing}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'دووبارە هەژماردن...' : 'ڕێکخستنەوەی ڕێگا'}</span>
            </button>
          </div>
        </div>

        {/* Stats Pill Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-amber-500/20 text-xs">
          <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">دووری ڕێگای نوێ</span>
            <span className="text-sm font-black text-slate-900">{metrics.optimizedDistanceKm} کم</span>
            <span className="text-[10px] text-emerald-600 block font-semibold">{metrics.distanceSavedKm} کم پاشەکەوتکراوە</span>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">کاتی خەمڵێنراو</span>
            <span className="text-sm font-black text-slate-900">{metrics.optimizedTimeMin} خولەک</span>
            <span className="text-[10px] text-emerald-600 block font-semibold">{metrics.timeSavedMin} خولەک خێراترە</span>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">بەنزینی پارێزراو</span>
            <span className="text-sm font-black text-amber-600">{metrics.fuelSavedLiters} لیتر</span>
            <span className="text-[10px] text-slate-500 block">نزیکەی ${metrics.fuelCostSavedUsd} پاشەکەوت</span>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-xl p-2.5 border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">پاراستنی ژینگە</span>
            <span className="text-sm font-black text-emerald-700">{metrics.co2SavedKg} کگم CO₂</span>
            <span className="text-[10px] text-emerald-600 block font-semibold">پاسی دۆستی ژینگە</span>
          </div>
        </div>
      </div>

      {/* Simulator Driver Control Panel */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                شۆفێر: {bus.driverName}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'} • {bus.plate}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {shift === 'morning_pickup' ? '🌅 نۆبەی بەیانیان: کۆکردنەوەی قوتابیان بۆ قوتابخانە' : '🌇 نۆبەی دوانیوەڕوان: گەڕاندنەوەی قوتابیان بۆ ماڵەوە'}
            </p>
          </div>

          {/* Simulation buttons */}
          <div className="flex items-center gap-2">
            {!bus.isSimulating ? (
              <button
                id="driver-start-route-btn"
                onClick={onStartSimulation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>دەستپێکردنی ڕێگا</span>
              </button>
            ) : (
              <button
                id="driver-pause-route-btn"
                onClick={onPauseSimulation}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>وەستاندن</span>
              </button>
            )}

            <button
              id="driver-reset-route-btn"
              onClick={onResetSimulation}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              title="گەڕاندنەوەی پاس بۆ سەرەتا"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Simulation speed multiplier */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
              {[1, 2, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onSetSimulationSpeed(spd)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    bus.simulationSpeed === spd
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
            <span>
              قۆناغی گەشت: <strong>{boardedCount} لە {totalCount}</strong> قوتابی سەرکەوتوون ({absentCount} نەهاتوون)
            </span>
            <span className="font-bold text-slate-900">{progressPercent}٪</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Stop Card (Turn-by-Turn Waypoint Action) */}
      {activeStudent ? (
        <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-amber-400/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-br-xl tracking-wider uppercase flex items-center gap-1 shadow-sm">
            <Navigation className="w-3.5 h-3.5" />
            <span>وێستگەی داهاتوو #{activeStudent.pickupSequence}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl ${activeStudent.avatarBg} text-white flex items-center justify-center font-extrabold text-lg shadow-md`}
              >
                {activeStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg text-slate-900">{activeStudent.name}</h4>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {activeStudent.grade}
                  </span>
                </div>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>
                    ناونیشان: <strong>{activeStudent.address}</strong>
                  </span>
                  {activeStudent.isTemporaryAddress && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      📍 کاتی
                    </span>
                  )}
                </p>

                {/* Temporary Address Alert with Parent Comment */}
                {activeStudent.isTemporaryAddress && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-900">
                      <span>⚠️ باوان ناونیشانی کاتی بۆ ئەم قوتابیە داناوە:</span>
                    </div>
                    {activeStudent.addressChangeReason && (
                      <div className="text-[11px] text-amber-900">
                        <strong>هۆکار / تێبینی باوان:</strong> "{activeStudent.addressChangeReason}"
                      </div>
                    )}
                    {activeStudent.permanentAddress && (
                      <div className="text-[10px] text-slate-500">
                        ناونیشانی هەمیشەیی ماڵەوە: {activeStudent.permanentAddress}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                  <span>
                    سەرپەرشتیار: <strong>{activeStudent.parentName}</strong>
                  </span>
                  <a
                    href={`tel:${activeStudent.parentPhone}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-0.5 rounded"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{activeStudent.parentPhone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Proximity & Distance indicators */}
            <div className="flex flex-col items-start md:items-start justify-center bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-[180px]">
              {activeStudent.proximityAlertTriggered || activeStudent.status === 'proximity_alert_sent' ? (
                <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 animate-pulse mb-1">
                  <span>⚡ ئاگاداری ١ خولەک پێش گەیشتن چالاکە!</span>
                </div>
              ) : (
                <div className="text-xs text-slate-600 mb-1">
                  گەیشتن لە ماوەی <strong>~{activeStudent.etaMinutes} خولەکدا</strong>
                </div>
              )}
              <div className="text-xs text-slate-500">
                دووری ماڵ: <strong className="text-slate-800">{activeStudent.distanceKm} کم</strong>
              </div>
            </div>
          </div>

          {activeStudent.notes && (
            <div className="mt-3 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
              <strong>تێبینی بۆ شۆفێر:</strong> {activeStudent.notes}
            </div>
          )}

          {/* Action buttons for this stop */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              id={`board-student-${activeStudent.id}`}
              onClick={() => onBoardStudent(activeStudent.id)}
              className="flex-1 min-w-[140px] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>سواری پاس بوو</span>
            </button>

            <button
              id={`absent-student-${activeStudent.id}`}
              onClick={() => onMarkAbsent(activeStudent.id)}
              className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-4 h-4" />
              <span>نەهاتووە</span>
            </button>

            <button
              id={`skip-student-${activeStudent.id}`}
              onClick={() => onSkipStop(activeStudent.id)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition cursor-pointer"
            >
              پەڕاندن
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center shadow-sm">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-emerald-950 text-base">هەموو وێستگەکانی قوتابیان تەواو بوون!</h4>
          <p className="text-xs text-emerald-700 mt-1">
            پاسەکە ڕاستەوخۆ بەرەو <strong>{school.name}</strong> بەڕێکەوتووە بۆ دابەزاندن.
          </p>
        </div>
      )}

      {/* Driver Incident Reporting & Emergency SOS Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>پێویستت بە ئاگادارکردنەوەی بەڕێوەبەرایەتی و باوان هەیە دەربارەی قەرەباڵغی یان ڕووداو؟</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="driver-report-delay-btn"
            onClick={onReportDelay}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ڕاگەیاندنی دواکەوتن</span>
          </button>

          <button
            id="driver-emergency-btn"
            onClick={onTriggerEmergency}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>فریاگوزاری لەناکاو (SOS)</span>
          </button>
        </div>
      </div>

      {/* Full Optimized Student Manifest Table */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
          <span>لیستی ڕێکخراوی قوتابیان ({students.length} وێستگە)</span>
          <span className="text-xs font-normal text-slate-500">بەپێی کورتترین ڕێگا ڕێکخراوە</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2 px-2">ڕیزبەندی</th>
                <th className="py-2 px-2">ناوی قوتابی</th>
                <th className="py-2 px-2">ناونیشان</th>
                <th className="py-2 px-2">کاتی گەیشتن</th>
                <th className="py-2 px-2">دۆخ</th>
                <th className="py-2 px-2 text-left">کردار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => {
                const isCompleted = student.status === 'boarded' || student.status === 'at_school';
                const isAbsent = student.status === 'absent';
                const isCurrent = activeStudent?.id === student.id;

                return (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent(student.id)}
                    className={`hover:bg-slate-50 transition cursor-pointer ${
                      isCurrent ? 'bg-amber-50/60 font-medium' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCurrent
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {student.pickupSequence}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500">{student.grade}</div>
                    </td>
                    <td className="py-2.5 px-2 text-slate-600 max-w-[200px]" title={student.address}>
                      <div className="truncate flex items-center gap-1">
                        <span>{student.address}</span>
                        {student.isTemporaryAddress && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-1 rounded flex-shrink-0">
                            کاتی
                          </span>
                        )}
                      </div>
                      {student.isTemporaryAddress && student.addressChangeReason && (
                        <div className="text-[10px] text-amber-800 truncate" title={student.addressChangeReason}>
                          💬 {student.addressChangeReason}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 font-mono text-slate-700">
                      {isCompleted ? (student.boardedTime || 'گەیشتووە') : `${student.etaMinutes} خولەک`}
                    </td>
                    <td className="py-2.5 px-2">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>سواری پاس بوو</span>
                        </span>
                      ) : isAbsent ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          <span>نەهاتووە</span>
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold text-[11px] animate-pulse">
                          <span>وێستگەی ئێستا</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">چاوەڕوانە</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-left">
                      {!isCompleted && !isAbsent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBoardStudent(student.id);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm cursor-pointer"
                        >
                          سەرکەوت
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
