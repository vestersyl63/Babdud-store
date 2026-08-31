'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Spinner } from '../../components/ui.jsx';
import {
  IcGrid, IcPackage, IcBag, IcUser, IcSettings, IcLogout, IcHome, IcShield,
} from '../../components/icons.jsx';

const links = [
  { href: '/admin', label: 'Dashboard', icon: IcGrid, exact: true },
  { href: '/admin/products', label: 'Products', icon: IcPackage },
  { href: '/admin/orders', label: 'Orders', icon: IcBag },
  { href: '/admin/customers', label: 'Customers', icon: IcUser },
  { href: '/admin/categories', label: 'Categories', icon: IcGrid },
  { href: '/admin/settings', label: 'Settings', icon: IcSettings },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const path = usePathname();
  const [state, setState] = useState('loading'); // loading | ok | denied

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => setState(d.admin ? 'ok' : 'denied'));
  }, [path]);

  useEffect(() => {
    if (state === 'denied' && !path.startsWith('/admin/login')) router.replace('/admin/login');
  }, [state, path, router]);

  if (path.startsWith('/admin/login')) return <>{children}</>;

  if (state !== 'ok')
    return (
      <div className="grid h-64 place-items-center">
        <Spinner />
      </div>
    );

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-neutral-500">
          <IcShield size={16} className="text-gold-dark dark:text-gold" /> Admin panel
        </p>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold transition hover:border-gold dark:border-neutral-700">
            <span className="inline-flex items-center gap-1"><IcHome size={13} /> View store</span>
          </Link>
          <button onClick={logout} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:border-red-300 dark:border-neutral-700">
            <span className="inline-flex items-center gap-1"><IcLogout size={13} /> Log out</span>
          </button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
          {links.map((l) => {
            const active = l.exact ? path === l.href : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-ink text-white dark:bg-gold dark:text-ink'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <l.icon size={17} /> {l.label}
              </Link>
            );
          })}
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
