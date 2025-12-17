
import React, { useState } from 'react';
import { Calendar as CalendarIcon, RefreshCcw, Plus, MapPin, Clock, Search } from 'lucide-react';

const EVENTS = [
  { id: 1, title: 'Weekly Agent Briefing', date: 'Feb 10', time: '09:00 AM', location: 'Conference Room A', type: 'Upcoming' },
  { id: 2, title: 'Downtown Condo Launch Strategy', date: 'Feb 12', time: '02:00 PM', location: 'Virtual / Zoom', type: 'Upcoming' },
  { id: 3, title: 'New Agent Onboarding', date: 'Feb 15', time: '10:00 AM', location: 'Meeting Room 4', type: 'Upcoming' },
  { id: 4, title: 'Q4 Performance Review', date: 'Jan 15', time: '01:00 PM', location: 'Headquarters', type: 'Past' },
];

const CalendarView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'Upcoming' | 'Past'>('Upcoming');

  const filteredEvents = EVENTS.filter(e => e.type === activeSubTab);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Event Calendar</h2>
          <p className="text-slate-400 text-sm mt-1">Stay updated with company meetings and events.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all">
            <RefreshCcw className="w-4 h-4" />
            <span>Sync Calendar</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-xs font-bold text-white shadow-lg shadow-pink-600/20 transition-all">
            <Plus className="w-4 h-4" />
            <span>Create Meeting</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="flex border-b border-slate-800 p-4 justify-between items-center bg-slate-900/50">
          <div className="flex space-x-1 p-1 bg-slate-950 rounded-xl">
            {['Upcoming', 'Past'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveSubTab(t as any)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === t ? 'bg-slate-800 text-pink-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter events..." 
              className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row items-start sm:items-center p-6 group hover:bg-slate-800/30 transition-all cursor-pointer">
                <div className="flex-shrink-0 mb-4 sm:mb-0 mr-8 text-center min-w-[80px]">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-tighter mb-1">Month</div>
                  <div className="text-4xl font-black text-slate-300 group-hover:text-pink-500 transition-colors">
                    {event.date.split(' ')[1]}
                  </div>
                  <div className="text-xs font-bold text-slate-500">{event.date.split(' ')[0]}</div>
                </div>
                
                <div className="flex-grow">
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                    {event.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                      {event.location}
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-4 py-2 bg-slate-800 hover:bg-pink-600 rounded-lg text-[10px] font-bold text-white transition-all uppercase tracking-widest">
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <CalendarIcon className="w-8 h-8 text-slate-600" />
                </div>
              </div>
              <p className="text-slate-400 font-medium">No events found for this category.</p>
              <p className="text-slate-500 text-xs mt-2">Check back later or try changing your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
