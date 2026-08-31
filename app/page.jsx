'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx';
import { Empty } from '../components/ui.jsx';
import { IcBank, IcPackage, IcWhatsapp, IcCheck, IcChevR } from '../components/icons.jsx';

export default function Home() {
  const [cats, setCats] = useState(null);
  const [fresh, setFresh] = useState(null);
  const [best, setBest] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCats(d.categories || []));
    fetch('/api/products?sort=new&limit=10').then((r) => r.json()).then((d) => setFresh(d.products || []));
    fetch('/api/products?sort=bestselling&limit=4').then((r) => r.json()).then((d) => setBest(d.products || []));
    fetch('/api/settings/public').then((r) => r.json()).then((d) => setAnnouncement(d.announcement || ''));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="bg-ink text-white dark:bg-black">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
          <div className="animate-fade-up order-2 md:order-1">
            {announcement && (
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                {announcement}
              </p>
            )}
            <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
              Authentic <span className="text-gold">Adire</span>, woven with heritage.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-300 md:text-base">
              Hand-dyed fabrics, bubu, caftan and ready-to-wear styles from Abeokuta — the home of adire. Order with a
              simple bank transfer, delivered to your door.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold-dark active:scale-[.97]"
              >
                Shop the collection <IcChevR size={16} strokeWidth={2.4} />
              </Link>
              <a
                href="https://wa.me/2347061191218"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-gold hover:text-gold"
              >
                <IcWhatsapp size={17} /> Chat on WhatsApp
              </a>
            </div>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-500">
              Promoting the beauty in tradition
            </p>
          </div>
          <div className="order-1 flex justify-center md:order-2">
            <img
              src="/brand/logo.jpg"
              alt="BABDUD Culture — a.k.a Babadud Aladire"
              className="w-56 rounded-2xl shadow-lift ring-1 ring-gold/30 md:w-80"
            />
          </div>
        </div>
      </section>

      {/* CATEGORY CHIPS */}
      <section className="mx-auto max-w-7xl px-4 pt-8">
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
          {(cats || []).map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold transition hover:border-gold hover:text-gold-dark dark:border-neutral-700 dark:bg-neutral-900 dark:hover:text-gold"
            >
              {c.name}
              <span className="ml-1.5 text-neutral-400">{c.count}</span>
            </Link>
          ))}
          {!cats && <span className="skeleton h-9 w-64 shrink-0 rounded-full" />}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 pt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold md:text-2xl">New arrivals</h2>
            <p className="text-sm text-neutral-500">Fresh from the dye pots</p>
          </div>
          <Link href="/search?q=" className="text-sm font-bold text-gold-dark transition hover:underline dark:text-gold">
            View all
          </Link>
        </div>
        {!fresh ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : fresh.length === 0 ? (
          <Empty
            title="The store is being stocked"
            sub="Our catalogue is on its way — new adire pieces are being photographed and uploaded. Chat with us on WhatsApp for available pieces in the meantime."
            action={
              <a
                href="https://wa.me/2347061191218"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-gold-dark"
              >
                <IcWhatsapp size={16} /> Ask on WhatsApp
              </a>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* BEST SELLERS */}
      {best && best.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12">
          <h2 className="mb-4 font-display text-xl font-bold md:text-2xl">Best sellers</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-3 md:gap-6">
          {[
            { icon: IcBank, t: 'Pay by bank transfer', s: 'Simple transfer to our account — details shown at checkout.' },
            { icon: IcPackage, t: 'Nationwide delivery', s: 'We ship adire anywhere in Nigeria, carefully packaged.' },
            { icon: IcCheck, t: 'Authentic craftsmanship', s: 'Genuine hand-made adire from Abeokuta dyers.' },
          ].map((v) => (
            <div key={v.t} className="flex items-start gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-dark dark:text-gold">
                <v.icon size={22} />
              </span>
              <div>
                <p className="font-display text-sm font-bold">{v.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{v.s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
