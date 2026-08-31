'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Empty, StatusBadge, btnPrimary } from '../../../components/ui.jsx';
import { IcPackage, IcChevR } from '../../../components/icons.jsx';
import { fmtDateTime } from '../../../lib/util.mjs';

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    fetch('/api/orders').then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, []);

  return (
    <div>
      <h1 className="font-display text-lg font-bold">Order history</h1>
      {!orders ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-4">
          <Empty
            icon={<IcPackage size={26} />}
            title="No orders yet"
            sub="When you place orders, they will show up here with live status."
            action={
              <Link href="/categories" className={btnPrimary}>
                Start shopping
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/order/${o.id}`}
              className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-gold hover:shadow-card dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold">{o.order_no}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {fmtDateTime(o.created_at)} · {o.item_count} item(s) · Bank transfer
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold">₦{o.total.toLocaleString()}</p>
                <StatusBadge status={o.status} />
              </div>
              <IcChevR size={16} className="shrink-0 text-neutral-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
