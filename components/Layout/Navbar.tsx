
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
  Trash2 
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
    label: 'Real Estate',
    items: [
      { name: 'SALES', icon: TrendingUp },
      { name: 'MARKETING', icon: Megaphone },
      { name: 'CONDOS', icon: Building2 },
      { name: 'RESALE', icon: Key },
      { name: 'NEW HOMES', icon: HomeIcon },
    ]
  },
  {
    label: 'Agency',
    items: [
      { name: 'NEW AGENTS', icon: Users },
      { name: 'QUICK FORMS / HOT STUFF', icon: FileCheck },
      { name: 'COMMUNITIES', icon: MapPin },
      { name: 'PROPERTY MANAGEMENT', icon: ShieldCheck },
      { name: 'TRADE PARTNERS', icon: Handshake },
    ]
  },
  {
    label: 'Systems',
    items: [
      { name: 'Inventory list', icon: ClipboardList },
      { name: 'Documents', icon: Files },
      { name: 'Notebook', icon: BookOpen },
      { name: 'Pages', icon: Layers },
      { name: 'Site contents', icon: Settings2 },
      { name: 'Recycle bin', icon: Trash2 },
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
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-20 z-40">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-[1600px]">
        <div className="flex items-center h-16 space-x-2">
          {NAV_STRUCTURE.map((category) => (
            <div 
              key={category.label} 
              className="relative h-full flex items-center"
              onMouseEnter={() => setOpenCategory(category.label)}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <button
                className={`px-6 h-10 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center space-x-2 border border-transparent
                  ${activeCategory === category.label 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                <span>{category.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${openCategory === category.label ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {openCategory === category.label && (
                <div className="absolute top-[100%] left-0 pt-1 min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 backdrop-blur-xl bg-opacity-95">
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
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all
                            ${isActive 
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex-grow"></div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Portal Sync Active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
