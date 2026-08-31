'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard, { ProductCardSkeleton } from '../../../components/ProductCard.jsx';
import { Empty } from '../../../components/ui.jsx';
import { IcGrid } from '../../../components/icons.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState(null);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCats(d.categories || []));
    setProducts(null);
    fetch(`/api/products?category=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, [slug]);

  const cat = cats.find((c) => c.slug === slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <a
            key={c.id}
            href={`/category/${c.slug}`}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              c.slug === slug
                ? 'bg-ink text-white dark:bg-gold dark:text-ink'
                : 'border border-neutral-200 bg-white text-neutral-600 hover:border-gold dark:border-neutral-700 dark:bg-neutral-900'
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>
      <h1 className="font-display text-xl font-bold md:text-2xl">{cat?.name || 'Category'}</h1>
      <p className="mb-6 text-sm text-neutral-500">{cat?.blurb || ''}</p>

      {!products ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Empty
          icon={<IcGrid size={26} />}
          title="Nothing here yet"
          sub="Products in this category are being uploaded. Check back soon or ask us on WhatsApp."
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
