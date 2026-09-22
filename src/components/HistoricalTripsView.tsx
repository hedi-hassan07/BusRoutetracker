import React, { useState } from 'react';
import { Bus, BusTripLog, TripShift } from '../types';
import {
  Calendar,
  Clock,
  Gauge,
  CheckCircle2,
  TrendingUp,
  Fuel,
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Award,
  Bus as BusIcon,
  AlertCircle,
} from 'lucide-react';

interface HistoricalTripsViewProps {
  logs: BusTripLog[];
  buses: Bus[];
}

export const HistoricalTripsView: React.FC<HistoricalTripsViewProps> = ({ logs, buses }) => {
  const [selectedBusId, setSelectedBusId] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (selectedBusId !== 'all' && log.busId !== selectedBusId) return false;
    if (selectedShift !== 'all' && log.shift !== selectedShift) return false;
    return true;
  });

  // Calculate aggregated stats
  const totalTrips = filteredLogs.length;
  const avgDuration =
    totalTrips > 0
      ? Math.round(filteredLogs.reduce((acc, curr) => acc + curr.totalDurationMin, 0) / totalTrips)
      : 0;
  const avgSpeed =
    totalTrips > 0
      ? Number(
          (filteredLogs.reduce((acc, curr) => acc + curr.averageSpeedKmh, 0) / totalTrips).toFixed(1)
        )
      : 0;
  const avgCompletionRate =
    totalTrips > 0
      ? Number(
          (
            filteredLogs.reduce((acc, curr) => acc + curr.completionRatePercent, 0) / totalTrips
          ).toFixed(1)
        )
      : 0;
  const totalDieselSaved = Number(
    filteredLogs.reduce((acc, curr) => acc + curr.dieselSavedLiters, 0).toFixed(1)
  );

  return (
    <div id="historical-trips-view" dir="rtl" className="space-y-4 font-sans text-right">
      {/* Top Aggregation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">تێکڕای کاتی گەشت</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgDuration} خولەک</div>
          <span className="text-[11px] text-slate-500 block mt-1">
            تێکڕای سەرجەم گەشتە ئەنجامدراوەکان
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">تێکڕای خێرایی پاس</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{avgSpeed} کم/ک</div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            خێرایی سەلامەت و یاسایی ناو شار
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">تەواوکاری سواربوون</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{avgCompletionRate}٪</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, avgCompletionRate)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">دیزڵی پاشەکەوتکراو</span>
            <Fuel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalDieselSaved} لیتر</div>
          <span className="text-[11px] text-slate-500 block mt-1">
            پاشەکەوتکراو بەهۆی کورتکردنەوەی ڕێگاکان
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h4 className="font-bold text-slate-900 text-sm">
            تۆماری مێژوویی ڕۆژانەی گەشتەکانی پاس ({filteredLogs.length} گەشت)
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bus Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <BusIcon className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">پاس:</span>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">هەموو پاسەکان</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : b.busNumber === 'Bus 108' ? 'پاسی ١٠٨' : b.busNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">کاتی دەوام:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">بەیانیان و دوانیوەڕوان</option>
              <option value="morning_pickup">بەیانیان (هێنان بۆ قوتابخانە)</option>
              <option value="afternoon_dropoff">دوانیوەڕوان (گەڕانەوە بۆ ماڵ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="py-3 px-3">بەروار و کات</th>
                <th className="py-3 px-3">پاس و شۆفێر</th>
                <th className="py-3 px-3">ماوەی گەشت</th>
                <th className="py-3 px-3">مەودا و خێرایی</th>
                <th className="py-3 px-3">ڕێژەی سواربوونی قوتابیان (Completion Rate)</th>
                <th className="py-3 px-3">پاشەکەوتی دیزڵ</th>
                <th className="py-3 px-3">دۆخی گەیشتن</th>
                <th className="py-3 px-3 text-center">وردەکاری</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const isExpanded = expandedTripId === log.id;
                const is100Percent = log.completionRatePercent >= 100;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedTripId(isExpanded ? null : log.id)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isExpanded ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono">{log.date}</div>
                        <div className="text-[11px] text-slate-500">
                          {log.shift === 'morning_pickup' ? '🌅 بەیانیان' : '🌇 دوانیوەڕوان'} (
                          {log.departureTime} - {log.arrivalTime})
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          {log.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : 'پاسی ١٠٨'}
                        </div>
                        <div className="text-[11px] text-slate-500">{log.driverName}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                          {log.totalDurationMin} خولەک
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{log.totalDistanceKm} کم</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-blue-500" />
                          <span>تێکڕا: {log.averageSpeedKmh} کم/ک</span>
                        </div>
                      </td>

                      {/* Student Pickup Completion Rate */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-md ${
                              is100Percent
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {log.completionRatePercent}٪
                          </span>
                          <span className="text-[11px] text-slate-600">
                            ({log.studentsPickedUp} لە {log.totalStudentsAssigned} قوتابی)
                          </span>
                        </div>
                        <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full ${is100Percent ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, log.completionRatePercent)}%` }}
                          />
                        </div>
                        {log.absentCount > 0 && (
                          <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                            {log.absentCount} قوتابی نەخۆش/نەهاتوو
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-bold text-emerald-600">
                        +{log.dieselSavedLiters} لیتر
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            log.onTimeStatus === 'on_time'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{log.onTimeStatus === 'on_time' ? 'لە کاتی خۆیدا' : 'دواکەوتنی کەم'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 mx-auto text-amber-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    {isExpanded && (
                      <tr className="bg-amber-50/30 border-b border-slate-200">
                        <td colSpan={8} className="p-4 text-xs">
                          <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>تێبینی و هەڵسەنگاندنی گەشتی {log.date}:</span>
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                دەستپێکردن: {log.departureTime} | گەیشتن: {log.arrivalTime}
                              </span>
                            </div>

                            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              {log.notes}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <span className="text-slate-500 block">قوتابیانی سواربوو:</span>
                                <span className="font-bold text-slate-900">
                                  {log.studentsPickedUp} لە {log.totalStudentsAssigned} قوتابی
                                </span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <span className="text-slate-500 block">پاشەکەوتی دارایی سووتەمەنی:</span>
                                <span className="font-bold text-emerald-600">
                                  ${(log.dieselSavedLiters * 1.15).toFixed(2)} دۆلار
                                </span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <span className="text-slate-500 block">دۆخی چوونە پۆل:</span>
                                <span className="font-bold text-indigo-700">
                                  پێش زەنگی فەرمی گەیشتن
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
