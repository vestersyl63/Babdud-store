'use client';
import { useEffect, useState } from 'react';
import { Field, inputCls, btnPrimary, btnGhost } from '../../../components/ui.jsx';
import { useApp } from '../../../components/Providers.jsx';
import { IcPlus, IcTrash, IcEdit } from '../../../components/icons.jsx';

export default function AdminCategories() {
  const { toast } = useApp();
  const [cats, setCats] = useState(null);
  const [name, setName] = useState('');
  const [blurb, setBlurb] = useState('');
  const [editing, setEditing] = useState(null);

  const load = () => fetch('/api/categories').then((r) => r.json()).then((d) => setCats(d.categories || []));
  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/admin/categories', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, name, blurb } : { name, blurb }),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.error || 'Could not save', 'err');
    toast(editing ? 'Category updated' : 'Category created');
    setName('');
    setBlurb('');
    setEditing(null);
    load();
  };

  const remove = async (c) => {
    if (!confirm(`Delete category “${c.name}”?`)) return;
    const r = await fetch(`/api/admin/categories?id=${c.id}`, { method: 'DELETE' });
    const d = await r.json();
    if (!r.ok) return toast(d.error || 'Could not delete', 'err');
    toast('Category deleted');
    load();
  };

  return (
    <div>
      <h1 className="font-display text-lg font-bold">Categories</h1>
      <form onSubmit={save} className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
          <Field label="Name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Short description">
            <input className={inputCls} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <button className={btnPrimary}>
              <IcPlus size={15} /> {editing ? 'Update' : 'Add'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setName(''); setBlurb(''); }} className={`${btnGhost} ml-2`}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {(cats || []).map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{c.name}</p>
              <p className="text-xs text-neutral-500">{c.blurb || '—'} · {c.count} product(s)</p>
            </div>
            <button
              onClick={() => { setEditing(c); setName(c.name); setBlurb(c.blurb || ''); }}
              className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-ink dark:hover:bg-neutral-800"
              aria-label="Edit"
            >
              <IcEdit size={15} />
            </button>
            <button onClick={() => remove(c)} className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" aria-label="Delete">
              <IcTrash size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
