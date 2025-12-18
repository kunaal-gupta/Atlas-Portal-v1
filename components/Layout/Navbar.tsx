
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
  Settings2, 
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
    <nav className="bg-white border-b border-slate-200 sticky top-20 z-40">
      <div className="container mx-auto px-8 lg:px-12 max-w-[1600px]">
        <div className="flex items-center h-16 space-x-1">
          {NAV_STRUCTURE.map((category) => {
            const isCategoryActive = activeCategory === category.label;
            
            return (
              <div 
                key={category.label} 
                className="relative h-full flex items-center"
                onMouseEnter={() => setOpenCategory(category.label)}
                onMouseLeave={() => setOpenCategory(null)}
              >
                <button
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center space-x-2
                    ${isCategoryActive 
                      ? 'bg-slate-100 text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <span>{category.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${openCategory === category.label ? 'rotate-180 opacity-100' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {openCategory === category.label && (
                  <div className="absolute top-[100%] left-0 pt-1 min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-2 overflow-hidden ring-1 ring-black/5">
                      <div className="px-3 py-1.5 mb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{category.label} Resources</span>
                      </div>
                      <div className="space-y-0.5">
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
                              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all
                                ${isActive 
                                  ? 'bg-rose-600 text-white' 
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
            <div className="h-6 w-[1px] bg-slate-200 mx-6"></div>
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">Portal Version</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">v2.5</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
