'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../components/Providers.jsx';
import { Field, inputCls, btnPrimary, btnGhost, Spinner } from '../../../components/ui.jsx';
import { IcMoon, IcSun, IcLogout } from '../../../components/icons.jsx';

export default function SettingsPage() {
  const { theme, toggleTheme, toast } = useApp();
  const router = useRouter();
  const [pw, setPw] = useState({ current_password: '', password: '' });
  const [busy, setBusy] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pw),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not change password', 'err');
    toast('Password changed');
    setPw({ current_password: '', password: '' });
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.dispatchEvent(new Event('bc-logout'));
    router.push('/');
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="font-display text-lg font-bold">Appearance</h1>
        <p className="mt-1 text-sm text-neutral-500">Your choice is saved on this device.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
              theme === 'light' ? 'border-gold bg-gold/10 text-gold-dark' : 'border-neutral-200 text-neutral-500 dark:border-neutral-700'
            }`}
          >
            <IcSun size={17} /> Light
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
              theme === 'dark' ? 'border-gold bg-gold/10 text-gold' : 'border-neutral-200 text-neutral-500 dark:border-neutral-700'
            }`}
          >
            <IcMoon size={17} /> Dark
          </button>
        </div>
      </div>

      <form onSubmit={changePassword} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-display text-lg font-bold">Security</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Current password">
            <input type="password" className={inputCls} value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
          </Field>
          <Field label="New password" hint="Min 8 characters, letters + numbers.">
            <input type="password" className={inputCls} value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} required />
          </Field>
        </div>
        <button disabled={busy} className={`${btnPrimary} mt-4`}>
          {busy ? <Spinner className="border-ink/30 border-t-ink" /> : 'Change password'}
        </button>
      </form>

      <div className="rounded-2xl border border-red-200 bg-white p-5 dark:border-red-900/50 dark:bg-neutral-900">
        <h2 className="font-display text-lg font-bold text-red-600 dark:text-red-400">Session</h2>
        <button onClick={logout} className={`${btnGhost} mt-3 !border-red-200 !text-red-600 hover:!bg-red-50 dark:!border-red-900/50`}>
          <IcLogout size={16} /> Log out
        </button>
      </div>
    </div>
  );
}
