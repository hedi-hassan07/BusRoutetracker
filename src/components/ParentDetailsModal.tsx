import React from 'react';
import { Bus, Student, School } from '../types';
import {
  X,
  User,
  Phone,
  Mail,
  Home,
  MapPin,
  Bus as BusIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ParentDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  assignedBus?: Bus;
  school: School;
  onToggleAbsentStatus?: (studentId: string) => void;
  onFocusOnMap?: (studentId: string) => void;
}

export const ParentDetailsModal: React.FC<ParentDetailsModalProps> = ({
  student,
  isOpen,
  onClose,
  assignedBus,
  school,
  onToggleAbsentStatus,
  onFocusOnMap,
}) => {
  if (!isOpen || !student) return null;

  const isAbsent = student.status === 'absent';
  const isBoarded = student.status === 'boarded' || student.status === 'at_school';
  const is1MinAlert = student.proximityAlertTriggered || student.status === 'proximity_alert_sent';

  return (
    <div
      id="parent-details-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="parent-details-modal"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden font-sans text-right animate-in fade-in zoom-in-95 duration-200 my-auto"
      >
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{student.parentName}</h3>
                <span className="text-xs font-bold bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-lg border border-slate-700">
                  سەرپەرشتیاری یاسایی
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                باوانی قوتابی: <span className="text-white font-bold">{student.name}</span> ({student.grade})
              </p>
            </div>
          </div>

          <button
            id="close-parent-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Status Alert Banner */}
          {isAbsent ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-xs">قوتابی نەهاتووە / نەخۆشە</h5>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    ئەم قوتابییە ئەمڕۆ بەهۆی نەخۆشییەوە لە ڕێگای پاس سڕاوەتەوە و کاتی گەشت کورتکراوەتەوە.
                  </p>
                </div>
              </div>
              {onToggleAbsentStatus && (
                <button
                  id="revert-absent-status-btn"
                  onClick={() => onToggleAbsentStatus(student.id)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0"
                >
                  گەڕاندنەوە بۆ ڕێگا
                </button>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-xs">لە لیستی ڕێگای پاسی چالاکدایە</h5>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    وێستگەی #{student.pickupSequence} لە ڕێگای کورتکراوە • دۆخ:{' '}
                    {isBoarded
                      ? 'سواربووە و لە پاسدایە'
                      : is1MinAlert
                      ? 'ئاگاداری ١ خولەک گەیشتووە'
                      : `چاوەڕوانە (نزیکەی ${student.etaMinutes} خولەک)`}
                  </p>
                </div>
              </div>
              {onToggleAbsentStatus && (
                <button
                  id="mark-student-absent-btn"
                  onClick={() => onToggleAbsentStatus(student.id)}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0"
                >
                  دیاریکردن وەک نەخۆش/نەهاتوو
                </button>
              )}
            </div>
          )}

          {/* Parent Contact Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h5 className="font-bold text-xs text-slate-800">زانیاری پەیوەندی بە دایک و باوک</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">ژمارەی مۆبایل</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{student.parentPhone}</span>
                </div>
                <a
                  href={`tel:${student.parentPhone}`}
                  className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                  title="پەیوەندیکردن"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">ئیمەیڵی پەیوەندی</span>
                  <span className="font-semibold text-slate-800 text-xs truncate max-w-[160px] block">
                    {student.parentEmail}
                  </span>
                </div>
                <a
                  href={`mailto:${student.parentEmail}`}
                  className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                  title="ناردنی ئیمەیڵ"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Child Information Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl ${student.avatarBg} text-white font-black text-base flex items-center justify-center shadow-md`}
              >
                {student.name.charAt(0)}
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">قوتابی تۆمارکراو</span>
                <h4 className="font-black text-slate-900 text-base">{student.name}</h4>
                <span className="text-xs text-slate-600">{student.grade} • {school.name}</span>
              </div>
            </div>

            {student.notes && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                📝 <strong>تێبینی باوان:</strong> {student.notes}
              </div>
            )}
          </div>

          {/* Residence & Location Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-indigo-600" />
              <span>ناونیشانی شوێنی نیشتەجێبوون و وێستگە</span>
            </h5>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-600">ناونیشانی کارای ئەمڕۆ:</span>
                  {student.isTemporaryAddress && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ناونیشانی کاتی
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-900">{student.address}</div>
                {student.isTemporaryAddress && student.addressChangeReason && (
                  <div className="mt-1 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                    هۆکار: {student.addressChangeReason}
                  </div>
                )}
              </div>

              {student.isTemporaryAddress && (
                <div className="p-2 text-[11px] text-slate-500">
                  🏠 ناونیشانی هەمیشەیی تۆمارکراو: {student.permanentAddress}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Bus Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                <BusIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium">پاسی دیاریکراو بۆ ئەم ماڵە</span>
                <div className="font-bold text-slate-900 text-sm">
                  {assignedBus?.busNumber || 'پاسی ١٠٤'} ({assignedBus?.plate || '24-B-4491'})
                </div>
                <span className="text-slate-600 text-[11px]">
                  شۆفێر: {assignedBus?.driverName || 'کاک کاوە ئەحمەد'} • {assignedBus?.driverPhone || '0750 445 8821'}
                </span>
              </div>
            </div>

            {assignedBus && (
              <a
                href={`tel:${assignedBus.driverPhone}`}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-center"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>پەیوەندی بە شۆفێر</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          {onFocusOnMap && (
            <button
              onClick={() => {
                onFocusOnMap(student.id);
                onClose();
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>نیشاندانی ماڵ لەسەر نەخشە</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer mr-auto"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
};
