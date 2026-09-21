import React, { useState } from 'react';
import { Student } from '../types';
import {
  AlertCircle,
  CheckCircle2,
  Home,
  MapPin,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  existingChild?: Student;
  onAddChild: (newChild: {
    name: string;
    grade: string;
    avatarBg: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
  }) => void;
}

const GRADE_SUGGESTIONS = [
  'پۆلی یەکەم (ژووری ١٠١)',
  'پۆلی دووەم (ژووری ١٠٢)',
  'پۆلی سێیەم (ژووری ٢٠١)',
  'پۆلی چوارەم (ژووری ٢٠٤)',
  'پۆلی پێنجەم (ژووری ٣٠١)',
  'باخچەی ساوایان (KG1)',
];

const AVATAR_COLORS = [
  { name: 'شین', class: 'bg-blue-500' },
  { name: 'سەوز', class: 'bg-emerald-500' },
  { name: 'مۆر', class: 'bg-purple-500' },
  { name: 'پەمەیی', class: 'bg-rose-500' },
  { name: 'پرتەقاڵی', class: 'bg-amber-500' },
  { name: 'نیلی', class: 'bg-indigo-600' },
];

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  parentName,
  parentPhone,
  parentEmail,
  existingChild,
  onAddChild,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('پۆلی یەکەم (ژووری ١٠١)');
  const [avatarBg, setAvatarBg] = useState('bg-blue-500');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [customAddress, setCustomAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('تکایە ناوی سیانی منداڵەکەت بنووسە');
      return;
    }

    const finalAddress = useSameAddress && existingChild
      ? existingChild.permanentAddress
      : customAddress.trim() || (existingChild ? existingChild.permanentAddress : 'ڕانیە، گەڕەکی دڵۆپە، کۆڵانی ١٤');

    const lat = existingChild ? existingChild.lat : 36.2642;
    const lng = existingChild ? existingChild.lng : 44.8778;

    onAddChild({
      name: name.trim(),
      grade: grade.trim(),
      avatarBg,
      address: finalAddress,
      lat,
      lng,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      id="add-child-modal"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm font-sans text-right animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                زیادکردنی منداڵێکی تر بۆ ئەژمێری باوان
              </h3>
              <p className="text-xs text-slate-400">
                سەرپەرشتیار: <span className="text-amber-300 font-bold">{parentName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              تەنها منداڵانی بەستراو بە ئەم ئەژمێرە دەبینیت. دوای زیادکردن دەتوانیت بە ئاسانی لەنێوان
              منداڵەکانتدا هەڵبژاردن بکەیت و چاودێری پاسەکەیان بکەیت.
            </p>
          </div>

          {/* Child Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ناوی سیانی منداڵ:
            </label>
            <input
              type="text"
              id="new-child-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="بۆ نموونە: ڕەوەند کاروان عەلی"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition text-right"
            />
          </div>

          {/* Grade / Classroom */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              پۆل و ژووری خوێندن:
            </label>
            <input
              type="text"
              id="new-child-grade-input"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="پۆلی یەکەم (ژووری ١٠١)"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition text-right mb-2"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {GRADE_SUGGESTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    grade === g
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ڕەنگی نیشانە / ئایکۆنی منداڵ:
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col.class}
                  type="button"
                  onClick={() => setAvatarBg(col.class)}
                  className={`w-7 h-7 rounded-full ${col.class} flex items-center justify-center transition cursor-pointer ${
                    avatarBg === col.class ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={col.name}
                >
                  {avatarBg === col.class && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Address Option */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              ناونیشانی شوێنی سواربوون:
            </label>

            <div className="space-y-2">
              {existingChild && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="addressOption"
                    checked={useSameAddress}
                    onChange={() => setUseSameAddress(true)}
                    className="mt-0.5 text-amber-500 focus:ring-amber-400"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-indigo-500" />
                      <span>هەمان ناونیشانی ماڵەوە (لەگەڵ {existingChild.name.split(' ')[0]} سوار دەبێت)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {existingChild.permanentAddress}
                    </p>
                  </div>
                </label>
              )}

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="addressOption"
                  checked={!useSameAddress || !existingChild}
                  onChange={() => setUseSameAddress(false)}
                  className="mt-0.5 text-amber-500 focus:ring-amber-400"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>ناونیشانێکی تری سواربوون دیاری بکە</span>
                  </span>
                  {(!useSameAddress || !existingChild) && (
                    <input
                      type="text"
                      id="custom-child-address"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="گەڕەک، شەقام، کۆڵان، نزیکترین نیشانە"
                      className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-400 transition"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Notes for Driver */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              تێبینی بۆ شۆفێری پاس (ئارەزوومەندانە):
            </label>
            <textarea
              id="new-child-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="بۆ نموونە: لەگەڵ براکەی دادەبەزێت، یان پێویستی بە سەرنجی شۆفێرە لە کاتی دابەزین..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition text-right leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              id="confirm-add-child-btn"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>تۆمارکردن و زیادکردن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
