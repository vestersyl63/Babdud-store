'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../components/Providers.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import { Empty, btnPrimary } from '../../components/ui.jsx';
import { IcHeart } from '../../components/icons.jsx';

export default function WishlistPage() {
  const { user, wish } = useApp();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    if (user) {
      fetch('/api/likes').then((r) => r.json()).then((d) => setProducts(d.products || []));
    } else {
      // guest wishlist from localStorage
      fetch('/api/products?sort=new&limit=200')
        .then((r) => r.json())
        .then((d) => setProducts((d.products || []).filter((p) => wish.includes(p.id))));
    }
  }, [user, wish]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-display text-xl font-bold md:text-2xl">My wishlist</h1>
      {!products ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Empty
          icon={<IcHeart size={26} />}
          title="Your wishlist is empty"
          sub="Tap the heart on any product to save it here for later."
          action={
            <Link href="/categories" className={btnPrimary}>
              Discover products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
