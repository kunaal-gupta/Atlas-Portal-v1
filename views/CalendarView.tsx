
import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  RefreshCcw, 
  Plus, 
  MapPin, 
  Clock, 
  Search,
  ThumbsUp,
  Eye,
  Bookmark,
  CalendarPlus
} from 'lucide-react';

const EVENTS = [
  { 
    id: 1, 
    title: 'Meeting title', 
    date: '01', 
    month: 'MONTH', 
    time: 'Mon 12:00 PM', 
    location: 'Location', 
    type: 'Upcoming' 
  },
  { 
    id: 2, 
    title: 'Meeting title', 
    date: '01', 
    month: 'MONTH', 
    time: 'Mon 12:00 PM', 
    location: 'Location', 
    type: 'Upcoming' 
  },
];

const CalendarView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'Upcoming' | 'Past'>('Upcoming');

  const filteredEvents = EVENTS.filter(e => e.type === activeSubTab);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Hero Banner Section */}
      <section className="relative h-[300px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1500" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Calendar Banner"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 w-full md:w-2/3 bg-[#1a1a1a]/95 backdrop-blur-sm p-8">
          <h2 className="text-4xl font-bold text-white uppercase tracking-tight">EVENT CALENDAR</h2>
        </div>
      </section>

      {/* Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-2 px-4">
        <div className="flex space-x-8">
          {['Upcoming', 'Past'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveSubTab(t as any)}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeSubTab === t ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
              {activeSubTab === t && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-pink-600"></div>
              )}
            </button>
          ))}
        </div>
        
        <button className="flex items-center space-x-2 text-[13px] font-medium text-slate-300 hover:text-pink-500 transition-colors py-2">
          <RefreshCcw className="w-4 h-4 text-pink-600" />
          <span>Sync calendar</span>
        </button>
      </div>

      {/* Calendar List Content */}
      <div className="space-y-0.5">
        {activeSubTab === 'Upcoming' && (
          <div className="flex group cursor-pointer border-b border-white/5">
            <div className="w-48 h-44 bg-pink-600 flex items-center justify-center shrink-0">
              <CalendarPlus className="w-12 h-12 text-white" />
            </div>
            <div className="flex-grow flex flex-col justify-center p-8 bg-[#1a1a1a]/40 hover:bg-[#1a1a1a]/60 transition-colors">
              <h4 className="text-lg font-bold text-pink-500 mb-2">Create a meeting</h4>
              <p className="text-slate-300 text-sm">When you add a meeting, it will show here where everyone can see it.</p>
            </div>
          </div>
        )}

        {filteredEvents.map((event) => (
          <div key={event.id} className="flex flex-col border-b border-white/5">
            <div className="flex">
              {/* Date Box */}
              <div className="w-48 bg-[#1a1a1a]/60 flex flex-col items-center justify-center py-10 shrink-0 border-r border-white/5">
                <div className="text-[14px] font-black text-slate-300 tracking-tighter uppercase mb-0.5">{event.month}</div>
                <div className="text-5xl font-black text-slate-300 leading-none">
                  {event.date}
                </div>
              </div>
              
              {/* Event Info */}
              <div className="flex-grow p-8 bg-[#1a1a1a]/30 hover:bg-[#1a1a1a]/50 transition-colors">
                <h4 className="text-xl font-bold text-white mb-3">
                  {event.title}
                </h4>
                <div className="space-y-1 text-sm font-bold text-slate-400">
                  <div className="flex items-center uppercase tracking-tight">
                    {event.time}
                  </div>
                  <div className="flex items-center uppercase tracking-tight">
                    {event.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Footer Actions */}
            <div className="flex items-center space-x-8 px-8 py-4 bg-[#1a1a1a]/20">
               <button className="flex items-center space-x-2 text-[12px] font-bold text-slate-400 hover:text-pink-500 transition-colors group">
                 <ThumbsUp className="w-4 h-4 text-pink-600 group-hover:scale-110 transition-transform" />
                 <span className="uppercase tracking-tight">Like</span>
               </button>
               <div className="flex items-center space-x-2 text-[12px] font-bold text-slate-400">
                 <Eye className="w-4 h-4 text-pink-600" />
                 <span className="uppercase tracking-tight">68 Views</span>
               </div>
               <button className="flex items-center space-x-2 text-[12px] font-bold text-slate-400 hover:text-pink-500 transition-colors group">
                 <Bookmark className="w-4 h-4 text-pink-600 group-hover:scale-110 transition-transform" />
                 <span className="uppercase tracking-tight">Save for later</span>
               </button>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && activeSubTab === 'Past' && (
          <div className="py-24 text-center bg-[#1a1a1a]/20 rounded-3xl">
            <CalendarIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">No past events found</p>
          </div>
        )}
      </div>

      {/* View All Search placeholder if needed */}
      <div className="flex justify-end p-4">
         <div className="relative w-full max-w-xs">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search events..." 
             className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-pink-500 transition-colors"
           />
         </div>
      </div>
    </div>
  );
};

export default CalendarView;
