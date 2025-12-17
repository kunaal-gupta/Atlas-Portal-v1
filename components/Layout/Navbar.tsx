
import React, { useState } from 'react';
import { 
  ChevronDown, 
  Home, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Megaphone, 
  Building2, 
  Key, 
  HomeIcon, 
  Users, 
  FileCheck, 
  MapPin, 
  ShieldCheck, 
  Handshake, 
  ClipboardList, 
  Files, 
  BookOpen, 
  Layers, 
  Settings2, 
  Trash2,
  Sparkles,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  name: string;
  icon: React.ElementType;
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

const NAV_STRUCTURE: NavCategory[] = [
  {
    label: 'Dashboard',
    items: [
      { name: 'HOME', icon: Home },
      { name: 'EVENT CALENDAR', icon: Calendar },
      { name: 'Conversations', icon: MessageSquare },
    ]
  },
  {
    label: 'Market Center',
    items: [
      { name: 'SALES', icon: TrendingUp },
      { name: 'MARKETING', icon: Megaphone },
      { name: 'AGENT AWARDS', icon: Sparkles },
    ]
  },
  {
    label: 'Real Estate',
    items: [
      { name: 'CONDOS', icon: Building2 },
      { name: 'RESALE', icon: Key },
      { name: 'NEW HOMES', icon: HomeIcon },
    ]
  },
  {
    label: 'Agency Hub',
    items: [
      { name: 'NEW AGENTS', icon: Users },
      { name: 'TRADE PARTNERS', icon: Handshake },
      { name: 'DIRECTORIES', icon: Users },
    ]
  },
  {
    label: 'Community',
    items: [
      { name: 'COMMUNITIES', icon: MapPin },
      { name: 'CULTURE', icon: MessageSquare },
    ]
  },
  {
    label: 'Management',
    items: [
      { name: 'PROPERTY MANAGEMENT', icon: ShieldCheck },
      { name: 'QUICK FORMS / HOT STUFF', icon: FileCheck },
      { name: 'COMPLIANCE', icon: Briefcase },
    ]
  },
  {
    label: 'Systems',
    items: [
      { name: 'Inventory list', icon: ClipboardList },
      { name: 'Documents', icon: Files },
      { name: 'Notebook', icon: BookOpen },
      { name: 'Site contents', icon: Settings2 },
    ]
  }
];

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const getActiveCategory = () => {
    return NAV_STRUCTURE.find(cat => 
      cat.items.some(item => item.name === activeTab)
    )?.label;
  };

  const activeCategory = getActiveCategory();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-20 z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-8 lg:px-12 max-w-[1600px]">
        <div className="flex items-center h-20 space-x-1">
          {NAV_STRUCTURE.map((category) => {
            const isCategoryActive = activeCategory === category.label;
            
            return (
              <div 
                key={category.label} 
                className="relative h-full flex items-center group"
                onMouseEnter={() => setOpenCategory(category.label)}
                onMouseLeave={() => setOpenCategory(null)}
              >
                <button
                  className={`px-5 py-2.5 rounded-2xl text-[10.5px] font-[900] uppercase tracking-[0.2em] transition-all duration-300 flex items-center space-x-2 border
                    ${isCategoryActive 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border-transparent'}`}
                >
                  <span>{category.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${openCategory === category.label ? 'rotate-180 opacity-100' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {openCategory === category.label && (
                  <div className="absolute top-[100%] left-0 pt-2 min-w-[280px] animate-in fade-in slide-in-from-top-3 duration-300">
                    <div className="bg-white border border-slate-200 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-3 overflow-hidden">
                      <div className="px-4 py-3 mb-2 border-b border-slate-50">
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{category.label} Resources</span>
                      </div>
                      <div className="space-y-1">
                        {category.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.name;
                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                onTabChange(item.name);
                                setOpenCategory(null);
                              }}
                              className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all
                                ${isActive 
                                  ? 'bg-rose-50 text-rose-600 shadow-sm border border-rose-100' 
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                <Icon className="w-4 h-4 shrink-0" />
                              </div>
                              <span className="truncate">{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex-grow"></div>
          
          <div className="hidden xl:flex items-center">
            <div className="h-8 w-[1px] bg-slate-200 mx-6"></div>
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-widest">Portal Version</span>
              <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-900">v2.5</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
