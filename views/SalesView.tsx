
import React from 'react';
import { 
  FileText, 
  Folder, 
  Download, 
  RefreshCw, 
  Grid3X3, 
  FileDown, 
  ChevronRight, 
  Info,
  Layers,
  FileBadge
} from 'lucide-react';

interface DocItem {
  id: string;
  name: string;
  modified: string;
  modifiedBy: string;
  type: 'folder' | 'pdf' | 'pptx' | 'doc';
}

const CONTRACTS: DocItem[] = [
  { id: 'c1', name: 'Buyers Package', modified: 'May 9, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'c2', name: 'MISC - Supplementary', modified: 'May 11, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
  { id: 'c3', name: 'SALE OF ASSETS (NO REAL ESTATE)', modified: 'December 21, 2021', modifiedBy: 'OFFICE | MOZAIC', type: 'folder' },
  { id: 'c4', name: 'Sellers Package', modified: 'May 9, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'folder' },
];

const GUIDES: DocItem[] = [
  { id: 'g1', name: 'Essentail Questions to Buyers.pdf', modified: 'January 14', modifiedBy: 'TECHNOLOGY | MOZAIC', type: 'pdf' },
  { id: 'g2', name: 'Home Buyers Guide Template.pptx', modified: 'May 11, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pptx' },
  { id: 'g3', name: 'Home Sellers Guide Template.pptx', modified: 'May 11, 2021', modifiedBy: 'Marketing | MOZAIC', type: 'pptx' },
];

const DocumentLibrary: React.FC<{ title: string; items: DocItem[] }> = ({ title, items }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-white tracking-tight uppercase">{title}</h3>
        <button className="text-[11px] font-black text-pink-500 hover:text-pink-400 transition-colors uppercase tracking-[0.2em] flex items-center">
          See all <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="bg-[#1a1a1a]/60 rounded-3xl border border-white/5 overflow-hidden">
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

        {items.length > 0 ? (
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
                      <Folder className="w-5 h-5 text-amber-500" />
                    ) : item.type === 'pptx' ? (
                      <FileBadge className="w-5 h-5 text-orange-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-pink-500" />
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
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 bg-slate-800/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
               <Layers className="w-10 h-10 text-slate-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-200">This list is empty</h4>
          </div>
        )}
      </div>
    </section>
  );
};

const SalesView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden rounded-[40px] border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1500" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Sales Analytics"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-16">
          <h2 className="text-7xl font-black text-white uppercase tracking-tighter">SALES</h2>
        </div>
      </section>

      {/* Content Sections */}
      <DocumentLibrary title="CONTRACTS" items={CONTRACTS} />
      <DocumentLibrary title="GUIDES/PRESENTATIONS" items={GUIDES} />
      <DocumentLibrary title="PROMOS" items={[]} />
      <DocumentLibrary title="TRAINING" items={[]} />
    </div>
  );
};

export default SalesView;
