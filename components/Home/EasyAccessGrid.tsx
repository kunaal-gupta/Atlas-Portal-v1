
import React from 'react';
import { 
  Palette, Users, Handshake, ShieldCheck, 
  Home, Building2, Megaphone, Calendar, 
  FileCheck, Calculator, LifeBuoy
} from 'lucide-react';

interface QuickLink {
  title: string;
  icon: React.ReactNode;
  color: string;
}

const LINKS: QuickLink[] = [
  { title: 'BRAND CORNER', icon: <Palette className="w-8 h-8" />, color: 'from-pink-600 to-rose-600' },
  { title: 'AGENT ONBOARDING', icon: <Users className="w-8 h-8" />, color: 'from-blue-600 to-indigo-600' },
  { title: 'TRADE PARTNERS', icon: <Handshake className="w-8 h-8" />, color: 'from-emerald-600 to-teal-600' },
  { title: 'COMMUNITIES', icon: <Building2 className="w-8 h-8" />, color: 'from-amber-500 to-orange-600' },
  { title: 'PROPERTY MGMT', icon: <ShieldCheck className="w-8 h-8" />, color: 'from-violet-600 to-purple-700' },
  { title: 'NEW HOMES', icon: <Home className="w-8 h-8" />, color: 'from-cyan-500 to-blue-600' },
  { title: 'MARKETING ASSETS', icon: <Megaphone className="w-8 h-8" />, color: 'from-fuchsia-600 to-pink-700' },
  { title: 'QUICK FORMS', icon: <FileCheck className="w-8 h-8" />, color: 'from-slate-600 to-slate-700' },
  { title: 'EVENT CALENDAR', icon: <Calendar className="w-8 h-8" />, color: 'from-rose-500 to-pink-600' },
  { title: 'MORTGAGE CALCS', icon: <Calculator className="w-8 h-8" />, color: 'from-green-600 to-emerald-700' },
  { title: 'TECH SUPPORT', icon: <LifeBuoy className="w-8 h-8" />, color: 'from-blue-500 to-indigo-500' },
];

const EasyAccessGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {LINKS.map((link, idx) => (
        <button 
          key={idx}
          className="group relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/5"
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${link.color}`}></div>
          <div className={`mb-4 flex justify-center text-slate-500 group-hover:text-pink-500 transition-colors`}>
            {link.icon}
          </div>
          <span className="text-[10px] font-black tracking-widest text-slate-400 group-hover:text-white transition-colors uppercase">
            {link.title}
          </span>
        </button>
      ))}
    </div>
  );
};

export default EasyAccessGrid;
