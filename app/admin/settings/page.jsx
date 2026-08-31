'use client';
import { useEffect, useState } from 'react';
import { Field, inputCls, btnPrimary, Spinner } from '../../../components/ui.jsx';
import { useApp } from '../../../components/Providers.jsx';
import { IcBank, IcSettings } from '../../../components/icons.jsx';

export default function AdminSettings() {
  const { toast } = useApp();
  const [bank, setBank] = useState({ bank_name: '', bank_account_name: '', bank_account_number: '', payment_instructions: '', delivery_fee: '0', store_announcement: '' });
  const [pw, setPw] = useState({ current_password: '', new_password: '' });
  const [busyBank, setBusyBank] = useState(false);
  const [busyPw, setBusyPw] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => {
      setBank((b) => ({ ...b, ...d.settings }));
      setLoaded(true);
    });
  }, []);

  const saveBank = async (e) => {
    e.preventDefault();
    setBusyBank(true);
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bank),
    });
    const d = await r.json();
    setBusyBank(false);
    if (!r.ok) return toast(d.error || 'Could not save', 'err');
    toast('Settings saved — checkout now shows the new bank details.');
  };

  const savePw = async (e) => {
    e.preventDefault();
    setBusyPw(true);
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pw),
    });
    const d = await r.json();
    setBusyPw(false);
    if (!r.ok) return toast(d.error || 'Could not change password', 'err');
    toast('Admin password changed');
    setPw({ current_password: '', new_password: '' });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={saveBank} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="flex items-center gap-2 font-display text-lg font-bold">
          <IcBank size={18} className="text-gold-dark dark:text-gold" /> Bank transfer & store settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">These details are shown to customers at checkout and on their order page.</p>
        {!loaded ? (
          <div className="skeleton mt-4 h-40 rounded-xl" />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Bank name">
              <input className={inputCls} value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} placeholder="e.g. GTBank" />
            </Field>
            <Field label="Account name">
              <input className={inputCls} value={bank.bank_account_name} onChange={(e) => setBank({ ...bank, bank_account_name: e.target.value })} />
            </Field>
            <Field label="Account number">
              <input className={inputCls} value={bank.bank_account_number} onChange={(e) => setBank({ ...bank, bank_account_number: e.target.value })} inputMode="numeric" />
            </Field>
            <Field label="Delivery fee (₦, 0 = free)">
              <input className={inputCls} type="number" min="0" value={bank.delivery_fee} onChange={(e) => setBank({ ...bank, delivery_fee: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Payment instructions">
                <textarea rows={3} className={inputCls} value={bank.payment_instructions} onChange={(e) => setBank({ ...bank, payment_instructions: e.target.value })} placeholder="e.g. Send your receipt on WhatsApp after transferring." />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Home page announcement (optional)">
                <input className={inputCls} value={bank.store_announcement} onChange={(e) => setBank({ ...bank, store_announcement: e.target.value })} placeholder="e.g. New adire drop every Friday" />
              </Field>
            </div>
          </div>
        )}
        <button disabled={busyBank} className={`${btnPrimary} mt-4`}>
          {busyBank ? <Spinner className="border-ink/30 border-t-ink" /> : 'Save settings'}
        </button>
      </form>

      <form onSubmit={savePw} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="flex items-center gap-2 font-display text-lg font-bold">
          <IcSettings size={18} className="text-gold-dark dark:text-gold" /> Change admin password
        </h1>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Current password">
            <input type="password" className={inputCls} value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
          </Field>
          <Field label="New password" hint="Min 8 characters, letters + numbers.">
            <input type="password" className={inputCls} value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} required />
          </Field>
        </div>
        <button disabled={busyPw} className={`${btnPrimary} mt-4`}>
          {busyPw ? <Spinner className="border-ink/30 border-t-ink" /> : 'Update password'}
        </button>
      </form>
    </div>
  );
}
