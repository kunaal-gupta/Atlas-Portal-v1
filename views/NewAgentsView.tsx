
import React from 'react';
import { 
  ExternalLink, 
  FileText, 
  Folder, 
  LayoutGrid, 
  Download, 
  RefreshCw, 
  Share2, 
  ChevronRight,
  Info,
  Grid3X3,
  FileDown
} from 'lucide-react';

const NewAgentsView: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Resource Link */}
      <div className="flex items-center space-x-2 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer group w-fit">
        <span className="text-sm font-bold border-b border-rose-400/30 pb-0.5 tracking-tight">https://bit.ly/agent-onboarding-form</span>
        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>

      {/* Main Feature: Onboarding Form */}
      <section className="bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden group hover:border-emerald-500/20 transition-all shadow-xl">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-slate-800">
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              alt="Form Illustration"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
          </div>
          <div className="md:w-2/3 p-8 flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-black text-white tracking-tight uppercase">AGENT ONBOARDING FORM</h3>
              <span className="text-slate-500 font-medium">| WorkForms</span>
            </div>
            <p className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-widest">bit.ly</p>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Send this form to new agents as the first step of the onboarding process. This ensures all documentation and system access are handled efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Document Library: New Agent Package */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black text-white tracking-tighter uppercase">NEW AGENT PACKAGE</h3>
          <button className="text-[11px] font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-[0.2em] flex items-center">
            See all <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="bg-slate-900/40 rounded-[32px] border border-white/5 overflow-hidden backdrop-blur-md">
          {/* SharePoint-style Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/60 border-b border-white/5 gap-4">
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/80 rounded-xl text-[10px] font-black text-slate-300 hover:bg-slate-700 transition-all uppercase tracking-widest">
                <Grid3X3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Edit in grid view</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/80 rounded-xl text-[10px] font-black text-slate-300 hover:bg-slate-700 transition-all uppercase tracking-widest">
                <FileDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export to Excel</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/80 rounded-xl text-[10px] font-black text-slate-300 hover:bg-slate-700 transition-all uppercase tracking-widest">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sync</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-1 px-3 py-1.5 bg-slate-950 rounded-lg text-[10px] font-black text-slate-400 border border-white/5">
                 <span>All Documents</span>
                 <ChevronRight className="w-3 h-3 rotate-90" />
               </div>
               <Info className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-pointer" />
            </div>
          </div>

          {/* Table */}
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
              <div className="col-span-1">Icon</div>
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-3">Modified By</div>
            </div>

            <div className="divide-y divide-white/5">
              {/* Folder: Forms and Consents */}
              <div className="grid grid-cols-12 gap-4 px-8 py-5 items-center group hover:bg-white/5 transition-all cursor-pointer">
                <div className="col-span-1 flex justify-center">
                  <Folder className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="col-span-6">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">Forms and Consents</span>
                </div>
                <div className="col-span-2 text-xs font-medium text-slate-500">May 11, 2021</div>
                <div className="col-span-3">
                  <span className="px-3 py-1 bg-slate-950/50 rounded-lg text-[10px] font-bold text-slate-400 border border-white/5">
                    Marketing | MOZAIC
                  </span>
                </div>
              </div>

              {/* File: DEPOSIT CHEQUE... */}
              <div className="grid grid-cols-12 gap-4 px-8 py-5 items-center group hover:bg-white/5 transition-all cursor-pointer">
                <div className="col-span-1 flex justify-center">
                  <FileText className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="col-span-6">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                    DEPOSIT CHEQUE DROP-OFF PROCEDURE.pdf
                  </span>
                </div>
                <div className="col-span-2 text-xs font-medium text-slate-500">March 28, 2022</div>
                <div className="col-span-3">
                  <span className="px-3 py-1 bg-slate-950/50 rounded-lg text-[10px] font-bold text-slate-400 border border-white/5">
                    OFFICE | MOZAIC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewAgentsView;
