'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, inputCls, btnPrimary, Spinner } from '../../../components/ui.jsx';
import { IcShield } from '../../../components/icons.jsx';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me').then((r) => r.json()).then((d) => d.admin && router.replace('/admin'));
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Login failed.');
    router.replace('/admin');
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink text-gold dark:bg-black">
          <IcShield size={26} />
        </span>
        <h1 className="mt-4 text-center font-display text-xl font-bold">Admin access</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">Restricted area — staff only</p>
        {err && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">{err}</p>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Admin password">
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
          </Field>
          <button disabled={busy} className={`${btnPrimary} w-full`}>
            {busy ? <Spinner className="border-ink/30 border-t-ink" /> : 'Unlock dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
