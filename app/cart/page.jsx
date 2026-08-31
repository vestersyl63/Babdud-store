'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '../../components/Providers.jsx';
import { Empty, Qty, btnPrimary, btnGhost } from '../../components/ui.jsx';
import { IcCart, IcTrash, IcImage } from '../../components/icons.jsx';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { cart, user, refreshCart, toast } = useApp();
  const items = cart.items || [];
  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.qty, 0);

  const updateQty = async (pid, qty) => {
    if (!user) {
      const local = JSON.parse(localStorage.getItem('bc_cart') || '[]');
      const it = local.find((i) => i.product_id === pid);
      if (it) it.qty = Math.max(1, qty);
      localStorage.setItem('bc_cart', JSON.stringify(local));
      refreshCart();
      return;
    }
    await fetch('/api/cart', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: pid, qty }) });
    refreshCart();
  };

  const remove = async (pid) => {
    if (!user) {
      const local = JSON.parse(localStorage.getItem('bc_cart') || '[]').filter((i) => i.product_id !== pid);
      localStorage.setItem('bc_cart', JSON.stringify(local));
      refreshCart();
      return;
    }
    await fetch(`/api/cart?product_id=${pid}`, { method: 'DELETE' });
    refreshCart();
    toast('Removed from cart');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-xl font-bold md:text-2xl">Your cart</h1>
      {items.length === 0 ? (
        <Empty
          icon={<IcCart size={26} />}
          title="Your cart is empty"
          sub="Browse the collection and add something beautiful."
          action={
            <Link href="/categories" className={btnPrimary}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            {items.map((i) => (
              <div key={i.product_id} className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <Link href={`/product/${i.product?.slug || ''}`} className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#F4F1EA] dark:bg-neutral-800">
                  {i.product?.image ? (
                    <img src={i.product.image} alt={i.product.name} className="h-full w-full object-contain" />
                  ) : (
                    <IcImage size={26} className="text-neutral-300" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/product/${i.product?.slug || ''}`} className="clamp-2 text-sm font-semibold hover:text-gold-dark dark:hover:text-gold">
                      {i.product?.name}
                    </Link>
                    <button onClick={() => remove(i.product_id)} className="text-neutral-400 transition hover:text-red-500" aria-label="Remove">
                      <IcTrash size={17} />
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">₦{Number(i.product?.price || 0).toLocaleString()} each</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <Qty small qty={i.qty} setQty={(q) => updateQty(i.product_id, q)} max={Math.max(1, i.product?.stock || 99)} />
                    <p className="font-display text-sm font-bold">₦{(i.product?.price || 0) * i.qty ? ((i.product?.price || 0) * i.qty).toLocaleString() : 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider">Summary</h2>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-bold">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-sm">
              <span className="text-neutral-500">Delivery</span>
              <span className="text-xs text-neutral-400">confirmed on order</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
              <span className="font-bold">Total</span>
              <span className="font-display font-bold">₦{subtotal.toLocaleString()}</span>
            </div>
            <button
              onClick={() => router.push(user ? '/checkout' : '/auth/login?next=/checkout')}
              className={`${btnPrimary} mt-4 w-full`}
            >
              Proceed to checkout
            </button>
            <Link href="/categories" className={`${btnGhost} mt-2 w-full`}>
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
