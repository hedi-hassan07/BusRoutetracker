import React, { useState } from 'react';
import { AlertCircle, Clock, Send, X } from 'lucide-react';
import { soundPlayer } from '../utils/audioAlert';

interface DelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelay: (minutes: number, reason: string) => void;
}

export const DelayModal: React.FC<DelayModalProps> = ({ isOpen, onClose, onConfirmDelay }) => {
  const [minutes, setMinutes] = useState<number>(10);
  const [reason, setReason] = useState<string>('قەرەباڵغی زۆری شەقام و ترافیك');

  if (!isOpen) return null;

  const quickReasons = [
    'قەرەباڵغی زۆری شەقام و ترافیك',
    'چاککردنەوەی شەقام یان گۆڕینی ڕێڕەو',
    'کەشوهەوای نالەبار یان باران و تەڕی شەقام',
    'پشکنینی خێرای سەلامەتی پاس',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundPlayer.playWarningTone();
    onConfirmDelay(minutes, reason);
    onClose();
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-right">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">پەخشی ئاگاداری دواکەوتنی پاس</h3>
              <p className="text-xs text-slate-500">ناردنی خۆکارانەی پەیام بۆ هەموو باوان</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">ماوەی خەمڵێنراوی دواکەوتن</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 25].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    minutes === m
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  +{m} خولەک
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">هۆکاری دواکەوتن</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 text-right"
              placeholder="هۆکاری دواکەوتن بنووسە..."
              required
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickReasons.map((qr) => (
                <button
                  type="button"
                  key={qr}
                  onClick={() => setReason(qr)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg transition cursor-pointer"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>ناردنی خێرای خۆکارانە:</strong> کاتی خەمڵێنراوی گەیشتنی پاس لەسەر مۆبایلی هەموو دایک و باوکان نوێ دەکرێتەوە و پەیامی ئاگادارییان پێدەگات.
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ناردنی ئاگاداری</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
