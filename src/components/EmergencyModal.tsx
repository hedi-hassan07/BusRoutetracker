import React, { useState } from 'react';
import { AlertOctagon, Send, ShieldAlert, X } from 'lucide-react';
import { soundPlayer } from '../utils/audioAlert';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEmergency: (message: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, onConfirmEmergency }) => {
  const [emergencyText, setEmergencyText] = useState<string>(
    'ئاگاداری کەشوهەوا و ڕەشەبا: ڕێنمایی دراوە بە هەموو پاسەکان خێرایی کەمبکەنەوە و ڕێوشوێنی سەلامەتی بگرنەبەر.'
  );

  if (!isOpen) return null;

  const quickAlerts = [
    'ئاگاداری کەشوهەوای نالەبار: پاسەکان بە هێواشی و وریایی دەڕۆن.',
    'ڕووداوی هاتوچۆ لە شەقام: پاسەکە بە ڕێگایەکی سەلامەتتردا دەڕوات و قوتابیان پارێزراون.',
    'ڕاهێنانی سەلامەتی قوتابخانە: هاتوچۆ بەپێی کاتی دیاریکراو بەردەوام دەبێت.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundPlayer.playWarningTone();
    onConfirmEmergency(emergencyText);
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border-2 border-rose-500 text-right">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-rose-950 text-sm uppercase tracking-wide">پەخشی فریاگوزاری و لەناکاو</h3>
              <p className="text-xs text-rose-600">ئاگاداری خێرا بۆ هەموو باوان و شۆفێران</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">دەقی پەیامی ئاگاداری</label>
            <textarea
              rows={3}
              value={emergencyText}
              onChange={(e) => setEmergencyText(e.target.value)}
              className="w-full text-xs p-2.5 bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 text-right"
              required
            />
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">نموونەی پەیامی خێرا:</span>
              {quickAlerts.map((qa) => (
                <button
                  type="button"
                  key={qa}
                  onClick={() => setEmergencyText(qa)}
                  className="text-right text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition cursor-pointer"
                >
                  {qa}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>ڕێکاری سەلامەتی گشتی:</strong> ئەم پەیامە لە سەرەوەی شاشەی هەموو باوان، شۆفێران و بەڕێوەبەرایەتی دەمێنێتەوە تا پاکدەکرێتەوە.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>پەخشکردنی دەستبەجێ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
