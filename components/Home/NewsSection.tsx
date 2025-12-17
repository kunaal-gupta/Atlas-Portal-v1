
import React from 'react';
import { Eye, Clock, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../../types';

const ARTICLES: NewsArticle[] = [
  {
    id: '1',
    title: 'Starting 2025 with A Refreshed Look, But The Same Heart!',
    excerpt: 'Dear Agents, As we step into 2025, Mozaic Realty Group is unveiling a new identity that reflects our growth and commitment to excellence. We are modernizing our internal processes to support your success better than ever before.',
    author: 'Marketing Team',
    department: 'MARKETING',
    date: 'January 9, 2025',
    views: 1240,
    imageUrl: 'https://picsum.photos/seed/mozaic1/1200/800',
  },
  {
    id: '2',
    title: 'Snapshots from Xmas Party 2024!',
    excerpt: 'Relive the magic of our annual holiday gathering. It was a night of joy, dancing, and celebrating our incredible successes...',
    author: 'Events Dept',
    department: 'CULTURE',
    date: 'December 21, 2024',
    views: 890,
    imageUrl: 'https://picsum.photos/seed/party/600/400',
  },
  {
    id: '3',
    title: 'Introducing the New Inventory Dashboard',
    excerpt: 'Fresh design, simplified features. Track your listings, manage showings, and analyze market trends faster than ever...',
    author: 'Tech Support',
    department: 'TECHNOLOGY',
    date: 'December 17, 2024',
    views: 2100,
    imageUrl: 'https://picsum.photos/seed/tech/600/400',
  }
];

const NewsSection: React.FC = () => {
  const mainArticle = ARTICLES[0];
  const sideArticles = ARTICLES.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Feature Article */}
      <div className="lg:col-span-8 group">
        <div className="relative overflow-hidden rounded-[32px] h-[400px] border border-white/5 transition-all group-hover:border-rose-500/30 shadow-2xl">
          <img 
            src={mainArticle.imageUrl} 
            alt={mainArticle.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          <div className="absolute bottom-0 p-8 w-full backdrop-blur-[2px] bg-slate-950/20">
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-rose-600 text-[10px] font-black px-4 py-1.5 rounded-lg text-white uppercase tracking-[0.1em]">
                {mainArticle.department}
              </span>
              <div className="flex items-center text-slate-300 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5 mr-2 text-rose-500" />
                {mainArticle.date}
              </div>
            </div>
            <h3 className="text-3xl font-black mb-4 text-white leading-tight group-hover:text-rose-400 transition-colors tracking-tighter">
              {mainArticle.title}
            </h3>
            <p className="text-slate-300 line-clamp-2 text-[13px] font-medium mb-6 max-w-2xl leading-relaxed">
              {mainArticle.excerpt}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800/80 backdrop-blur-sm flex items-center justify-center text-[10px] font-black border border-white/5 text-slate-300">MT</div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">By {mainArticle.author}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-bold">
                <Eye className="w-4 h-4 text-rose-500" />
                <span>{mainArticle.views.toLocaleString()} VIEWS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Articles */}
      <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
        {sideArticles.map(article => (
          <div key={article.id} className="flex gap-5 group cursor-pointer bg-slate-900/40 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl border border-white/5 group-hover:border-rose-500/30 transition-all">
              <img 
                src={article.imageUrl} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={article.title} 
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-black text-rose-500 mb-1.5 block tracking-widest uppercase">{article.department}</span>
              <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                <span>{article.date}</span>
                <span className="flex items-center text-rose-500/70"><Eye className="w-3.5 h-3.5 mr-1" /> {article.views}</span>
              </div>
            </div>
          </div>
        ))}
        
        <button className="w-full py-5 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-[11px] font-black text-slate-500 hover:text-white hover:border-slate-600 hover:bg-slate-800/80 transition-all flex items-center justify-center group uppercase tracking-[0.2em]">
          All Updates <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default NewsSection;
