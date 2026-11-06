import { BarChart3, CalendarDays, LoaderCircle, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSession, type PortalUser } from './api/auth';
import { AuthContext, usePortalUser } from './components/auth/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import Sidebar, { categoryPath, type NavigationGroup } from './components/layout/Sidebar';
import HomeDashboard from './components/HomeDashboard';
import WelcomeMetrics from './components/WelcomeMetrics';
import CategoryOverview from './components/shared/CategoryOverview';
import MarketPage from './pages/numbers/MarketPage';
import AgentPage from './pages/numbers/AgentPage';
import FirmPage from './pages/numbers/FirmPage';
import CalculatorsPage from './pages/numbers/CalculatorsPage';
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
  '/the-numbers/calculators/': CalculatorsPage,
  '/the-numbers/market/': MarketPage, '/the-numbers/agent/': AgentPage, '/the-numbers/firm/': FirmPage,
  '/training/new-agent/': NewAgentPage, '/training/new-construction/': NewConstructionPage, '/training/on-going/': OngoingPage,
  '/resources/trade-partners/': TradePartnersPage, '/resources/condo/': CondoPage, '/resources/general/': GeneralPage, '/resources/tips/': ResourceTipsPage, '/resources/news-and-events/': NewsEventsPage, '/resources/calendar/': CalendarPage,
  '/marketing/logos/': LogosPage, '/marketing/brand-book-summary/': BrandBookSummaryPage, '/marketing/templates/': TemplatesPage, '/marketing/canva-link/': CanvaLinkPage,
  '/neighbourhoods/hoodq/': HoodQPage, '/neighbourhoods/schools-shopping-hospitals/': SchoolsShoppingHospitalsPage,
  '/compliance/brokerage-manual/': BrokerageManualPage, '/compliance/fintrac/': FintracPage, '/compliance/tips/': ComplianceTipsPage, '/compliance/other/': OtherPage,
};

const navigation: NavigationGroup[] = [
  { name: 'The Numbers', links: [['Market','/the-numbers/market/'],['Agent','/the-numbers/agent/'],['Firm','/the-numbers/firm/'],['Calculators','/the-numbers/calculators/']].map(([name,path]) => ({name,path})) },
  { name: 'Training', links: [['New Agent','/training/new-agent/'],['New Construction','/training/new-construction/'],['On-Going','/training/on-going/']].map(([name,path]) => ({name,path})) },
  { name: 'Resources', links: [['Trade Partners','/resources/trade-partners/'],['Condo','/resources/condo/'],['General','/resources/general/'],['Tips','/resources/tips/'],['News & Events','/resources/news-and-events/'],['Calendar','/resources/calendar/']].map(([name,path]) => ({name,path})) },
  { name: 'Marketing', links: [['Logos','/marketing/logos/'],['Brand Book Summary','/marketing/brand-book-summary/'],['Templates','/marketing/templates/'],['Canva Link','/marketing/canva-link/']].map(([name,path]) => ({name,path})) },
  { name: 'Neighbourhoods', links: [['HoodQ','/neighbourhoods/hoodq/'],['Schools, Shopping, Hospitals','/neighbourhoods/schools-shopping-hospitals/']].map(([name,path]) => ({name,path})) },
  { name: 'Compliance', links: [['Brokerage Manual','/compliance/brokerage-manual/'],['FINTRAC','/compliance/fintrac/'],['Tips','/compliance/tips/'],['Other','/compliance/other/']].map(([name,path]) => ({name,path})) },
];

function HomePage() {
  const user = usePortalUser();
  const displayName = user?.name.trim() || '';
  const firstName = displayName.includes('@')
    ? (displayName.toLowerCase() === 'kunaalgupta@hotmail.com' ? 'Kunaal' : displayName.split('@')[0].split(/[._-]/)[0].replace(/^./, letter => letter.toUpperCase()))
    : displayName.split(/\s+/)[0];
  return <div className="home-page mx-auto max-w-[1500px] px-4 pb-6 pt-3 sm:px-5 lg:px-10">
    <section aria-label="Welcome" className="welcome-surface grid grid-cols-1 items-center gap-3 px-4 py-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto]">
      <div className="min-w-0 sm:col-span-2 lg:col-span-1"><p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-indigo-700 dark:text-indigo-300"><Sparkles className="h-3.5 w-3.5" />Your workspace</p><h1 className="text-[28px] font-semibold leading-9 tracking-tight text-slate-950 dark:text-white">Welcome back{firstName ? `, ${firstName}` : ' to Atlas'}<span className="text-indigo-600 dark:text-indigo-300">.</span></h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your people, resources, and business updates.</p></div>
      <WelcomeMetrics />
      <div className="flex items-center justify-end gap-2" aria-label="Quick actions"><a href="/resources/calendar/" aria-label="Calendar" title="Calendar" className="portal-interactive grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><CalendarDays aria-hidden="true" className="h-5 w-5" /></a><a href="/the-numbers/agent/" aria-label="Agent directory" title="Agent directory" className="portal-interactive grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Users aria-hidden="true" className="h-5 w-5" /></a><a href="/the-numbers/market/" aria-label="Explore market" title="Explore market" className="portal-interactive grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"><BarChart3 aria-hidden="true" className="h-5 w-5" /></a></div>
    </section>
    <HomeDashboard />
  </div>;
}

export default function App() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getSession().then(session => setUser(session.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-indigo-600 dark:bg-slate-950 dark:text-indigo-300"><LoaderCircle className="h-8 w-8 animate-spin" aria-label="Loading Atlas" /></div>;
  if (!user) return <LoginPage onLogin={setUser} />;
  const Page = routes[window.location.pathname];
  const category = navigation.find(group => categoryPath(group) === window.location.pathname);
  return <AuthContext.Provider value={user}><div className="portal-background min-h-screen bg-[#F3F5F9] text-slate-800 dark:bg-slate-950 dark:text-slate-100"><a href="#main-content" className="skip-link">Skip to content</a><Header groups={navigation} user={user} onLogout={() => setUser(null)} /><Sidebar groups={navigation} /><main id="main-content" tabIndex={-1}>{Page ? <Page /> : category ? <CategoryOverview group={category} pages={routes} /> : <HomePage />}</main><footer className="mt-8 border-t border-slate-200/70 bg-white/60 py-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-10"><span>© {new Date().getFullYear()} Atlas internal agent intelligence</span>{user.is_superuser && <a href="/admin/" className="font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Admin</a>}</div></footer></div></AuthContext.Provider>;
}
