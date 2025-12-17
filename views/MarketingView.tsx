
import React from 'react';
import { 
  FileText, 
  Folder, 
  RefreshCw, 
  Grid3X3, 
  FileDown, 
  ChevronRight, 
  Info,
  Download,
  Share2
} from 'lucide-react';

interface MarketingDoc {
  id: string;
  name: string;
  modified: string;
  modifiedBy: string;
  type: 'folder' | 'pdf' | 'ai';
}

const LOGOS_FONTS: MarketingDoc[] = [
  { id: 'lf1', name: 'Branded Stationery', modified: 'January 9', modifiedBy: 'TECHNOLOGY | MOZAIC', type: 'folder' },
  { id: 'lf2', name: 'CHBA - Logos', modified: 'May 10, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'lf3', name: 'Fan Yang Logos', modified: 'May 12, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'lf4', name: 'MOZAIC NEW LOGOS & FONTS 2025', modified: 'January 8', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
];

const FLYERS: MarketingDoc[] = [
  { id: 'fl1', name: 'MOZAIC SERVICES-UPDATED.pdf', modified: 'May 9, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pdf' },
  { id: 'fl2', name: 'Mozaic-Postcard-Agents.pdf', modified: 'May 9, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pdf' },
];

const REPORTS: MarketingDoc[] = [
  { id: 'mr1', name: 'Edmonton Market Report-April - 2021.pdf', modified: 'May 12, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pdf' },
];

const AWARDS: MarketingDoc[] = [
  { id: 'aw1', name: 'AGENT AWARDS 2025', modified: 'January 8', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'aw2', name: 'CHBA Award 2020', modified: 'May 10, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'aw3', name: 'OLD-AGENT AWARDS', modified: 'January 8', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
];

const BUSINESS_CARDS: MarketingDoc[] = [
  { id: 'bc1', name: 'New Business Cards - 2025', modified: 'January 8', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'bc2', name: 'OLD-Business Cards - Template', modified: 'January 8', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'bc3', name: 'OLD-Business Cards -Designed', modified: 'January 8', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
];

const SIGNS: MarketingDoc[] = [
  { id: 'sg1', name: 'NEW HOMES SIGNS', modified: 'May 12, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'sg2', name: 'RESALE SIGNS', modified: 'May 12, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'sg3', name: 'Original Sale Sign - Mozaic 32x24.ai', modified: 'October 12, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'ai' },
  { id: 'sg4', name: 'Original Sale Sign - Mozaic 32x24.pdf', modified: 'October 12, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pdf' },
];

const DocumentLibrary: React.FC<{ title: string; items: MarketingDoc[] }> = ({ title, items }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-white tracking-tight uppercase">{title}</h3>
        <button className="text-[11px] font-black text-pink-500 hover:text-pink-400 transition-colors uppercase tracking-[0.2em] flex items-center">
          See all <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="bg-[#1a1a1a]/60 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-md">
        {/* SharePoint-style Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-slate-900/40 border-b border-white/5 gap-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 transition-all uppercase tracking-widest border border-white/5">
              <Grid3X3 className="w-3.5 h-3.5 text-pink-500" />
              <span>Edit in grid view</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 transition-all uppercase tracking-widest border border-white/5">
              <FileDown className="w-3.5 h-3.5 text-pink-500" />
              <span>Export to Excel</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 hover:bg-slate-800 transition-all uppercase tracking-widest border border-white/5">
              <RefreshCw className="w-3.5 h-3.5 text-pink-500" />
              <span>Sync</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-1 px-3 py-1.5 text-[10px] font-bold text-slate-300">
               <span>All Documents</span>
               <ChevronRight className="w-3 h-3 rotate-90" />
             </div>
             <Info className="w-4 h-4 text-pink-600/60 hover:text-pink-600 cursor-pointer" />
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
            <div className="col-span-1">Icon</div>
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Modified</div>
            <div className="col-span-3">Modified By</div>
          </div>

          <div className="divide-y divide-white/5">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-8 py-4 items-center group hover:bg-white/5 transition-all cursor-pointer">
                <div className="col-span-1 flex justify-center">
                  {item.type === 'folder' ? (
                    <Folder className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  ) : (
                    <FileText className={`w-5 h-5 group-hover:scale-110 transition-transform ${item.type === 'ai' ? 'text-orange-500' : 'text-pink-500'}`} />
                  )}
                </div>
                <div className="col-span-6">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-pink-500 transition-colors uppercase tracking-tight">
                    {item.name}
                  </span>
                </div>
                <div className="col-span-2 text-xs font-medium text-slate-500">{item.modified}</div>
                <div className="col-span-3">
                  <span className="px-3 py-1 bg-slate-950/40 rounded-lg text-[10px] font-bold text-slate-400 border border-white/5">
                    {item.modifiedBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const MarketingView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Banner Section */}
      <section className="relative h-[300px] overflow-hidden rounded-[40px] border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=1500" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Marketing Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter">MARKETING</h2>
        </div>
      </section>

      {/* Lists */}
      <DocumentLibrary title="LOGOS AND FONTS" items={LOGOS_FONTS} />
      <DocumentLibrary title="FLYERS" items={FLYERS} />
      <DocumentLibrary title="BRANDED MARKET REPORTS" items={REPORTS} />
      <DocumentLibrary title="AWARDS" items={AWARDS} />
      <DocumentLibrary title="BUSINESS CARDS" items={BUSINESS_CARDS} />
      <DocumentLibrary title="SIGNS" items={SIGNS} />

      {/* View Actions Footer */}
      <div className="flex items-center space-x-12 px-8 py-6 bg-[#1a1a1a]/20 rounded-3xl border border-white/5 mt-12">
         <button className="flex items-center space-x-2 text-[12px] font-bold text-slate-400 hover:text-pink-500 transition-colors group">
           <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
             <RefreshCw className="w-4 h-4 text-pink-500 group-hover:rotate-180 transition-transform duration-500" />
           </div>
           <span className="uppercase tracking-tight">Update All Resources</span>
         </button>
         <div className="flex items-center space-x-2 text-[12px] font-bold text-slate-400">
           <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
             <ChevronRight className="w-4 h-4 text-pink-500" />
           </div>
           <span className="uppercase tracking-tight">230 Views this week</span>
         </div>
         <button className="flex items-center space-x-2 text-[12px] font-bold text-slate-400 hover:text-pink-500 transition-colors group">
           <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
             <Share2 className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
           </div>
           <span className="uppercase tracking-tight">Share Marketing Hub</span>
         </button>
      </div>
    </div>
  );
};

export default MarketingView;
