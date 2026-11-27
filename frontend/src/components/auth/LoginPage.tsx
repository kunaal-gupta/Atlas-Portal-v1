import { ArrowLeft, KeyRound, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import './LoginPage.css';
import { requestLoginCode, verifyLoginCode, type PortalUser } from '../../api/auth';

export default function LoginPage({ onLogin }: { onLogin: (user: PortalUser) => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try { await requestLoginCode(email); setStep('code'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to send a code.'); }
    finally { setBusy(false); }
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const session = await verifyLoginCode(email, code);
      if (session.user) onLogin(session.user);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  const field = 'min-h-12 w-full rounded-lg border border-slate-300 bg-white outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-600 dark:bg-slate-950';
  const isEmailStep = step === 'email';

  return (
    <main className="atlas-login grid min-h-dvh place-items-center px-4 py-8 text-slate-950 dark:text-slate-100 sm:px-6 sm:py-12">
      <div className="relative w-full max-w-[420px]">
        <div className="mb-5 flex items-center gap-3 text-white">
          <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-[#3e545c] text-xl font-bold">A</span>
          <div>
            <strong className="block text-xl leading-tight tracking-tight">Atlas</strong>
            <span className="block text-[11px] font-medium uppercase tracking-widest text-[#d4e0e2]">Agent Intelligence</span>
          </div>
        </div>

        <section aria-labelledby="login-title" className="atlas-login-card rounded-2xl border border-white/60 bg-[#fbfcfc] p-6 dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {isEmailStep ? <LockKeyhole className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
          </span>
          <h1 id="login-title" className="mt-4 text-2xl font-bold leading-tight tracking-tight">
            {isEmailStep ? 'Welcome to Atlas' : 'Check your inbox'}
          </h1>
          <p className="mt-2 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
            {isEmailStep ? 'Enter your approved work email to receive a one-time sign-in code.'
              : <>Enter the six-digit code sent to <strong className="text-slate-900 dark:text-white">{email}</strong>. It expires in 10 minutes.</>}
          </p>

          <form onSubmit={isEmailStep ? send : verify} aria-busy={busy} className="mt-6 space-y-4">
            {isEmailStep ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Email address</span>
                <span className="relative block">
                  <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-slate-500" />
                  <input key="email" autoFocus required type="email" autoComplete="email" value={email}
                    onChange={event => setEmail(event.target.value)} placeholder="you@company.com" className={`${field} pl-10 pr-3`} />
                </span>
              </label>
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">One-time code</span>
                <input key="code" autoFocus required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code}
                  onChange={event => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000"
                  className={`${field} px-3 text-center font-mono text-xl font-semibold tracking-[.3em]`} />
              </label>
            )}
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
            <button disabled={busy || (!isEmailStep && code.length !== 6)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#274850] px-4 text-sm font-semibold text-white transition hover:bg-[#1f3940] disabled:opacity-60">
              {busy && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
              {busy ? (isEmailStep ? 'Sending code…' : 'Signing in…') : isEmailStep ? 'Email me a login code' : 'Sign in securely'}
            </button>
            {!isEmailStep && <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }}
              className="flex min-h-9 w-full items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />Use another email
            </button>}
          </form>
        </section>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#d4e0e2]">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0" />Access is managed by your Atlas administrator
        </p>
      </div>
    </main>
  );
}
