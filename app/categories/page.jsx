'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Empty } from '../../components/ui.jsx';
import { IcChevR, IcGrid } from '../../components/icons.jsx';

export default function CategoriesPage() {
  const [cats, setCats] = useState(null);
  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCats(d.categories || []));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-xl font-bold md:text-2xl">Categories</h1>
      <p className="mb-6 text-sm text-neutral-500">Browse the collection by style</p>
      {!cats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : cats.length === 0 ? (
        <Empty icon={<IcGrid size={26} />} title="No categories yet" sub="Categories will appear here once the store is set up." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lift dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div>
                <p className="font-display font-bold">{c.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{c.blurb || `${c.count} product(s)`}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gold-dark dark:text-gold">
                  {c.count} item(s)
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-400 transition group-hover:bg-gold group-hover:text-ink dark:bg-neutral-800">
                <IcChevR size={18} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
