'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../../components/Providers.jsx';
import { Field, inputCls, btnPrimary, Spinner } from '../../../components/ui.jsx';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/account';
  const { refreshUser, toast } = useApp();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleOn, setGoogleOn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/config').then((r) => r.json()).then((d) => setGoogleOn(Boolean(d.google)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Login failed.');
    await refreshUser();
    toast(`Welcome back, ${d.user.username}!`);
    router.push(next);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <img src="/brand/logo.jpg" alt="BABDUD Culture" className="mx-auto h-16 w-auto rounded-lg" />
        <h1 className="mt-4 text-center font-display text-xl font-bold">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">Sign in with your phone number</p>
        {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">{err}</p>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Phone number">
            <input className={inputCls} inputMode="tel" placeholder="07061191218" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </Field>
          <Field label="Password">
            <input className={inputCls} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </Field>
          <button disabled={busy} className={`${btnPrimary} w-full`}>
            {busy ? <Spinner className="border-ink/30 border-t-ink" /> : 'Sign in'}
          </button>
        </form>
        {googleOn && (
          <a href="/api/auth/google" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
            <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            Continue with Google
          </a>
        )}
        <p className="mt-5 text-center text-sm text-neutral-500">
          New here?{' '}
          <Link href={`/auth/register${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-bold text-gold-dark hover:underline dark:text-gold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
