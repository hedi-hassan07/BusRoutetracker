import React from 'react';
import { Bus, Student, School } from '../types';
import {
  X,
  Bus as BusIcon,
  Phone,
  ShieldCheck,
  Fuel,
  Users,
  CheckCircle2,
  Clock,
  Gauge,
  Calendar,
  AlertTriangle,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface BusDetailsModalProps {
  bus: Bus | null;
  isOpen: boolean;
  onClose: () => void;
  assignedStudents: Student[];
  school: School;
  onFocusBusOnMap?: (busId: string) => void;
}

export const BusDetailsModal: React.FC<BusDetailsModalProps> = ({
  bus,
  isOpen,
  onClose,
  assignedStudents,
  school,
  onFocusBusOnMap,
}) => {
  if (!isOpen || !bus) return null;

  const boardedCount = assignedStudents.filter(
    (s) => s.status === 'boarded' || s.status === 'at_school'
  ).length;
  const absentCount = assignedStudents.filter((s) => s.status === 'absent').length;
  const waitingCount = assignedStudents.filter(
    (s) => s.status === 'home_waiting' || s.status === 'proximity_alert_sent' || s.status === 'bus_arrived'
  ).length;

  return (
    <div
      id="bus-details-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="bus-details-modal"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden font-sans text-right animate-in fade-in zoom-in-95 duration-200 my-auto"
      >
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-400/20">
              <BusIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {bus.busNumber === 'Bus 104' ? 'پاسی ١٠٤' : bus.busNumber === 'Bus 108' ? 'پاسی ١٠٨' : bus.busNumber}
                </h3>
                <span className="text-xs font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded-lg border border-slate-700">
                  {bus.plate}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    bus.isOnDuty
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {bus.isOnDuty ? '🟢 لە دەوامدایە' : '⚪ وەستاوە'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {bus.model || 'Mercedes-Benz Sprinter'} ({bus.year || 2023}) • تایبەت بە {school.name}
              </p>
            </div>
          </div>

          <button
            id="close-bus-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Driver Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={bus.driverPhoto}
                alt={bus.driverName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">شۆفێری ڕێگەپێدراو</span>
                <h4 className="font-bold text-slate-900 text-base">{bus.driverName}</h4>
                <span className="text-xs text-slate-600 font-mono">{bus.driverPhone}</span>
              </div>
            </div>

            <a
              id="modal-call-driver-btn"
              href={`tel:${bus.driverPhone}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer self-start sm:self-center"
            >
              <Phone className="w-4 h-4" />
              <span>پەیوەندی ڕاستەوخۆ بە شۆفێر</span>
            </a>
          </div>

          {/* Key Bus Specs & Live Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>توانای کورسی</span>
              </span>
              <div className="text-base font-black text-slate-900 mt-1">
                {bus.capacity} سەرنشین
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {assignedStudents.length} قوتابی دیاریکراو
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>خێرایی ئێستا</span>
              </span>
              <div className="text-base font-black text-slate-900 mt-1">
                {bus.speedKmh} کم/ک
              </div>
              <span className="text-[10px] text-emerald-600 block mt-0.5">
                {bus.speedKmh > 0 ? 'لە جووڵەدایە' : 'وەستاوە'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                <span>سووتەمەنی تەنکی</span>
              </span>
              <div className="text-base font-black text-slate-900 mt-1">
                {bus.fuelTankLiters} لیتر
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {bus.avgLitersPer100Km}L / 100km تێکڕا
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>پشکنینی سەلامەتی</span>
              </span>
              <div className="text-base font-black text-emerald-600 mt-1">
                بێ کێشەیە
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                دوا پشکنین: {bus.lastServiceDate || '2026-09-10'}
              </span>
            </div>
          </div>

          {/* Live Attendance Progress for this Bus */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                <span>دۆخی سواربوونی قوتابیانی ئەم پاسە ({boardedCount} لە {assignedStudents.length})</span>
              </h5>
              <span className="text-xs font-bold text-amber-600">
                {assignedStudents.length ? Math.round((boardedCount / assignedStudents.length) * 100) : 0}٪
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{
                  width: `${assignedStudents.length ? (boardedCount / assignedStudents.length) * 100 : 0}%`,
                }}
              />
              <div
                className="bg-rose-400 h-full transition-all"
                style={{
                  width: `${assignedStudents.length ? (absentCount / assignedStudents.length) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                سواربووە: {boardedCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                چاوەڕوانە: {waitingCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                نەهاتوو/نەخۆش: {absentCount}
              </span>
            </div>
          </div>

          {/* Assigned Students List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                لیستی قوتابیانی ئەم پاسە ({assignedStudents.length} قوتابی)
              </span>
              <span className="text-[11px] text-slate-500">بەپێی ڕیزبەندی کورتکراوەی وێستگەکان</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
              {assignedStudents.map((s) => (
                <div key={s.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      #{s.pickupSequence}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.address}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{s.parentName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'boarded' || s.status === 'at_school'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'absent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {s.status === 'boarded'
                        ? 'سواربوو'
                        : s.status === 'at_school'
                        ? 'لە قوتابخانەیە'
                        : s.status === 'absent'
                        ? 'نەهاتوو/نەخۆش'
                        : 'چاوەڕوان'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GPS Coordinates info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>پۆتانی ڕاستەوخۆ: {bus.currentLat.toFixed(4)}, {bus.currentLng.toFixed(4)} (ڕانیە)</span>
            </div>
            {onFocusBusOnMap && (
              <button
                id="modal-view-on-map-btn"
                onClick={() => {
                  onFocusBusOnMap(bus.id);
                  onClose();
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>بینین لەسەر نەخشە</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            داخستنی زانیاری پاس
          </button>
        </div>
      </div>
    </div>
  );
};
