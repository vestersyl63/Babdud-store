'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../components/Providers.jsx';
import { Spinner } from '../../components/ui.jsx';
import { IcPackage, IcHeart, IcLocation, IcSettings, IcUser } from '../../components/icons.jsx';

const tabs = [
  { href: '/account', label: 'Profile', icon: IcUser, exact: true },
  { href: '/account/orders', label: 'Orders', icon: IcPackage },
  { href: '/wishlist', label: 'Wishlist', icon: IcHeart },
  { href: '/account/addresses', label: 'Addresses', icon: IcLocation },
  { href: '/account/settings', label: 'Settings', icon: IcSettings },
];

export default function AccountLayout({ children }) {
  const { user } = useApp();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (user === null) router.push('/auth/login?next=' + encodeURIComponent(path));
  }, [user, router, path]);

  if (user === undefined)
    return (
      <div className="grid h-64 place-items-center">
        <Spinner />
      </div>
    );
  if (user === null) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <aside>
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-gold" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold font-display text-lg font-bold text-ink">
                {(user.username || '?')[0].toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold">{user.username}</p>
              <p className="truncate text-xs text-neutral-500">{user.phone || 'Google account'}</p>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-2 overflow-x-auto md:flex-col">
            {tabs.map((t) => {
              const active = t.exact ? path === t.href : path.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-ink text-white dark:bg-gold dark:text-ink'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  <t.icon size={17} /> {t.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
