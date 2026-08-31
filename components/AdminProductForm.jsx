'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field, inputCls, btnPrimary, btnGhost, Spinner } from './ui.jsx';
import { IcUpload, IcX, IcStar, IcImage } from './icons.jsx';
import { useApp } from './Providers.jsx';

export default function AdminProductForm({ initial, editing }) {
  const router = useRouter();
  const { toast } = useApp();
  const [form, setForm] = useState(
    initial || {
      name: '',
      description: '',
      price: '',
      previous_price: '',
      stock: '',
      category_id: '',
      specs: '',
      variations: '',
      active: true,
      images: [],
    }
  );
  const [cats, setCats] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCats(d.categories || []));
  }, []);

  const onFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setUploading(true);
    for (const f of list) {
      const fd = new FormData();
      fd.append('image', f);
      try {
        const r = await fetch('/api/upload?scope=product', { method: 'POST', body: fd });
        const d = await r.json();
        if (r.ok) setForm((s) => ({ ...s, images: [...s.images, d.url] }));
        else toast(d.error || 'Upload failed', 'err');
      } catch {
        toast('Upload failed', 'err');
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
      price: Number(form.price),
      previous_price: form.previous_price ? Number(form.previous_price) : null,
      stock: Number(form.stock) || 0,
    };
    const r = await fetch(editing ? `/api/admin/products/${editing}` : '/api/admin/products', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not save product', 'err');
    toast(editing ? 'Product updated' : 'Product published!');
    router.push('/admin/products');
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Product information</h2>
          <div className="mt-4 space-y-4">
            <Field label="Product name">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Description">
              <textarea rows={5} className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Fabric, dye method, size, care instructions…" />
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Price (₦)">
                <input className={inputCls} type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </Field>
              <Field label="Was (₦)">
                <input className={inputCls} type="number" min="0" value={form.previous_price || ''} onChange={(e) => setForm({ ...form, previous_price: e.target.value })} placeholder="optional" />
              </Field>
              <Field label="Stock">
                <input className={inputCls} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </Field>
              <Field label="Category">
                <select className={inputCls} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">—</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Specifications (one per line, “Key: value”)">
              <textarea rows={3} className={inputCls} value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} placeholder={'Material: 100% cotton\nSize: 5 yards'} />
            </Field>
            <Field label="Variations (one per line, “Name: opt1, opt2”)">
              <textarea rows={2} className={inputCls} value={form.variations} onChange={(e) => setForm({ ...form, variations: e.target.value })} placeholder="Size: M, L, XL" />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-[#C99708]" />
              Visible in store
            </label>
          </div>
        </div>
      </div>

      {/* IMAGES */}
      <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider">Photos</h2>
        <p className="mt-1 text-xs text-neutral-500">Upload from your phone gallery or computer. First photo is the cover.</p>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={`${btnGhost} mt-3 w-full border-dashed`}>
          {uploading ? <Spinner /> : <IcUpload size={16} />} {uploading ? 'Uploading…' : 'Choose images'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {form.images.map((url, i) => (
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-[#F4F1EA] dark:border-neutral-700 dark:bg-neutral-800">
              <img src={url} alt="" className="h-full w-full object-contain" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-black text-ink">COVER</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-ink/70 py-1 opacity-0 transition group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    title="Make cover"
                    onClick={() => setForm((s) => ({ ...s, images: [url, ...s.images.filter((u) => u !== url)] }))}
                    className="grid h-6 w-6 place-items-center rounded-md bg-white/20 text-white hover:bg-gold hover:text-ink"
                  >
                    <IcStar size={12} />
                  </button>
                )}
                <button
                  type="button"
                  title="Remove"
                  onClick={() => setForm((s) => ({ ...s, images: s.images.filter((u, j) => !(u === url && j === i)) }))}
                  className="grid h-6 w-6 place-items-center rounded-md bg-white/20 text-white hover:bg-red-500"
                >
                  <IcX size={12} />
                </button>
              </div>
            </div>
          ))}
          {form.images.length === 0 && (
            <div className="col-span-3 grid aspect-video place-items-center rounded-xl border border-dashed border-neutral-300 text-neutral-400 dark:border-neutral-700">
              <IcImage size={28} />
            </div>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <button disabled={busy || uploading} className={`${btnPrimary} flex-1`}>
            {busy ? <Spinner className="border-ink/30 border-t-ink" /> : editing ? 'Save changes' : 'Publish product'}
          </button>
          <button type="button" onClick={() => router.back()} className={btnGhost}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
