'use client';
import { useEffect, useState } from 'react';
import { useApp } from '../../../components/Providers.jsx';
import { Empty, Field, inputCls, btnPrimary, btnGhost, Spinner } from '../../../components/ui.jsx';
import { IcLocation, IcEdit, IcTrash, IcPlus } from '../../../components/icons.jsx';

const blank = { recipient: '', phone: '', line1: '', city: '', state: '', notes: '' };

export default function AddressesPage() {
  const { toast } = useApp();
  const [addresses, setAddresses] = useState(null);
  const [editing, setEditing] = useState(null); // object or null
  const [busy, setBusy] = useState(false);

  const load = () => fetch('/api/account').then((r) => r.json()).then((d) => setAddresses(d.addresses || []));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing.line1?.trim()) return toast('Street address is required.', 'err');
    setBusy(true);
    const isEdit = Boolean(editing.id);
    const r = await fetch('/api/account', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not save address', 'err');
    toast('Address saved');
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this address?')) return;
    await fetch(`/api/account?id=${id}`, { method: 'DELETE' });
    toast('Address deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold">Delivery addresses</h1>
        {!editing && (
          <button onClick={() => setEditing({ ...blank })} className={`${btnPrimary} !px-4 !py-2`}>
            <IcPlus size={15} /> Add address
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-4 rounded-2xl border border-gold/50 bg-white p-5 dark:bg-neutral-900">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Recipient">
              <input className={inputCls} value={editing.recipient} onChange={(e) => setEditing({ ...editing, recipient: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Street address">
                <input className={inputCls} value={editing.line1} onChange={(e) => setEditing({ ...editing, line1: e.target.value })} />
              </Field>
            </div>
            <Field label="City">
              <input className={inputCls} value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
            </Field>
            <Field label="State">
              <input className={inputCls} value={editing.state} onChange={(e) => setEditing({ ...editing, state: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes (optional)">
                <input className={inputCls} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="e.g. blue gate, ask for mama" />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button disabled={busy} onClick={save} className={btnPrimary}>
              {busy ? <Spinner className="border-ink/30 border-t-ink" /> : 'Save address'}
            </button>
            <button onClick={() => setEditing(null)} className={btnGhost}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {!addresses ? (
          <div className="skeleton h-24 rounded-2xl" />
        ) : addresses.length === 0 && !editing ? (
          <Empty icon={<IcLocation size={26} />} title="No saved addresses" sub="Add a delivery address to speed up checkout." />
        ) : (
          addresses.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-dark dark:text-gold">
                <IcLocation size={18} />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-bold">
                  {a.recipient} {a.is_default ? <span className="ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-black text-gold-dark dark:text-gold">DEFAULT</span> : null}
                </p>
                <p className="text-neutral-500">{a.phone}</p>
                <p className="text-neutral-500">{a.line1}, {a.city} {a.state}</p>
                {a.notes && <p className="text-xs text-neutral-400">{a.notes}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(a)} className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-ink dark:hover:bg-neutral-800" aria-label="Edit">
                  <IcEdit size={16} />
                </button>
                <button onClick={() => remove(a.id)} className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" aria-label="Delete">
                  <IcTrash size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
