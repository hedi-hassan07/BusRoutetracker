import React, { useState } from 'react';
import { Bus, OptimizationMetrics, School, Student, TripShift } from '../types';
import {
  AlertTriangle,
  Award,
  Bell,
  Bus as BusIcon,
  CheckCircle2,
  Clock,
  Filter,
  Fuel,
  History,
  Megaphone,
  Phone,
  Radio,
  Search,
  ShieldAlert,
  TrendingDown,
  User,
  Users,
} from 'lucide-react';
import { BusDetailsModal } from './BusDetailsModal';
import { ParentDetailsModal } from './ParentDetailsModal';
import { HistoricalTripsView } from './HistoricalTripsView';
import { MOCK_HISTORICAL_TRIPS } from '../data/mockHistoricalTrips';

interface SchoolManagerViewProps {
  school: School;
  buses: Bus[];
  students: Student[];
  metrics: OptimizationMetrics;
  shift: TripShift;
  onOpenBroadcastModal: () => void;
  onOpenDelayModal: () => void;
  onSelectStudent: (studentId: string) => void;
  onToggleAbsentStatus?: (studentId: string) => void;
  onFocusBusOnMap?: (busId: string) => void;
}

export const SchoolManagerView: React.FC<SchoolManagerViewProps> = ({
  school,
  buses,
  students,
  metrics,
  shift,
  onOpenBroadcastModal,
  onOpenDelayModal,
  onSelectStudent,
  onToggleAbsentStatus,
  onFocusBusOnMap,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'buses' | 'parents' | 'history'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected bus for modal
  const [selectedBusForModal, setSelectedBusForModal] = useState<Bus | null>(null);
  // Selected student/parent for modal
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  const totalStudents = students.length;
  const boardedStudents = students.filter((s) => s.status === 'boarded' || s.status === 'at_school').length;
  const absentStudents = students.filter((s) => s.status === 'absent').length;
  const pendingStudents = students.filter(
    (s) => s.status === 'home_waiting' || s.status === 'proximity_alert_sent' || s.status === 'bus_arrived'
  ).length;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'boarded') return s.status === 'boarded' || s.status === 'at_school';
    if (statusFilter === 'waiting') return s.status === 'home_waiting' || s.status === 'proximity_alert_sent';
    if (statusFilter === 'absent') return s.status === 'absent';
    return true;
  });

  return (
    <div id="school-manager-view" dir="rtl" className="space-y-4 font-sans text-right">
      {/* Tab Navigation Header */}
      <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto p-0.5">
          <button
            id="manager-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>تابلۆی گشتی و چاودێری ڕاستەوخۆ</span>
          </button>

          <button
            id="manager-tab-buses"
            onClick={() => setActiveTab('buses')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'buses'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BusIcon className="w-4 h-4 text-amber-400" />
            <span>هەموو پاسەکان ({buses.length})</span>
          </button>

          <button
            id="manager-tab-parents"
            onClick={() => setActiveTab('parents')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'parents'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>هەموو دایک و باوکان ({students.length})</span>
          </button>

          <button
            id="manager-tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>تۆماری مێژوویی گەشتەکان</span>
            <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.2 rounded-full">نوێ</span>
          </button>
        </div>

        {/* Quick broadcast shortcuts */}
        <div className="flex items-center gap-2">
          <button
            id="manager-quick-delay-btn"
            onClick={onOpenDelayModal}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">ئاگاداری دواکەوتن</span>
          </button>
          <button
            id="manager-quick-emergency-btn"
            onClick={onOpenBroadcastModal}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ئاگاداری لەناکاو</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* School Manager Fleet KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">زەنگی بەیانیان</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{school.morningBell}</div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> هەموو پاسەکان لە کاتی خۆیاندان
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">سواربوونی قوتابیان</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {boardedStudents} لە {totalStudents}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${totalStudents ? (boardedStudents / totalStudents) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">پاشەکەوتی بەنزین</span>
                <Fuel className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600">-{metrics.percentDistanceSaved}٪</div>
              <span className="text-[11px] text-slate-500 block mt-1">
                پاشەکەوتی {metrics.fuelSavedLiters} لیتر دیزڵ (${metrics.fuelCostSavedUsd})
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">شۆفێرانی چالاک</span>
                <Radio className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {buses.filter((b) => b.isOnDuty).length} لە {buses.length} لە دەوامدان
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                پەخشی ڕاستەوخۆی جی پی ئێسی مۆبایل
              </span>
            </div>
          </div>

          {/* School Arrival Board (Airport Style) */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  تابلۆی ڕاستەوخۆی گەیشتنی پاسەکان — {school.name}
                </h4>
                <p className="text-xs text-slate-500">
                  چاودێری کاتی گەیشتن بەپێی نەخشەی ئەلگۆریتمی ڕێکخراو (دەوامی{' '}
                  {shift === 'morning_pickup' ? 'بەیانیان' : 'دوانیوەڕوان'})
                </p>
              </div>

              <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>نوێبوونەوەی ڕاستەوخۆ</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {buses.map((bus) => {
                const busStudents = students.filter((s) => s.busId === bus.id);
                const busBoarded = busStudents.filter((s) => s.status === 'boarded' || s.status === 'at_school').length;
                const isDelayed = bus.delayMinutes > 0;

                return (
                  <div
                    key={bus.id}
                    id={`overview-bus-card-${bus.id}`}
                    onClick={() => setSelectedBusForModal(bus)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/20 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
                          🚌
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({bus.plate})</span>
                          </div>
                          <div className="text-[11px] text-slate-500">شۆفێر: {bus.driverName}</div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          bus.status === 'at_school'
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDelayed
                            ? 'bg-rose-100 text-rose-800'
                            : bus.isOnDuty
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {bus.status === 'at_school'
                          ? 'گەیشتە قوتابخانە'
                          : isDelayed
                          ? `دواکەوتووە (${bus.delayMinutes} خ)`
                          : bus.isOnDuty
                          ? 'لە ڕێگادایە'
                          : 'دەوامی نییە'}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <div>
                        سواربووان: <strong className="text-slate-900">{busBoarded} لە {busStudents.length}</strong>
                      </div>
                      <div>
                        خێرایی: <strong className="text-slate-900">{bus.speedKmh} کم/ک</strong>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 hover:underline">
                        بینینی زانیاری تەواو ←
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ALL BUSES ================= */}
      {activeTab === 'buses' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                بەڕێوەبردنی کەشتی گواستنەوە — هەموو پاسەکان ({buses.length} پاس)
              </h4>
              <p className="text-xs text-slate-500">
                کلیک لەسەر هەر پاسێک بکە بۆ بینینی سەرجەم زانیارییەکان، شۆفێر، و لیستی قوتابیان.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buses.map((bus) => {
              const busStudents = students.filter((s) => s.busId === bus.id);
              const busBoarded = busStudents.filter((s) => s.status === 'boarded' || s.status === 'at_school').length;
              const busAbsent = busStudents.filter((s) => s.status === 'absent').length;

              return (
                <div
                  key={bus.id}
                  id={`fleet-bus-card-${bus.id}`}
                  onClick={() => setSelectedBusForModal(bus)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-amber-400 hover:shadow-md transition cursor-pointer relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-400/20">
                        <BusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">
                            {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}
                          </h4>
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {bus.plate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {bus.model || 'Mercedes-Benz Sprinter'} ({bus.year || 2023})
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        bus.isOnDuty
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {bus.isOnDuty ? '🟢 لە دەوامدایە' : '⚪ وەستاوە'}
                    </span>
                  </div>

                  {/* Driver Mini Card */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={bus.driverPhoto}
                        alt={bus.driverName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{bus.driverName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{bus.driverPhone}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      پەیوەندی بە شۆفێر
                    </span>
                  </div>

                  {/* Specs row */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">توانا:</span>
                      <span className="font-bold text-slate-800">{bus.capacity} سەرنشین</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">سووتەمەنی:</span>
                      <span className="font-bold text-emerald-600">{bus.fuelTankLiters} لیتر</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">سواربووان:</span>
                      <span className="font-bold text-slate-800">
                        {busBoarded}/{busStudents.length} قوتابی
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {busAbsent > 0 ? `⚠️ ${busAbsent} قوتابی نەخۆش/نەهاتوو لەم پاسە` : 'سەرجەم قوتابیان لە پڕۆگرامدان'}
                    </span>
                    <span className="font-bold text-amber-600">بینینی وردەکاری و لیستی قوتابیان ←</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ALL PARENTS & STUDENTS ================= */}
      {activeTab === 'parents' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                تۆماری سەرجەم دایک و باوکان و قوتابیان ({students.length} خێزان)
              </h4>
              <p className="text-xs text-slate-500">
                کلیک لەسەر هەر دایک و باوکێک بکە بۆ بینینی سەرجەم زانیارییەکان، ناونیشانی کاتی و هەمیشەیی، و گۆڕینی دۆخی نەخۆشی.
              </p>
            </div>

            {/* Filters and search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  id="manager-search-parents-input"
                  type="text"
                  placeholder="گەڕان بەپێی ناوی باوان، قوتابی، مۆبایل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-800 focus:outline-none focus:border-amber-400 w-52 sm:w-64"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <select
                id="manager-filter-status-select"
                aria-label="فلتەرکردنی دۆخی قوتابیان"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">هەموو دۆخەکان</option>
                <option value="boarded">سواربووەکان</option>
                <option value="waiting">چاوەڕوانەکان</option>
                <option value="absent">نەخۆش و نەهاتووەکان</option>
              </select>
            </div>
          </div>

          {/* Parents Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-3 px-3">ناوی باوان و پەیوەندی</th>
                  <th className="py-3 px-3">ناوی قوتابی و پۆل</th>
                  <th className="py-3 px-3">ناونیشانی کارا</th>
                  <th className="py-3 px-3">پاسی دیاریکراو</th>
                  <th className="py-3 px-3">ڕیزبەندی وێستگە</th>
                  <th className="py-3 px-3">دۆخی ئامادەبوون</th>
                  <th className="py-3 px-3 text-center">کردار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const isBoarded = s.status === 'boarded' || s.status === 'at_school';
                  const isAbsent = s.status === 'absent';
                  const is1MinAlert = s.proximityAlertTriggered || s.status === 'proximity_alert_sent';

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudentForModal(s)}
                      className="hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{s.parentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{s.parentPhone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${s.avatarBg}`} />
                          <span>{s.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{s.grade}</div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="font-medium text-slate-800 truncate">{s.address}</div>
                        {s.isTemporaryAddress && (
                          <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-0.5">
                            کاتی
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-bold">
                          {s.busId === 'bus_108' ? 'پاسی ١٠٨' : 'پاسی ١٠٤'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {isAbsent ? (
                          <span className="text-[11px] text-rose-600 font-bold">
                            لە ڕێگا سڕاوەتەوە
                          </span>
                        ) : (
                          <span className="font-bold text-slate-800">وێستگەی #{s.pickupSequence}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isBoarded ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>سواربوو</span>
                          </span>
                        ) : isAbsent ? (
                          <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <span>نەهاتوو/نەخۆش</span>
                          </span>
                        ) : is1MinAlert ? (
                          <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full font-extrabold text-[11px] animate-pulse">
                            <span>ئاگاداری ١ خولەک</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">چاوەڕوان ({s.etaMinutes} خ)</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForModal(s);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          زانیاری باوان
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: HISTORICAL LOGS ================= */}
      {activeTab === 'history' && (
        <HistoricalTripsView logs={MOCK_HISTORICAL_TRIPS} buses={buses} />
      )}

      {/* ================= MODALS ================= */}
      {/* Bus Details Modal */}
      <BusDetailsModal
        bus={selectedBusForModal}
        isOpen={!!selectedBusForModal}
        onClose={() => setSelectedBusForModal(null)}
        assignedStudents={
          selectedBusForModal
            ? students.filter((s) => s.busId === selectedBusForModal.id)
            : []
        }
        school={school}
        onFocusBusOnMap={onFocusBusOnMap}
      />

      {/* Parent Details Modal */}
      <ParentDetailsModal
        student={selectedStudentForModal}
        isOpen={!!selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
        assignedBus={
          selectedStudentForModal
            ? buses.find((b) => b.id === selectedStudentForModal.busId)
            : undefined
        }
        school={school}
        onToggleAbsentStatus={onToggleAbsentStatus}
        onFocusOnMap={onSelectStudent}
      />
    </div>
  );
};
