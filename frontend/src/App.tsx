import { BarChart3, CalendarDays, LayoutGrid, LoaderCircle, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSession, type PortalUser } from './api/auth';
import { AuthContext, usePortalUser } from './components/auth/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import Sidebar, { categoryPath, type NavigationGroup } from './components/layout/Sidebar';
import FaqPage from './pages/resources/FaqPage';
import SupportDeskPage from './pages/workspace/SupportDeskPage';
import IntelligencePage from './pages/neighbourhood/IntelligencePage';
import HomeDashboard from './components/HomeDashboard';
import WelcomeMetrics from './components/WelcomeMetrics';
import RequiredActionBanner from './components/RequiredActionBanner';
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
  '/support/': SupportDeskPage,
  '/faq/': FaqPage,
  '/neighbourhoods/intelligence/': IntelligencePage,
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
  { name: 'Neighbourhoods', links: [['Neighbourhood Intelligence','/neighbourhoods/intelligence/'],['HoodQ','/neighbourhoods/hoodq/'],['Schools, Shopping, Hospitals','/neighbourhoods/schools-shopping-hospitals/']].map(([name,path]) => ({name,path})) },
  { name: 'Compliance', links: [['Brokerage Manual','/compliance/brokerage-manual/'],['FINTRAC','/compliance/fintrac/'],['Tips','/compliance/tips/'],['Other','/compliance/other/']].map(([name,path]) => ({name,path})) },
];

function HomePage() {
  const user = usePortalUser();
  const displayName = user?.name.trim() || '';
  const firstName = displayName.includes('@')
    ? (displayName.toLowerCase() === 'kunaalgupta@hotmail.com' ? 'Kunaal' : displayName.split('@')[0].split(/[._-]/)[0].replace(/^./, letter => letter.toUpperCase()))
    : displayName.split(/\s+/)[0];
  return (
    <div className="home-page mx-auto max-w-[1360px] px-4 pb-8 pt-5 sm:px-6 lg:px-10 lg:pt-8">
      <section aria-label="Welcome" className="welcome-surface flex flex-col items-start justify-end gap-5 px-5 py-7 sm:px-8 sm:py-7">
        <h1 className="min-w-0 break-words">
          Welcome back{firstName ? `, ${firstName}` : ' to Atlas'}.
        </h1>
        <div className="flex flex-wrap gap-2" aria-label="Quick actions">
          <a href="#agent-toolkit" className="home-quick-link home-quick-link-primary"><LayoutGrid aria-hidden="true" className="h-4 w-4" />Agent toolkit</a>
          <a href="/resources/calendar/" className="home-quick-link"><CalendarDays aria-hidden="true" className="h-4 w-4" />Calendar</a>
          <a href="/the-numbers/agent/" className="home-quick-link"><Users aria-hidden="true" className="h-4 w-4" />Agent directory</a>
          <a href="/the-numbers/market/" className="home-quick-link"><BarChart3 aria-hidden="true" className="h-4 w-4" />Market</a>
        </div>
      </section>
      <RequiredActionBanner />
      <div className="mt-6"><WelcomeMetrics /></div>
      <HomeDashboard />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getSession().then(session => setUser(session.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-indigo-600 dark:bg-slate-950 dark:text-indigo-300"><LoaderCircle className="h-8 w-8 animate-spin" aria-label="Loading Atlas" /></div>;
  if (!user) return <LoginPage onLogin={setUser} />;
  const Page = routes[window.location.pathname];
  const category = navigation.find(group => categoryPath(group) === window.location.pathname);
  return <AuthContext.Provider value={user}><div className="portal-background min-h-screen bg-[#F3F5F9] text-slate-800 dark:bg-slate-950 dark:text-slate-100"><a href="#main-content" className="skip-link">Skip to content</a><Header groups={navigation} user={user} onLogout={() => setUser(null)} /><Sidebar groups={navigation} /><main id="main-content" tabIndex={-1}>{Page ? <Page /> : category ? <CategoryOverview group={category} pages={routes} /> : <HomePage />}</main><footer className="mt-8 border-t border-slate-200/70 bg-white/60 py-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 lg:px-10"><span>© {new Date().getFullYear()} Atlas internal agent intelligence</span><nav aria-label="Footer links" className="flex flex-wrap items-center gap-4"><a href="/faq/" className="inline-flex min-h-10 items-center rounded-lg px-1 font-semibold text-indigo-700 hover:underline dark:text-indigo-300">FAQ</a><a href="/support/" className="inline-flex min-h-10 items-center rounded-lg px-1 font-semibold text-indigo-700 hover:underline dark:text-indigo-300">Agent Support Desk</a>{user.is_superuser && <a href="/admin/" className="font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Admin</a>}</nav></div></footer></div></AuthContext.Provider>;
}
