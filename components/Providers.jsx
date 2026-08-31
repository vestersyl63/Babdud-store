'use client';
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

function readLS(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Providers({ children }) {
  // ---------- theme ----------
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('bc_theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(saved || prefers);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('bc_theme', next);
      return next;
    });

  // ---------- toasts ----------
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  // ---------- auth ----------
  const [user, setUser] = useState(undefined); // undefined = loading
  const refreshUser = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me');
      const d = await r.json();
      setUser(d.user || null);
      return d.user || null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ---------- cart ----------
  const [cart, setCart] = useState({ items: [], count: 0 });
  const refreshCart = useCallback(async () => {
    if (user) {
      try {
        const r = await fetch('/api/cart');
        const d = await r.json();
        setCart({ items: d.items || [], count: d.count || 0 });
        return;
      } catch {}
    }
    const local = readLS('bc_cart', []);
    setCart({ items: local, count: local.reduce((s, i) => s + i.qty, 0) });
  }, [user]);
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (product, qty = 1) => {
      if (user) {
        const r = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, qty }),
        });
        const d = await r.json();
        if (!r.ok) return toast(d.error || 'Could not add to cart', 'err');
        refreshCart();
        toast('Added to cart');
      } else {
        const local = readLS('bc_cart', []);
        const found = local.find((i) => i.product_id === product.id);
        if (found) found.qty += qty;
        else
          local.push({
            product_id: product.id,
            qty,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
              image: product.images?.[0]?.url || null,
            },
          });
        localStorage.setItem('bc_cart', JSON.stringify(local));
        refreshCart();
        toast('Added to cart');
      }
    },
    [user, refreshCart, toast]
  );

  // ---------- wishlist ----------
  const [wish, setWish] = useState([]);
  const refreshWish = useCallback(async () => {
    if (user) {
      try {
        const r = await fetch('/api/likes');
        const d = await r.json();
        setWish(d.likes || []);
        return;
      } catch {}
    }
    setWish(readLS('bc_wish', []));
  }, [user]);
  useEffect(() => {
    refreshWish();
  }, [refreshWish]);

  const toggleWish = useCallback(
    async (product) => {
      if (user) {
        const r = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id }),
        });
        const d = await r.json();
        refreshWish();
        toast(d.liked ? 'Saved to wishlist' : 'Removed from wishlist');
      } else {
        const local = readLS('bc_wish', []);
        const has = local.includes(product.id);
        const next = has ? local.filter((id) => id !== product.id) : [...local, product.id];
        localStorage.setItem('bc_wish', JSON.stringify(next));
        refreshWish();
        toast(has ? 'Removed from wishlist' : 'Saved to wishlist');
      }
    },
    [user, refreshWish, toast]
  );

  // merge guest cart/wishlist after login
  useEffect(() => {
    if (!user) return;
    const localCart = readLS('bc_cart', []);
    const localWish = readLS('bc_wish', []);
    (async () => {
      if (localCart.length) {
        await fetch('/api/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: localCart.map((i) => ({ product_id: i.product_id, qty: i.qty })) }),
        });
        localStorage.removeItem('bc_cart');
        refreshCart();
      }
      if (localWish.length) {
        await fetch('/api/likes/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_ids: localWish }),
        });
        localStorage.removeItem('bc_wish');
        refreshWish();
      }
    })();
  }, [user, refreshCart, refreshWish]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      user,
      setUser,
      refreshUser,
      cart,
      refreshCart,
      addToCart,
      wish,
      toggleWish,
      toast,
      toasts,
    }),
    [theme, user, cart, wish, toasts, toggleTheme, refreshUser, refreshCart, addToCart, toggleWish, toast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-pop rounded-full px-4 py-2 text-sm font-semibold shadow-lift ${
            t.tone === 'err' ? 'bg-red-600 text-white' : 'bg-ink text-white dark:bg-gold dark:text-ink'
          }`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
