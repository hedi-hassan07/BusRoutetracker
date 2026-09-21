import React from 'react';
import {
  Bus as BusIcon,
  Bell,
  ShieldAlert,
  Volume2,
  VolumeX,
  Users,
  School as SchoolIcon,
  Sun,
  Moon,
  LogOut,
  LogIn,
  HelpCircle,
} from 'lucide-react';
import { AuthUser, TripShift } from '../types';
import { soundPlayer } from '../utils/audioAlert';

interface HeaderProps {
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
  onOpenLogin?: () => void;
  onOpenHowToUse?: () => void;
  activeRole: 'driver' | 'parent' | 'manager';
  onRoleChange: (role: 'driver' | 'parent' | 'manager') => void;
  shift: TripShift;
  onShiftChange: (shift: TripShift) => void;
  emergencyActive: boolean;
  emergencyMessage?: string;
  onClearEmergency?: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSignOut,
  onOpenLogin,
  onOpenHowToUse,
  activeRole,
  onRoleChange,
  shift,
  onShiftChange,
  emergencyActive,
  emergencyMessage,
  onClearEmergency,
  unreadCount,
  onOpenNotifications,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header id="app-header" dir="rtl" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 font-sans">
      {/* Emergency broadcast banner if active */}
      {emergencyActive && (
        <div id="emergency-banner" className="bg-rose-600 px-4 py-2.5 flex items-center justify-between text-white font-medium animate-pulse">
          <div className="flex items-center gap-2 max-w-4xl">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-white" />
            <span className="font-bold tracking-wide uppercase text-xs bg-rose-800 px-2 py-0.5 rounded">ئاگاداری لەناکاو</span>
            <span className="text-sm">{emergencyMessage || 'ئاگاداری فریاگوزاری چالاکە. چاودێری ڕاستەوخۆ لە کاردایە.'}</span>
          </div>
          {onClearEmergency && (
            <button
              id="clear-emergency-btn"
              onClick={onClearEmergency}
              className="text-xs bg-rose-700 hover:bg-rose-800 px-2.5 py-1 rounded transition border border-rose-400/40 cursor-pointer"
            >
              تێگەیشتم و سڕینەوە
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
            <BusIcon className="w-6 h-6" />
          </div>
          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base leading-tight tracking-tight text-white">ڕێگای پارێزراو</h1>
              <span className="text-[10px] font-semibold uppercase bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30">
                پاسی قوتابخانە
              </span>
            </div>
            <p className="text-xs text-slate-400">چاودێری ڕاستەوخۆ و ئاگاداری ١ خولەک پێش گەیشتن</p>
          </div>
        </div>

        {/* Persona Switcher Tabs: ONLY ADMIN CAN SWITCH BETWEEN ALL ROLES */}
        {currentUser?.role === 'manager' ? (
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-amber-400/40 shadow-inner">
            <span className="hidden xl:flex items-center gap-1 text-[11px] font-bold text-amber-300 px-2 py-0.5 bg-amber-400/10 rounded-lg border border-amber-400/20 ml-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>ئەدمین (هەموو بەشەکان)</span>
            </span>

            <button
              id="role-tab-manager"
              onClick={() => onRoleChange('manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeRole === 'manager'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <SchoolIcon className="w-3.5 h-3.5" />
              <span>کۆنتڕۆڵی قوتابخانە</span>
            </button>

            <button
              id="role-tab-driver"
              onClick={() => onRoleChange('driver')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeRole === 'driver'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <BusIcon className="w-3.5 h-3.5" />
              <span>داشبۆردی شۆفێر</span>
            </button>

            <button
              id="role-tab-parent"
              onClick={() => onRoleChange('parent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeRole === 'parent'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>دەروازەی باوان</span>
            </button>
          </div>
        ) : currentUser?.role === 'parent' ? (
          /* Parent view badge - parents cannot switch to driver or admin */
          <div className="flex items-center gap-2 bg-slate-800/90 py-1.5 px-3 rounded-xl border border-slate-700/80 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Users className="w-4 h-4 text-amber-400" />
              <span>دەروازەی دایک و باوک</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>تەنها منداڵانی خۆت (بەشەکانی تر بۆ ئەدمینە)</span>
            </div>
          </div>
        ) : (
          /* Driver view badge - drivers cannot switch to parent or admin */
          <div className="flex items-center gap-2 bg-slate-800/90 py-1.5 px-3 rounded-xl border border-slate-700/80 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <BusIcon className="w-4 h-4 text-amber-400" />
              <span>داشبۆردی شۆفێری پاس</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span>تەنها گەشتی پاسی دیاریکراو (بەشەکانی تر بۆ ئەدمینە)</span>
            </div>
          </div>
        )}

        {/* Right side controls: How-to-use, Shift toggle, Sound, Notifications, Auth */}
        <div className="flex items-center gap-2">
          {/* How to use button */}
          {onOpenHowToUse && (
            <button
              id="header-how-to-use-btn"
              onClick={onOpenHowToUse}
              title="ڕێنمایی بەکارهێنان"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">چۆن کاردەکات؟</span>
            </button>
          )}

          {/* Shift selector */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              id="shift-morning-btn"
              onClick={() => onShiftChange('morning_pickup')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                shift === 'morning_pickup' ? 'bg-slate-700 text-amber-300 font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>بەیانیان</span>
            </button>
            <button
              id="shift-afternoon-btn"
              onClick={() => onShiftChange('afternoon_dropoff')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                shift === 'afternoon_dropoff' ? 'bg-slate-700 text-blue-300 font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3 h-3 text-blue-400" />
              <span>دوانیوەڕوان</span>
            </button>
          </div>

          {/* Sound alert toggle */}
          <button
            id="toggle-sound-btn"
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) {
                soundPlayer.playSuccessTone();
              }
            }}
            title={soundEnabled ? 'دەنگی زەنگ چالاکە' : 'دەنگ بێدەنگکراوە'}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Notifications bell */}
          <button
            id="notifications-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="ئاگاداری و پەیامەکان"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '+٩' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile & Sign Out / In */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pr-1.5 border-r border-slate-700/80">
              <div
                id="header-user-badge"
                className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-right"
              >
                <div
                  className={`w-6 h-6 rounded-lg ${
                    currentUser.avatarBg || 'bg-amber-500'
                  } text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden max-w-[120px]">
                  <span className="text-xs font-bold text-white block truncate leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-amber-400 block truncate leading-none">
                    {currentUser.role === 'driver'
                      ? 'شۆفێر'
                      : currentUser.role === 'parent'
                      ? 'دایک و باوک'
                      : 'بەڕێوەبەر'}
                  </span>
                </div>
              </div>

              <button
                id="header-signout-btn"
                onClick={onSignOut}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="چوونەدەرەوە و گۆڕینی بەکارهێنەر"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px] font-medium">دەرچوون</span>
              </button>
            </div>
          ) : (
            onOpenLogin && (
              <button
                id="header-signin-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>چوونەژوورەوە</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
