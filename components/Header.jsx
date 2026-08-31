'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useApp } from './Providers.jsx';
import { IcCart, IcHeart, IcSearch, IcUser } from './icons.jsx';

function SearchBox({ compact }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [sugs, setSugs] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) return setSugs([]);
      try {
        const r = await fetch(`/api/products?q=${encodeURIComponent(q)}&suggest=1`);
        const d = await r.json();
        setSugs(d.products || []);
        setOpen(true);
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={boxRef} className={`relative ${compact ? '' : 'w-full'}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
        className="relative"
        role="search"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search adire, bubu, fabrics…"
          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 pl-4 pr-11 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg bg-gold text-ink transition active:scale-90"
          aria-label="Search"
        >
          <IcSearch size={17} strokeWidth={2.2} />
        </button>
      </form>
      {open && sugs.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lift dark:border-neutral-700 dark:bg-neutral-900">
          {sugs.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                {p.image ? (
                  <img src={p.image} alt="" className="h-full w-full object-contain" />
                ) : (
                  <IcSearch size={14} className="text-neutral-400" />
                )}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
              <span className="shrink-0 text-xs font-bold text-gold-dark dark:text-gold">
                ₦{p.price.toLocaleString()}
              </span>
            </Link>
          ))}
          <button
            className="block w-full px-3 py-2.5 text-left text-xs font-bold text-gold-dark transition hover:bg-neutral-50 dark:text-gold dark:hover:bg-neutral-800"
            onClick={() => {
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            See all results for “{q}”
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { cart, user } = useApp();
  return (
    <header className="sticky top-0 z-40 bg-ink shadow-md dark:bg-black">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-3 md:h-16 md:gap-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="BABDUD Culture home">
            <img
              src="/brand/logo.jpg"
              alt="BABDUD Culture — a.k.a Babadud Aladire"
              className="h-10 w-auto rounded-md md:h-11"
            />
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-semibold text-neutral-300 lg:flex">
            <Link href="/" className="transition hover:text-gold">
              Home
            </Link>
            <Link href="/categories" className="transition hover:text-gold">
              Categories
            </Link>
          </nav>

          <div className="hidden flex-1 md:block md:max-w-xl">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2">
            <Link
              href={user ? '/wishlist' : '/auth/login?next=/wishlist'}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-neutral-300 transition hover:bg-neutral-800 hover:text-gold"
              aria-label="Wishlist"
            >
              <IcHeart size={20} />
            </Link>
            <Link
              href={user ? '/account' : '/auth/login'}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-neutral-300 transition hover:bg-neutral-800 hover:text-gold"
              aria-label="Account"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-gold" />
              ) : (
                <IcUser size={20} />
              )}
            </Link>
            <Link
              href="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-neutral-300 transition hover:bg-neutral-800 hover:text-gold"
              aria-label="Cart"
            >
              <IcCart size={20} />
              {cart.count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-black text-ink">
                  {cart.count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="pb-3 md:hidden">
          <SearchBox compact />
        </div>
      </div>
    </header>
  );
}
