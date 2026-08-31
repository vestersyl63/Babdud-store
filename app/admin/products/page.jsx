'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { btnPrimary, btnGhost, Empty } from '../../../components/ui.jsx';
import { IcPlus, IcEdit, IcTrash, IcPackage, IcImage } from '../../../components/icons.jsx';
import { useApp } from '../../../components/Providers.jsx';

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const { toast } = useApp();

  const load = () => fetch('/api/admin/products').then((r) => r.json()).then((d) => setProducts(d.products || []));
  useEffect(() => {
    load();
  }, []);

  const remove = async (p) => {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    const r = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    if (!r.ok) return toast('Could not delete product', 'err');
    toast('Product deleted');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold">Products</h1>
        <Link href="/admin/products/new" className={btnPrimary}>
          <IcPlus size={16} /> Add product
        </Link>
      </div>

      {!products ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="mt-4">
          <Empty
            icon={<IcPackage size={26} />}
            title="No products yet"
            sub="Add your first product with photos from your phone or computer."
            action={
              <Link href="/admin/products/new" className={btnPrimary}>
                <IcPlus size={16} /> Add product
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F4F1EA] dark:bg-neutral-800">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt="" className="h-full w-full object-contain" />
                ) : (
                  <IcImage size={22} className="text-neutral-300" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{p.name}</p>
                <p className="text-xs text-neutral-500">
                  {p.category?.name || 'Uncategorised'} · ₦{p.price.toLocaleString()} · stock {p.stock} · sold {p.sold}
                </p>
                {!p.active && <span className="text-[10px] font-black text-red-500">HIDDEN</span>}
              </div>
              <Link href={`/admin/products/${p.id}/edit`} className={`${btnGhost} !px-3 !py-2`} aria-label="Edit">
                <IcEdit size={15} />
              </Link>
              <button onClick={() => remove(p)} className="grid h-9 w-9 place-items-center rounded-xl text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" aria-label="Delete">
                <IcTrash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
