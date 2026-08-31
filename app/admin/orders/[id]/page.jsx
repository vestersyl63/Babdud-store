'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StatusBadge, Field, inputCls, btnPrimary } from '../../../../components/ui.jsx';
import { useApp } from '../../../../components/Providers.jsx';
import { fmtDateTime, ORDER_STATUSES } from '../../../../lib/util.mjs';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { toast } = useApp();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`).then((r) => r.json()).then((d) => {
      setData(d);
      setStatus(d.order.status);
    });
  }, [id]);

  if (!data) return <div className="skeleton h-96 rounded-2xl" />;
  const { order, items } = data;

  const save = async () => {
    const r = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.error || 'Could not update', 'err');
    toast('Order status updated');
    const fresh = await fetch(`/api/admin/orders/${id}`).then((r2) => r2.json());
    setData(fresh);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold">{order.order_no}</h1>
          <p className="text-sm text-neutral-500">{fmtDateTime(order.created_at)} · {order.username || '—'} · {order.phone}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Items</h2>
          <div className="mt-3 divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between gap-3 py-2.5">
                <span>{it.title} <span className="text-neutral-400">×{it.qty}</span></span>
                <span className="font-semibold">₦{(it.price * it.qty).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-2.5 text-neutral-500">
              <span>Delivery</span>
              <span>{order.delivery_fee ? `₦${order.delivery_fee.toLocaleString()}` : 'Free'}</span>
            </div>
            <div className="flex justify-between py-2.5 font-display font-bold">
              <span>Total</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
          {order.address && (
            <>
              <h2 className="mt-4 font-display text-sm font-bold uppercase tracking-wider">Delivery address</h2>
              <p className="mt-2 text-sm text-neutral-500">
                {order.address.recipient} · {order.address.phone}
                <br />
                {order.address.line1}, {order.address.city} {order.address.state}
                {order.address.notes ? <><br />{order.address.notes}</> : null}
              </p>
            </>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Update status</h2>
          <div className="mt-3 space-y-3">
            <Field label="Order status">
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <button onClick={save} className={`${btnPrimary} w-full`}>Save status</button>
            <p className="text-xs text-neutral-500">Payment method: bank transfer. Confirm the transfer in your bank app before marking “Payment Confirmed”.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
