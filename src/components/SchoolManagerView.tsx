import React, { useState } from 'react';
import { Bus, OptimizationMetrics, School, Student, TripShift } from '../types';
import {
  AlertTriangle,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Fuel,
  Megaphone,
  Radio,
  Search,
  ShieldAlert,
  TrendingDown,
  Users,
} from 'lucide-react';

interface SchoolManagerViewProps {
  school: School;
  buses: Bus[];
  students: Student[];
  metrics: OptimizationMetrics;
  shift: TripShift;
  onOpenBroadcastModal: () => void;
  onOpenDelayModal: () => void;
  onSelectStudent: (studentId: string) => void;
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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'boarded') return s.status === 'boarded' || s.status === 'at_school';
    if (statusFilter === 'waiting') return s.status === 'home_waiting' || s.status === 'proximity_alert_sent';
    if (statusFilter === 'absent') return s.status === 'absent';
    return true;
  });

  return (
    <div id="school-manager-view" dir="rtl" className="space-y-4 font-sans text-right">
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

      {/* Broadcast & Dispatch Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm">ناوەندی ئاگاداری فریاگوزاری و دواکەوتنی پاسەکان</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ناردنی پەیامی خێرا و کورتەنامەی هۆشیارکردنەوە بۆ هەموو دایک و باوکان و شۆفێران
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="manager-delay-btn"
            onClick={onOpenDelayModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>پەخشی ئاگاداری دواکەوتن</span>
          </button>

          <button
            id="manager-emergency-btn"
            onClick={onOpenBroadcastModal}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>پەخشی فریاگوزاری لەناکاو</span>
          </button>
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
              ماوەی چاوەڕوانکراوی گەیشتن: 07:55 AM – 08:10 AM (کاتی زەنگ: {school.morningBell})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {buses.map((b) => (
            <div
              key={b.id}
              className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow">
                  {b.busNumber === 'Bus 104' ? '١٠٤' : '١٠٨'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {b.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {b.plate}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span>شۆفێر: {b.driverName}</span>
                    <span>•</span>
                    <span className={b.isOnDuty ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'}>
                      {b.isOnDuty ? '🟢 لە دەوامدایە (GPS ڕاستەوخۆ)' : '⚪ دەوامی نییە'}
                    </span>
                    {b.isOnDuty && <span>• {b.speedKmh} کم/ک</span>}
                  </div>
                </div>
              </div>

              <div className="text-left">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>لە کاتی خۆیدایە</span>
                </span>
                <div className="text-xs font-bold text-slate-900 mt-1">گەیشتن: 08:08 AM</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Student Manifest with search & filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">تۆماری گشتی قوتابیانی قوتابخانە</h4>
            <p className="text-xs text-slate-500">چاودێری سەلامەتی، پەیوەندی بە سەرپەرشتیار و دۆخی وەرگرتن</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="گەڕان بەپێی ناوی قوتابی یان ناونیشان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 w-44 sm:w-56 text-right"
              />
            </div>

            {/* Filter pills */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">هەمووان ({students.length})</option>
              <option value="boarded">سەرکەوتووەکان ({boardedStudents})</option>
              <option value="waiting">چاوەڕوانەکان ({pendingStudents})</option>
              <option value="absent">نەهاتووەکان ({absentStudents})</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">ناوی قوتابی</th>
                <th className="py-2.5 px-3">ناونیشانی ماڵ</th>
                <th className="py-2.5 px-3">سەرپەرشتیار و تەلەفۆن</th>
                <th className="py-2.5 px-3">پاسی دیاریکراو</th>
                <th className="py-2.5 px-3">ڕیزبەندی وێستگە</th>
                <th className="py-2.5 px-3">دۆخی سەلامەتی</th>
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
                    onClick={() => onSelectStudent(s.id)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.grade}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[220px]">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <span className="truncate">{s.address}</span>
                        {s.isTemporaryAddress && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex-shrink-0">
                            کاتی
                          </span>
                        )}
                      </div>
                      {s.isTemporaryAddress ? (
                        <div className="text-[10px] text-amber-800 mt-0.5 space-y-0.5">
                          {s.addressChangeReason && (
                            <div className="truncate font-medium" title={s.addressChangeReason}>
                              💬 هۆکار: {s.addressChangeReason}
                            </div>
                          )}
                          <div className="text-slate-400 truncate">🏠 هەمیشەیی: {s.permanentAddress}</div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400">ناونیشانی هەمیشەیی</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{s.parentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.parentPhone}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                        پاسی ١٠٤
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">وێستگەی #{s.pickupSequence}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        (پێشتر #{s.originalSequence} بوو پێش کورتکردنەوە)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isBoarded ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>سواربوو ({s.boardedTime || '7:42 AM'})</span>
                        </span>
                      ) : isAbsent ? (
                        <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          <span>نەهاتووە</span>
                        </span>
                      ) : is1MinAlert ? (
                        <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full font-extrabold text-[11px] animate-pulse">
                          <span>ئاگاداری ١ خولەک چالاکە</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">چاوەڕوانە ({s.etaMinutes} خولەک)</span>
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
