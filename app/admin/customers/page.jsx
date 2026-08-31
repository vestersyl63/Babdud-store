'use client';
import { useEffect, useState } from 'react';
import { Empty } from '../../../components/ui.jsx';
import { IcUser } from '../../../components/icons.jsx';
import { fmtDate } from '../../../lib/util.mjs';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null);
  useEffect(() => {
    fetch('/api/admin/customers').then((r) => r.json()).then((d) => setCustomers(d.customers || []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-lg font-bold">Customers</h1>
      {!customers ? (
        <div className="mt-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
      ) : customers.length === 0 ? (
        <div className="mt-4">
          <Empty icon={<IcUser size={26} />} title="No customers yet" sub="Registered customers will appear here." />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[560px] bg-white text-sm dark:bg-neutral-900">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-neutral-500 dark:border-neutral-700">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">
                    <span className="flex items-center gap-2">
                      {c.avatar ? <img src={c.avatar} className="h-7 w-7 rounded-full object-cover" alt="" /> : (
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/20 text-xs font-black text-gold-dark dark:text-gold">
                          {(c.username || '?')[0].toUpperCase()}
                        </span>
                      )}
                      {c.username}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.phone || <span className="text-neutral-400">Google</span>}</td>
                  <td className="px-4 py-3 text-neutral-500">{fmtDate(c.created_at)}</td>
                  <td className="px-4 py-3 font-semibold">{c.order_count}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
