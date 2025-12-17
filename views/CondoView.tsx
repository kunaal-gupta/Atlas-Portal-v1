
import React from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  RefreshCw, 
  Grid3X3, 
  FileDown, 
  ChevronRight, 
  Info,
  ThumbsUp,
  Eye,
  Bookmark
} from 'lucide-react';

interface CondoResource {
  id: string;
  name: string;
  modified: string;
  modifiedBy: string;
  type: 'pdf';
}

const RESOURCES: CondoResource[] = [
  { id: '1', name: 'Condo Fundamentlas SRG 2020.pdf', modified: 'June 2, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pdf' },
  { id: '2', name: 'Key Changes Summary Condominium Act .pdf', modified: 'June 2, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pdf' },
  { id: '3', name: 'Presentation_Images.pdf', modified: 'June 2, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pdf' },
];

const CondoView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Banner Section */}
      <section className="relative h-[300px] overflow-hidden rounded-[40px] border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1500" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Modern Architecture"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter">CONDOS</h2>
        </div>
      </section>

      {/* Condo Resources Library */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-white tracking-tight uppercase">CONDO RESOURCES</h3>
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
              {RESOURCES.map((doc) => (
                <div key={doc.id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center group hover:bg-white/5 transition-all cursor-pointer">
                  <div className="col-span-1 flex justify-center">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-slate-950">
                      <FileText className="w-5 h-5 text-pink-500" />
                    </div>
                  </div>
                  <div className="col-span-6">
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-pink-500 transition-colors uppercase tracking-tight">
                      {doc.name}
                    </h4>
                  </div>
                  <div className="col-span-2 text-xs font-medium text-slate-500">
                    {doc.modified}
                  </div>
                  <div className="col-span-3">
                    <span className="px-3 py-1 bg-slate-950 border border-white/5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {doc.modifiedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Engagement Footer Metrics */}
      <div className="flex items-center space-x-12 px-8 py-6 bg-[#1a1a1a]/20 rounded-3xl border border-white/5">
         <button className="flex items-center space-x-2 text-[12px] font-bold text-slate-400 hover:text-pink-500 transition-colors group">
           <ThumbsUp className="w-4 h-4 text-pink-600 group-hover:scale-110 transition-transform" />
           <span className="uppercase tracking-tight">Like</span>
         </button>
         <div className="flex items-center space-x-2 text-[12px] font-bold text-slate-400">
           <Eye className="w-4 h-4 text-pink-600" />
           <span className="uppercase tracking-tight">40 Views</span>
         </div>
         <button className="flex items-center space-x-2 text-[12px] font-bold text-slate-400 hover:text-pink-500 transition-colors group">
           <Bookmark className="w-4 h-4 text-pink-600 group-hover:scale-110 transition-transform" />
           <span className="uppercase tracking-tight">Save for later</span>
         </button>
      </div>
    </div>
  );
};

export default CondoView;
