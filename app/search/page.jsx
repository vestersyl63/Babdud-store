'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardSkeleton } from '../../components/ProductCard.jsx';
import { Empty } from '../../components/ui.jsx';
import { IcSearch } from '../../components/icons.jsx';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><div className="skeleton h-96 w-full rounded-2xl" /></div>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const sp = useSearchParams();
  const q = sp.get('q') || '';
  const [sort, setSort] = useState('new');
  const [products, setProducts] = useState(null);

  useEffect(() => {
    setProducts(null);
    fetch(`/api/products?q=${encodeURIComponent(q)}&sort=${sort}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, [q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold md:text-2xl">
            {q ? `Results for “${q}”` : 'All products'}
          </h1>
          <p className="text-sm text-neutral-500">{products ? `${products.length} item(s)` : 'Searching…'}</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-gold dark:border-neutral-700 dark:bg-neutral-900"
          aria-label="Sort products"
        >
          <option value="new">Newest</option>
          <option value="bestselling">Best selling</option>
          <option value="rating">Top rated</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
      </div>

      {!products ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Empty
          icon={<IcSearch size={26} />}
          title={`No results${q ? ` for “${q}”` : ' yet'}`}
          sub="Try a different keyword, or browse by category. New pieces are added regularly."
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
