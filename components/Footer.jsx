'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IcPhone, IcTiktok, IcWhatsapp } from './icons.jsx';

const CONTACT = {
  phoneDisplay: '07061191218',
  phoneIntl: '2347061191218',
  tiktokHandle: '@babdud_cultureqshow',
  tiktokName: 'babadudu aladire',
};

export default function Footer() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCats(d.categories || []))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-14 bg-ink pb-24 text-neutral-300 dark:bg-black md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <img src="/brand/logo.jpg" alt="BABDUD Culture logo" className="h-24 w-auto rounded-lg" />
          <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-gold">
            Promoting the beauty in tradition
          </p>
          <p className="mt-2 text-xs text-neutral-400">A.K.A BABADUDU ALADIRE</p>
        </div>

        {/* Shop */}
        <div>
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">Shop</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/categories" className="transition hover:text-gold">
                All Categories
              </Link>
            </li>
            {cats.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="transition hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search?q=" className="transition hover:text-gold">
                Search the store
              </Link>
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">Account</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/account" className="transition hover:text-gold">
                My Account
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="transition hover:text-gold">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="transition hover:text-gold">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-gold">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact — exact details from the brand card */}
        <div>
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">
            {CONTACT.tiktokName}
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={`https://wa.me/${CONTACT.phoneIntl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition hover:text-gold"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                  <IcWhatsapp size={18} />
                </span>
                WhatsApp · {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phoneDisplay}`} className="flex items-center gap-3 transition hover:text-gold">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                  <IcPhone size={18} />
                </span>
                Call · {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`https://www.tiktok.com/${CONTACT.tiktokHandle}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition hover:text-gold"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold">
                  <IcTiktok size={18} />
                </span>
                TikTok · {CONTACT.tiktokHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-neutral-500 md:flex-row">
          <p>© {new Date().getFullYear()} BABDUD CULTURE · A.K.A BABADUDU ALADIRE</p>
          <p className="uppercase tracking-[0.25em]">Promoting the beauty in tradition</p>
        </div>
      </div>
    </footer>
  );
}
