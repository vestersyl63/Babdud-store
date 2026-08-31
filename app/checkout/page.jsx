'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../components/Providers.jsx';
import { Empty, Field, inputCls, btnPrimary, Spinner } from '../../components/ui.jsx';
import { IcBank, IcCart, IcCopy, IcLocation, IcCheck } from '../../components/icons.jsx';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, refreshCart, toast } = useApp();
  const [settings, setSettings] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [form, setForm] = useState({ recipient: '', phone: '', line1: '', city: '', state: '', notes: '' });
  const [useNew, setUseNew] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) return router.push('/auth/login?next=/checkout');
    fetch('/api/settings/public').then((r) => r.json()).then(setSettings);
    fetch('/api/account').then((r) => r.json()).then((d) => {
      setAddresses(d.addresses || []);
      const def = (d.addresses || [])[0];
      if (def) setAddressId(def.id);
      else setUseNew(true);
    });
  }, [user, router]);

  if (user === undefined) return null;
  const items = cart.items || [];
  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.qty, 0);
  const delivery = settings?.delivery_fee || 0;
  const total = subtotal + delivery;
  const bankReady = settings?.bank?.account_number && settings?.bank?.bank_name;

  const copy = (text) => {
    navigator.clipboard?.writeText(text).then(() => toast('Copied'));
  };

  const placeOrder = async () => {
    setBusy(true);
    const payload = useNew ? { address: form } : { address_id: addressId };
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not place order', 'err');
    refreshCart();
    toast('Order placed!');
    router.push(`/order/${d.order.id}`);
  };

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Empty icon={<IcCart size={26} />} title="Nothing to check out" sub="Your cart is empty." action={<button className={btnPrimary} onClick={() => router.push('/categories')}>Browse products</button>} />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-xl font-bold md:text-2xl">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* ADDRESS */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
              <IcLocation size={16} className="text-gold-dark dark:text-gold" /> Delivery address
            </h2>
            {addresses.length > 0 && (
              <div className="mt-3 space-y-2">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${!useNew && addressId === a.id ? 'border-gold bg-gold/5' : 'border-neutral-200 dark:border-neutral-700'}`}>
                    <input type="radio" name="addr" checked={!useNew && addressId === a.id} onChange={() => { setAddressId(a.id); setUseNew(false); }} className="mt-1 accent-[#C99708]" />
                    <span>
                      <span className="font-bold">{a.recipient}</span> · {a.phone}
                      <br />
                      <span className="text-neutral-500">{a.line1}, {a.city} {a.state}</span>
                    </span>
                  </label>
                ))}
                <button onClick={() => setUseNew(true)} className="text-xs font-bold text-gold-dark dark:text-gold">
                  + Use a new address
                </button>
              </div>
            )}
            {(useNew || addresses.length === 0) && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Recipient name">
                  <input className={inputCls} value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Street address">
                    <input className={inputCls} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House no, street, area" />
                  </Field>
                </div>
                <Field label="City">
                  <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
                <Field label="State">
                  <input className={inputCls} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Oyo" />
                </Field>
              </div>
            )}
          </section>

          {/* PAYMENT */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
              <IcBank size={16} className="text-gold-dark dark:text-gold" /> Payment — Bank Transfer
            </h2>
            {bankReady ? (
              <div className="mt-3 rounded-xl bg-ink p-4 text-white dark:bg-black">
                <p className="text-xs text-neutral-400">Transfer the total amount to:</p>
                <p className="mt-2 font-display text-lg font-bold text-gold">{settings.bank.bank_name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-xl font-bold tracking-wider">{settings.bank.account_number}</p>
                  <button onClick={() => copy(settings.bank.account_number)} className="text-neutral-400 transition hover:text-gold" aria-label="Copy account number">
                    <IcCopy size={16} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-neutral-300">Account name: {settings.bank.account_name}</p>
                {settings.bank.instructions && (
                  <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-neutral-400">{settings.bank.instructions}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Bank transfer details will be shown on your order page. You can also pay via WhatsApp if needed.
              </p>
            )}
            <p className="mt-3 text-xs text-neutral-500">
              After placing the order, quote your order number when transferring.
            </p>
          </section>
        </div>

        {/* SUMMARY */}
        <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider">Order summary</h2>
          <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">
                  {i.product?.name} <span className="text-neutral-400">×{i.qty}</span>
                </span>
                <span className="shrink-0 font-semibold">₦{((i.product?.price || 0) * i.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-700">
            <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-semibold">₦{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span className="font-semibold">{delivery ? `₦${delivery.toLocaleString()}` : 'Free'}</span></div>
            <div className="flex justify-between pt-1 font-display text-base font-bold"><span>Total</span><span>₦{total.toLocaleString()}</span></div>
          </div>
          <button disabled={busy} onClick={placeOrder} className={`${btnPrimary} mt-4 w-full`}>
            {busy ? <Spinner className="border-ink/30 border-t-ink" /> : <IcCheck size={17} strokeWidth={2.4} />} Place order
          </button>
        </div>
      </div>
    </div>
  );
}
