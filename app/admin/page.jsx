'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '../../components/ui.jsx';
import { useApp } from '../../components/Providers.jsx';
import { IcPackage, IcBag, IcUser, IcBank, IcAlert, IcCheck, IcTrash, IcStar, IcChat } from '../../components/icons.jsx';
import { fmtDateTime } from '../../lib/util.mjs';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [mod, setMod] = useState(null);
  const { toast } = useApp();

  const loadMod = () => fetch('/api/admin/moderate').then((r) => r.json()).then(setMod);
  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setData);
    loadMod();
  }, []);

  const removeMod = async (kind, id) => {
    if (!confirm('Delete this item?')) return;
    const r = await fetch(`/api/admin/moderate/${kind}/${id}`, { method: 'DELETE' });
    if (!r.ok) return toast('Could not delete', 'err');
    toast('Deleted');
    loadMod();
  };

  if (!data) return <div className="skeleton h-96 rounded-2xl" />;
  const { stats, recent, lowStock } = data;

  const cards = [
    { label: 'Total products', value: stats.products, icon: IcPackage },
    { label: 'Total orders', value: stats.orders, icon: IcBag },
    { label: 'Pending orders', value: stats.pending, icon: IcAlert },
    { label: 'Delivered', value: stats.completed, icon: IcCheck },
    { label: 'Customers', value: stats.customers, icon: IcUser },
    { label: 'Revenue', value: `₦${stats.revenue.toLocaleString()}`, icon: IcBank },
  ];

  return (
    <div>
      <h1 className="font-display text-lg font-bold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/15 text-gold-dark dark:text-gold">
              <c.icon size={18} />
            </span>
            <p className="mt-3 font-display text-xl font-bold">{c.value}</p>
            <p className="text-xs text-neutral-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* MODERATION */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider">Moderation</h2>
        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold text-neutral-500">REVIEWS</p>
            {!mod || (mod.reviews || []).length === 0 ? (
              <p className="text-sm text-neutral-500">No reviews yet.</p>
            ) : (
              <div className="space-y-2">
                {mod.reviews.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800/60">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-bold">
                        {r.username}
                        <span className="flex text-gold">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <IcStar key={i} size={11} />
                          ))}
                        </span>
                      </p>
                      <p className="truncate text-xs text-neutral-500">{r.product}</p>
                      {r.body && <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{r.body}</p>}
                    </div>
                    <button onClick={() => removeMod('review', r.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" aria-label="Delete review">
                      <IcTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold text-neutral-500">COMMENTS</p>
            {!mod || (mod.comments || []).length === 0 ? (
              <p className="text-sm text-neutral-500">No comments yet.</p>
            ) : (
              <div className="space-y-2">
                {mod.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800/60">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-bold">
                        <IcChat size={13} className="text-neutral-400" /> {c.username}
                      </p>
                      <p className="truncate text-xs text-neutral-500">{c.product}</p>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{c.body}</p>
                    </div>
                    <button onClick={() => removeMod('comment', c.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30" aria-label="Delete comment">
                      <IcTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-gold-dark hover:underline dark:text-gold">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No orders yet — they will appear here as customers shop.</p>
          ) : (
            <div className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
              {recent.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-3 py-2.5 text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{o.order_no}</p>
                    <p className="text-xs text-neutral-500">{o.username || o.phone || 'Guest'} · {fmtDateTime(o.created_at)}</p>
                  </div>
                  <p className="font-semibold">₦{o.total.toLocaleString()}</p>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Low stock</h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">All products are well stocked.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {lowStock.map((p) => (
                <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 text-sm transition hover:bg-neutral-100 dark:bg-neutral-800/60 dark:hover:bg-neutral-800">
                  <span className="truncate font-semibold">{p.name}</span>
                  <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${p.stock === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                    {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
