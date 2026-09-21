import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Users,
  School,
  Sparkles,
  MapPin,
  Clock,
  Fuel,
  CheckCircle2,
  Bell,
  Play,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoleDemo?: (role: 'driver' | 'parent' | 'manager') => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onSelectRoleDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'driver' | 'parent' | 'manager' | 'quickstart'>('quickstart');

  if (!isOpen) return null;

  return (
    <div
      id="how-to-use-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">ڕێنمایی بەکارهێنانی سیستەم</h3>
              <p className="text-xs text-slate-400">چۆنیەتی کارکردنی بەرنامەکە بە شێوازێکی زۆر ئاسان و ڕوون</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Navigation Tabs */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 grid grid-cols-4 gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`py-2 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'quickstart'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>دەستپێکی خێرا</span>
          </button>

          <button
            onClick={() => setActiveTab('driver')}
            className={`py-2 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'driver'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>شۆفێری پاس</span>
          </button>

          <button
            onClick={() => setActiveTab('parent')}
            className={`py-2 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'parent'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>دایک و باوک</span>
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            className={`py-2 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'manager'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>کۆنتڕۆڵی قوتابخانە</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm leading-relaxed">
          {/* TAB 1: QUICKSTART */}
          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-l from-amber-500/20 via-amber-500/10 to-transparent p-4 rounded-2xl border border-amber-500/30">
                <h4 className="font-bold text-amber-300 text-base mb-1">ئەم بەرنامەیە چی دەکات؟</h4>
                <p className="text-xs text-slate-300">
                  ئەم سیستەمە سێ لایەن بەیەکەوە دەبەستێتەوە: <strong>شۆفێری پاس</strong>، <strong>دایک و باوکان</strong>، و <strong>بەڕێوەبەری قوتابخانە</strong>. 
                  ڕێگای پاسەکان ڕێکدەخات بۆ کەمکردنەوەی خەرجی بەنزین و کات، و کاتێک پاسەکە نزیک دەبێتەوە لە ماڵی هەر قوتابییەک بە ١ خولەک پێشوەخت زەنگ و پەیام دەنێرێت.
                </p>
              </div>

              <div className="space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400 block">
                  چۆن لە ٣ هەنگاودا تاقیی بکەیتەوە؟
                </span>

                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                    ١
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">بە یەک کرتە بچۆ ژوورەوە</h5>
                    <p className="text-xs text-slate-400">
                      لە پەڕەی چوونەژوورەوە، کرتە لە یەکێک لە هەژمارە ئامادەکراوەکان بکە (بۆ نموونە: شۆفێر بۆب یان سارە چێن).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                    ٢
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">لە داشبۆردی شۆفێر کرتە لە "دەستپێکردنی ڕێگا" بکە</h5>
                    <p className="text-xs text-slate-400">
                      دوگمەی سەوزی <strong>"دەستپێکردنی ڕێگا"</strong> دابگرە تا پاسەکە لەسەر نەخشە دەست بە ڕۆیشتن بکات و بەردەوام خێرایی و شوێنی ڕاستەقینە نوێبێتەوە.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-blue-400 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                    ٣
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs mb-0.5">ببینە چۆن زەنگی ١ خولەک لێدەدات</h5>
                    <p className="text-xs text-slate-400">
                      کاتێک پاسەکە دەگاتە نزیک ماڵی قوتابی (٤٥٠ مەتر)، زەنگێکی هۆشیارکەرەوە لێدەدات و بازنەیەکی زێڕین لە دەوری ماڵەکە دەدرەوشێتەوە.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DRIVER */}
          {activeTab === 'driver' && (
            <div className="space-y-3.5">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Smartphone className="w-4 h-4" />
                  <span>بۆ شۆفێر لەسەر مۆبایلەکەی</span>
                </div>
                <p className="text-xs text-slate-300">
                  شۆفێر مۆبایلەکەی بەکاردەهێنێت لەناو پاسەکەدا و ئەم دوگمە سەرەکییانەی هەیە:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>دوگمەی سەوز: چالاککردن</span>
                  </div>
                  <p className="text-slate-400">
                    کاتێک شۆفێر دەست بە دەوام دەکات ئەمە دادەگرێت بۆ ئەوەی جی پی ئێسی مۆبایلەکەی پەخش بکرێت.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span>دوگمەی سوور: ناچالاککردن</span>
                  </div>
                  <p className="text-slate-400">
                    کاتێک هەموو قوتابیانی گەیاند و دەوامی تەواو بوو ئەمە دادەگرێت تا شوێنەکەی بوەستێت.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span>سواری پاس بوو</span>
                  </div>
                  <p className="text-slate-400">
                    لەگەڵ گەیشتن بە بەردەم ماڵی قوتابی، شۆفێر ئەمە دادەگرێت تا دایک و باوک دڵنیابن کە منداڵەکەیان لەناو پاسەکەیە.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>ڕاگەیاندنی دواکەوتن</span>
                  </div>
                  <p className="text-slate-400">
                    ئەگەر قەرەباڵغی یان ڕووداو هەبوو، شۆفێر بە یەک کرتە ٥ یان ١٠ خولەک دواکەوتن بۆ هەموان دەنێرێت.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARENT */}
          {activeTab === 'parent' && (
            <div className="space-y-3.5">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <Users className="w-4 h-4" />
                  <span>دەروازەی دایک و باوکان</span>
                </div>
                <p className="text-xs text-slate-300">
                  دایک و باوک بە مۆبایل دەتوانن ئاگاداری سەلامەتی منداڵەکانیان بن:
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold flex-shrink-0">
                    ⚡
                  </div>
                  <div>
                    <span className="font-bold text-white block">ئاگاداری ١ خولەک پێش گەیشتن</span>
                    <span className="text-slate-400">
                      پێویست ناکات منداڵەکەت لە سەرما یان گەرمادا لەسەر شەقام بوەستێت؛ ١ خولەک پێش گەیشتن مۆبایلەکەت زەنگ لێدەدات.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">بینینی ڕاستەوخۆی پاس لەسەر نەخشە</span>
                    <span className="text-slate-400">
                      بە چاوی خۆت دەبینیت پاسەکە لە کوێیە، چەند کیلۆمەتر دوورە، و لە چەند خولەکدا دەگات.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-400/20 text-indigo-300 flex items-center justify-center font-bold flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">هێڵی کاتی سەلامەتی قوتابی</span>
                    <span className="text-slate-400">
                      چوار قۆناغ پیشاندەدات: بەڕێکەوتنی پاس ➔ ئاگاداری ١ خولەک ➔ سەرکەوتن بۆ ناو پاس ➔ گەیشتن بە قوتابخانە.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHOOL MANAGER */}
          {activeTab === 'manager' && (
            <div className="space-y-3.5">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                  <School className="w-4 h-4" />
                  <span>ژووری کۆنتڕۆڵی بەڕێوەبەری قوتابخانە</span>
                </div>
                <p className="text-xs text-slate-300">
                  بەرپرسی هاتوچۆ و بەڕێوەبەری قوتابخانە چاودێری هەموو کەشتی پاسەکان دەکەن:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">تابلۆی گەیشتنی پاسەکان</span>
                  <p className="text-slate-400">
                    وەک تابلۆی فڕۆکەخانە، کاتی گەیشتنی هەر پاسێک بە خولەک و سەدی چەند بەڕێوەیە دەبینرێت.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">پاشەکەوتی ٢٦٪ لە بەنزین</span>
                  <p className="text-slate-400">
                    سیستەمەکە کورتترین ڕێگای گەڕان بەسەر ماڵەکاندا دادەنێت بۆ ئەوەی خەرجی سوتەمەنی و پیسبوونی هەوا کەمبکاتەوە.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="font-bold text-rose-400 block mb-1">پەخشی فریاگوزاری و لەناکاو</span>
                  <p className="text-slate-400">
                    لە کاتی بارودۆخی کەشوهەوا، بەستەڵەک، یان هۆکاری لەناکاو، بەڕێوەبەر دەتوانێت یەکسەر ئاگاداری بۆ هەموو دایک و باوکان و شۆفێران بنێرێت.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            دەتوانیت لە سەرەوە دەوری بەکارهێنەر (شۆفێر / دایک و باوک / بەڕێوەبەر) بگۆڕیت.
          </div>
          <button
            id="close-how-to-use-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            تێگەیشتم، دەستپێکردن
          </button>
        </div>
      </div>
    </div>
  );
};
