'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../../components/Providers.jsx';
import { Empty, StatusBadge, btnPrimary, btnGhost, Spinner } from '../../../components/ui.jsx';
import { IcBank, IcChevL, IcCopy, IcWhatsapp, IcImage, IcAlert } from '../../../components/icons.jsx';
import { fmtDateTime, ORDER_STATUSES } from '../../../lib/util.mjs';

export default function OrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useApp();
  const [data, setData] = useState(null);
  const [bank, setBank] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(async (r) => {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then(setData)
      .catch(() => setNotFound(true));
    fetch('/api/settings/public').then((r) => r.json()).then((d) => setBank(d.bank));
  }, [id]);

  if (notFound)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Empty icon={<IcAlert size={26} />} title="Order not found" sub="This order does not exist or belongs to another account." />
      </div>
    );
  if (!data) return <div className="mx-auto max-w-4xl px-4 py-10"><div className="skeleton h-96 w-full rounded-2xl" /></div>;

  const { order, items } = data;
  const bankReady = bank?.account_number && bank?.bank_name;
  const steps = ORDER_STATUSES.filter((s) => s !== 'Cancelled');
  const stepIdx = steps.indexOf(order.status);

  const confirmPaid = async () => {
    setBusy(true);
    const r = await fetch(`/api/orders/${id}/confirm-payment`, { method: 'POST' });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not confirm', 'err');
    toast('Marked as payment pending — we are verifying your transfer.');
    const fresh = await fetch(`/api/orders/${id}`).then((r2) => r2.json());
    setData(fresh);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-gold-dark dark:hover:text-gold">
        <IcChevL size={16} /> Back
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Order {order.order_no}</h1>
          <p className="text-sm text-neutral-500">{fmtDateTime(order.created_at)} · {order.payment_method === 'bank_transfer' ? 'Bank transfer' : order.payment_method}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* STATUS TIMELINE */}
      {order.status !== 'Cancelled' ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-black ${i <= stepIdx ? 'bg-gold text-ink' : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-700'}`}>
                    {i + 1}
                  </span>
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < stepIdx ? 'bg-gold' : 'bg-neutral-200 dark:bg-neutral-700'}`} />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-bold text-neutral-400 sm:text-[10px]">
            {steps.map((s) => (
              <span key={s} className="w-12 text-center first:text-left last:text-right">{s.replace('Payment ', 'Pay. ')}</span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">This order was cancelled.</p>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-[#F4F1EA] text-neutral-300 dark:bg-neutral-800"><IcImage size={22} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{it.title}</p>
                <p className="text-xs text-neutral-500">₦{it.price.toLocaleString()} × {it.qty}</p>
              </div>
              <p className="font-display text-sm font-bold">₦{(it.price * it.qty).toLocaleString()}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p className="font-bold">Delivery to</p>
            <p className="mt-1 text-neutral-500">
              {order.address ? `${order.address.recipient} · ${order.address.phone} — ${order.address.line1}, ${order.address.city} ${order.address.state}` : 'Address on file'}
            </p>
          </div>
        </div>

        <div className="h-fit space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-semibold">₦{order.subtotal.toLocaleString()}</span></div>
            <div className="mt-1.5 flex justify-between"><span className="text-neutral-500">Delivery</span><span className="font-semibold">{order.delivery_fee ? `₦${order.delivery_fee.toLocaleString()}` : 'Free'}</span></div>
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-display text-base font-bold dark:border-neutral-700"><span>Total</span><span>₦{order.total.toLocaleString()}</span></div>
          </div>

          {/* BANK TRANSFER PANEL */}
          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
            <div className="rounded-2xl bg-ink p-5 text-white dark:bg-black">
              <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-gold">
                <IcBank size={16} /> Pay by bank transfer
              </p>
              {bankReady ? (
                <>
                  <p className="mt-3 text-xs text-neutral-400">Transfer <span className="font-bold text-white">₦{order.total.toLocaleString()}</span> to:</p>
                  <p className="mt-2 font-display font-bold text-gold">{bank.bank_name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-mono text-lg font-bold tracking-wider">{bank.account_number}</p>
                    <button onClick={() => navigator.clipboard?.writeText(bank.account_number).then(() => toast('Copied'))} className="text-neutral-400 hover:text-gold" aria-label="Copy account number">
                      <IcCopy size={15} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-neutral-300">{bank.account_name}</p>
                  {bank.instructions && <p className="mt-3 whitespace-pre-line text-xs text-neutral-400">{bank.instructions}</p>}
                  <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs">
                    Use <span className="font-bold text-gold">{order.order_no}</span> as the transfer reference.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-xs text-neutral-400">
                  Bank details are being set up. You can pay via WhatsApp — quote {order.order_no}.
                </p>
              )}
              {order.status === 'Pending' && (
                <button onClick={confirmPaid} disabled={busy} className={`${btnPrimary} mt-4 w-full`}>
                  {busy ? <Spinner className="border-ink/30 border-t-ink" /> : "I've made the transfer"}
                </button>
              )}
              {order.status === 'Payment Pending' && (
                <p className="mt-4 rounded-lg bg-gold/15 px-3 py-2 text-xs font-semibold text-gold">We are verifying your transfer. Thank you!</p>
              )}
              <a href={`https://wa.me/2347061191218?text=${encodeURIComponent(`Hello BABDUD Culture, I just placed order ${order.order_no}.`)}`} target="_blank" rel="noreferrer" className={`${btnGhost} mt-2 w-full !bg-transparent !text-white !border-neutral-700 hover:!text-gold`}>
                <IcWhatsapp size={16} /> Send receipt on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
