import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCheck, Clock, ShieldAlert, UserCheck, Volume2, X } from 'lucide-react';
import { soundPlayer } from '../utils/audioAlert';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div dir="rtl" className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-right">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">تۆماری ئاگادارییە خۆکارەکان</h3>
                <p className="text-xs text-slate-400">ئاگاداری ڕاستەوخۆی باوان و بەڕێوەبەرایەتی</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>هەمووی بخوێنەوە</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                تا ئێستا هیچ ئاگادارییەک تۆمار نەکراوە. کاتێک پاسەکە دەست بە ڕۆیشتن دەکات ئاگادارییەکان دێن.
              </div>
            ) : (
              notifications.map((notif) => {
                const isProximity = notif.type === 'proximity_1min';
                const isEmergency = notif.type === 'emergency';
                const isDelay = notif.type === 'delay';
                const isBoarded = notif.type === 'boarded' || notif.type === 'school_arrival';

                let icon = <Bell className="w-4 h-4 text-amber-600" />;
                let borderStyle = 'border-slate-200';
                let bgStyle = 'bg-white';

                if (isEmergency) {
                  icon = <ShieldAlert className="w-4 h-4 text-rose-600" />;
                  borderStyle = 'border-rose-300';
                  bgStyle = 'bg-rose-50/70';
                } else if (isProximity) {
                  icon = <Bell className="w-4 h-4 text-amber-600 animate-bounce" />;
                  borderStyle = 'border-amber-300';
                  bgStyle = 'bg-amber-50/80';
                } else if (isDelay) {
                  icon = <Clock className="w-4 h-4 text-amber-600" />;
                  borderStyle = 'border-amber-200';
                  bgStyle = 'bg-amber-50/40';
                } else if (isBoarded) {
                  icon = <UserCheck className="w-4 h-4 text-emerald-600" />;
                  borderStyle = 'border-emerald-200';
                  bgStyle = 'bg-emerald-50/50';
                }

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border ${borderStyle} ${bgStyle} shadow-sm transition hover:shadow relative`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-white shadow-sm flex-shrink-0 mt-0.5">
                          {icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-slate-900">{notif.title}</h4>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block font-mono">
                            {notif.timestamp}
                          </span>
                        </div>
                      </div>

                      {isProximity && (
                        <button
                          onClick={() => soundPlayer.playProximityChime()}
                          className="p-1 text-slate-400 hover:text-amber-600 transition cursor-pointer"
                          title="دووبارە لێدانی دەنگی زەنگ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
