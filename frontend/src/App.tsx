import { ArrowRight, Sparkles } from 'lucide-react';
import Header from './components/layout/Header';
import Sidebar, { type NavigationGroup } from './components/layout/Sidebar';
import HomeDashboard from './components/HomeDashboard';
import MarketPage from './pages/numbers/MarketPage';
import AgentPage from './pages/numbers/AgentPage';
import FirmPage from './pages/numbers/FirmPage';
import NewAgentPage from './pages/training/NewAgentPage';
import NewConstructionPage from './pages/training/NewConstructionPage';
import OngoingPage from './pages/training/OngoingPage';
import TradePartnersPage from './pages/resources/TradePartnersPage';
import CondoPage from './pages/resources/CondoPage';
import GeneralPage from './pages/resources/GeneralPage';
import ResourceTipsPage from './pages/resources/TipsPage';
import NewsEventsPage from './pages/resources/NewsEventsPage';
import CalendarPage from './pages/resources/CalendarPage';
import LogosPage from './pages/marketing/LogosPage';
import BrandBookSummaryPage from './pages/marketing/BrandBookSummaryPage';
import TemplatesPage from './pages/marketing/TemplatesPage';
import CanvaLinkPage from './pages/marketing/CanvaLinkPage';
import HoodQPage from './pages/neighbourhood/HoodQPage';
import SchoolsShoppingHospitalsPage from './pages/neighbourhood/SchoolsShoppingHospitalsPage';
import BrokerageManualPage from './pages/compliance/BrokerageManualPage';
import FintracPage from './pages/compliance/FintracPage';
import ComplianceTipsPage from './pages/compliance/TipsPage';
import OtherPage from './pages/compliance/OtherPage';

const routes: Record<string, React.ComponentType> = {
  '/the-numbers/market/': MarketPage, '/the-numbers/agent/': AgentPage, '/the-numbers/firm/': FirmPage,
  '/training/new-agent/': NewAgentPage, '/training/new-construction/': NewConstructionPage, '/training/on-going/': OngoingPage,
  '/resources/trade-partners/': TradePartnersPage, '/resources/condo/': CondoPage, '/resources/general/': GeneralPage, '/resources/tips/': ResourceTipsPage, '/resources/news-and-events/': NewsEventsPage, '/resources/calendar/': CalendarPage,
  '/marketing/logos/': LogosPage, '/marketing/brand-book-summary/': BrandBookSummaryPage, '/marketing/templates/': TemplatesPage, '/marketing/canva-link/': CanvaLinkPage,
  '/neighbourhoods/hoodq/': HoodQPage, '/neighbourhoods/schools-shopping-hospitals/': SchoolsShoppingHospitalsPage,
  '/compliance/brokerage-manual/': BrokerageManualPage, '/compliance/fintrac/': FintracPage, '/compliance/tips/': ComplianceTipsPage, '/compliance/other/': OtherPage,
};

const navigation: NavigationGroup[] = [
  { name: 'The Numbers', links: [['Market','/the-numbers/market/'],['Agent','/the-numbers/agent/'],['Firm','/the-numbers/firm/']].map(([name,path]) => ({name,path})) },
  { name: 'Training', links: [['New Agent','/training/new-agent/'],['New Construction','/training/new-construction/'],['On-Going','/training/on-going/']].map(([name,path]) => ({name,path})) },
  { name: 'Resources', links: [['Trade Partners','/resources/trade-partners/'],['Condo','/resources/condo/'],['General','/resources/general/'],['Tips','/resources/tips/'],['News & Events','/resources/news-and-events/'],['Calendar','/resources/calendar/']].map(([name,path]) => ({name,path})) },
  { name: 'Marketing', links: [['Logos','/marketing/logos/'],['Brand Book Summary','/marketing/brand-book-summary/'],['Templates','/marketing/templates/'],['Canva Link','/marketing/canva-link/']].map(([name,path]) => ({name,path})) },
  { name: 'Neighbourhoods', links: [['HoodQ','/neighbourhoods/hoodq/'],['Schools, Shopping, Hospitals','/neighbourhoods/schools-shopping-hospitals/']].map(([name,path]) => ({name,path})) },
  { name: 'Compliance', links: [['Brokerage Manual','/compliance/brokerage-manual/'],['FINTRAC','/compliance/fintrac/'],['Tips','/compliance/tips/'],['Other','/compliance/other/']].map(([name,path]) => ({name,path})) },
];

function HomePage() { return <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-10"><section className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-10 text-white"><Sparkles className="h-5 w-5 text-indigo-300" /><h1 className="mt-3 text-4xl font-extrabold">Good morning, Alex.</h1><p className="mt-3 text-slate-300">Your market pulse, company news, and important updates—all in one focused view.</p><a href="/the-numbers/market/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950">View market <ArrowRight className="h-4 w-4" /></a></section><HomeDashboard /></div>; }

export default function App() {
  const Page = routes[window.location.pathname];
  return <div className="app-grid min-h-screen bg-[#f7f8fc] text-slate-950 dark:bg-[#080b12] dark:text-slate-100"><Header groups={navigation} /><Sidebar groups={navigation} /><main>{Page ? <Page /> : <HomePage />}</main><footer className="mt-10 border-t border-slate-200 bg-white py-8 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-10"><span>© {new Date().getFullYear()} Atlas internal agent intelligence</span><a href="/admin/" className="font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Admin</a></div></footer></div>;
}
