
import React from 'react';
import { Eye, Clock, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../../types';

const ARTICLES: NewsArticle[] = [
  {
    id: '1',
    title: 'Starting 2025 with A Refreshed Look, But The Same Heart!',
    excerpt: 'Dear Agents, As we step into 2025, Mozaic Realty Group is unveiling a new identity that reflects our growth and commitment to excellence...',
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Feature Article */}
      <div className="lg:col-span-2 group">
        <div className="relative overflow-hidden rounded-3xl h-[500px] border border-slate-800 transition-all group-hover:border-pink-500/50 shadow-2xl">
          <img 
            src={mainArticle.imageUrl} 
            alt={mainArticle.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <div className="absolute bottom-0 p-8 w-full">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-pink-600 text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase tracking-tighter">
                {mainArticle.department}
              </span>
              <div className="flex items-center text-slate-400 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {mainArticle.date}
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4 text-white leading-tight group-hover:text-pink-400 transition-colors">
              {mainArticle.title}
            </h3>
            <p className="text-slate-300 line-clamp-2 text-sm mb-6 max-w-2xl">
              {mainArticle.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] border border-slate-700">MT</div>
                <span className="text-xs text-slate-400">By {mainArticle.author}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 text-xs">
                <Eye className="w-4 h-4" />
                <span>{mainArticle.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Articles */}
      <div className="space-y-6">
        {sideArticles.map(article => (
          <div key={article.id} className="flex flex-col md:flex-row lg:flex-col gap-4 group cursor-pointer">
            <div className="w-full md:w-48 lg:w-full h-32 overflow-hidden rounded-2xl border border-slate-800 group-hover:border-slate-600 transition-all shadow-lg">
              <img 
                src={article.imageUrl} 
                className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                alt={article.title} 
              />
            </div>
            <div className="flex-grow">
              <span className="text-[10px] font-semibold text-pink-500 mb-1 block">{article.department}</span>
              <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">
                {article.title}
              </h4>
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                <span>{article.date}</span>
                <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {article.views}</span>
              </div>
            </div>
          </div>
        ))}
        
        <button className="w-full py-4 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500 hover:text-white hover:border-slate-600 hover:bg-slate-900/50 transition-all flex items-center justify-center group">
          View all updates <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default NewsSection;
