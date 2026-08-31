'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge, Empty } from '../../../components/ui.jsx';
import { IcBag } from '../../../components/icons.jsx';
import { fmtDateTime, ORDER_STATUSES } from '../../../lib/util.mjs';

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch(`/api/admin/orders${filter ? `?status=${encodeURIComponent(filter)}` : ''}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, [filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-lg font-bold">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-900">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {!orders ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="mt-4">
          <Empty icon={<IcBag size={26} />} title="No orders" sub="Customer orders will appear here for processing." />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[640px] bg-white text-sm dark:bg-neutral-900">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-700">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {orders.map((o) => (
                <tr key={o.id} className="transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-bold hover:text-gold-dark dark:hover:text-gold">{o.order_no}</Link>
                  </td>
                  <td className="px-4 py-3">{o.username || '—'}<br /><span className="text-xs text-neutral-500">{o.phone}</span></td>
                  <td className="px-4 py-3 font-semibold">₦{o.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-neutral-500">{fmtDateTime(o.created_at)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
