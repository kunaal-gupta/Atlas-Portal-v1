import { ArrowLeft, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { requestLoginCode, verifyLoginCode, type PortalUser } from '../../api/auth';

export default function LoginPage({ onLogin }: { onLogin: (user: PortalUser) => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await requestLoginCode(email); setStep('code'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to send a code.'); }
    finally { setBusy(false); }
  }
  async function verify(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const session = await verifyLoginCode(email, code);
      if (session.user) onLogin(session.user);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-5 py-12 text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,.35),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,.2),_transparent_36%)]" />
    <div className="relative w-full max-w-md">
      <div className="mb-8 flex items-center justify-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-extrabold text-slate-950">A</span><div><strong className="block text-2xl">Atlas</strong><small className="uppercase tracking-[.22em] text-slate-400">Intelligence portal</small></div></div>
      <section className="rounded-[28px] border border-white/10 bg-white p-7 text-slate-950 shadow-2xl sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">{step === 'email' ? <LockKeyhole className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}</span>
        <h1 className="mt-5 text-2xl font-extrabold">{step === 'email' ? 'Welcome to Atlas' : 'Check your inbox'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{step === 'email' ? 'Enter your approved work email. We’ll send you a secure one-time code—no password needed.' : <>Enter the six-digit code sent to <strong className="text-slate-700">{email}</strong>. It expires in 10 minutes.</>}</p>
        <form onSubmit={step === 'email' ? send : verify} className="mt-7 space-y-4">
          {step === 'email' ? <label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><span className="relative block"><Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><input autoFocus required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com" className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" /></span></label> : <label className="block"><span className="mb-2 block text-sm font-bold">One-time code</span><input autoFocus required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[.35em] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" /></label>}
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
          <button disabled={busy || (step === 'code' && code.length !== 6)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{step === 'email' ? 'Email me a login code' : 'Sign in securely'}</button>
          {step === 'code' && <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }} className="flex w-full items-center justify-center gap-2 py-1 text-sm font-bold text-slate-500 hover:text-indigo-600"><ArrowLeft className="h-4 w-4" /> Use another email</button>}
        </form>
      </section>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Access is managed by your Atlas administrator</p>
    </div>
  </main>;
}
