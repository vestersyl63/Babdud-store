'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './Providers.jsx';
import { IcCart, IcGrid, IcHome, IcShield, IcUser } from './icons.jsx';

export default function BottomNav() {
  const path = usePathname();
  const { cart, user } = useApp();
  const items = [
    { href: '/', label: 'Home', icon: IcHome, match: (p) => p === '/' },
    { href: '/categories', label: 'Category', icon: IcGrid, match: (p) => p.startsWith('/categor') || p.startsWith('/search') },
    { href: '/cart', label: 'Cart', icon: IcCart, badge: cart.count, match: (p) => p.startsWith('/cart') },
    {
      href: user ? '/account' : '/auth/login',
      label: 'Me',
      icon: IcUser,
      match: (p) => p.startsWith('/account') || p.startsWith('/wishlist') || p.startsWith('/order'),
    },
  ];
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.match(path);
          return (
            <Link
              key={it.label}
              href={it.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition ${
                active ? 'text-gold-dark dark:text-gold' : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              <span className="relative">
                <it.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                {it.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-black text-ink">
                    {it.badge}
                  </span>
                )}
              </span>
              {it.label}
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />}
            </Link>
          );
        })}
        {/* Admin — intentionally smaller & discreet */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold ${
            path.startsWith('/admin') ? 'text-neutral-500 dark:text-neutral-300' : 'text-neutral-400/80 dark:text-neutral-600'
          }`}
        >
          <IcShield size={15} strokeWidth={1.6} />
          Admin
        </Link>
      </div>
    </nav>
  );
}
