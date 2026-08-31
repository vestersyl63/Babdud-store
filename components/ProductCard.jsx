'use client';
import Link from 'next/link';
import { useApp } from './Providers.jsx';
import { Price, Stars } from './ui.jsx';
import { IcCart, IcHeart, IcImage } from './icons.jsx';
import { discountPct } from '../lib/util.mjs';

export default function ProductCard({ product }) {
  const { addToCart, wish, toggleWish } = useApp();
  const liked = wish.includes(product.id);
  const pct = discountPct(product.price, product.previous_price);
  const out = product.stock <= 0;

  return (
    <div className="group animate-fade-up relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift dark:border-neutral-800 dark:bg-neutral-900">
      <Link href={`/product/${product.slug}`} className="relative block">
        <div className="relative aspect-square w-full overflow-hidden bg-[#F4F1EA] dark:bg-neutral-800">
          {product.images?.[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-neutral-300 dark:text-neutral-600">
              <IcImage size={40} />
            </div>
          )}
          {pct > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[11px] font-black text-ink">
              -{pct}%
            </span>
          )}
          {out && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggleWish(product)}
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full shadow-card transition active:scale-90 ${
          liked ? 'bg-red-500 text-white' : 'bg-white/95 text-neutral-500 hover:text-red-500 dark:bg-neutral-900/95'
        }`}
      >
        <IcHeart size={17} filled={liked} />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {product.category?.name || 'BABDUD'}
        </p>
        <Link href={`/product/${product.slug}`} className="clamp-2 min-h-[2.4em] text-sm font-semibold leading-snug transition hover:text-gold-dark dark:hover:text-gold">
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <Stars rating={product.rating || 0} size={12} />
          <span className="font-semibold">{product.rating || 0}</span>
          <span>({product.review_count || 0})</span>
          {product.sold > 0 && <span className="ml-auto">{product.sold} sold</span>}
        </div>
        <Price price={product.price} previous={product.previous_price} size="sm" />
        {!out && product.stock <= 5 && (
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Only {product.stock} left</p>
        )}
        <button
          disabled={out}
          onClick={() => addToCart(product, 1)}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-ink py-2 text-xs font-bold text-white transition hover:bg-black active:scale-[.96] disabled:pointer-events-none disabled:opacity-40 dark:bg-gold dark:text-ink dark:hover:bg-gold-dark"
        >
          <IcCart size={15} strokeWidth={2.2} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="skeleton aspect-square w-full" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-8 w-full" />
      </div>
    </div>
  );
}
