'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../../../components/Providers.jsx';
import { Field, inputCls, btnPrimary, Spinner } from '../../../components/ui.jsx';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/account';
  const { refreshUser, toast } = useApp();
  const [form, setForm] = useState({
    username: '',
    phone: '',
    password: '',
    line1: '',
    city: '',
    state: '',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        phone: form.phone,
        password: form.password,
        address: { line1: form.line1, city: form.city, state: form.state, recipient: form.username },
      }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Registration failed.');
    await refreshUser();
    toast('Account created — welcome to BABDUD Culture!');
    router.push(next);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <img src="/brand/logo.jpg" alt="BABDUD Culture" className="mx-auto h-16 w-auto rounded-lg" />
        <h1 className="mt-4 text-center font-display text-xl font-bold">Create your account</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">Shop adire with your phone number — no OTP needed</p>
        {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">{err}</p>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Username">
            <input className={inputCls} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </Field>
          <Field label="Phone number">
            <input className={inputCls} inputMode="tel" placeholder="e.g. 08031234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </Field>
          <Field label="Password" hint="At least 8 characters, with letters and numbers.">
            <input className={inputCls} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </Field>
          <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Delivery address (optional)</p>
            <div className="space-y-3">
              <input className={inputCls} placeholder="Street address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input className={inputCls} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
          </div>
          <button disabled={busy} className={`${btnPrimary} w-full`}>
            {busy ? <Spinner className="border-ink/30 border-t-ink" /> : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-gold-dark hover:underline dark:text-gold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
