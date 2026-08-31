'use client';
import { IcMinus, IcPlus, IcStar, IcInbox } from './icons.jsx';

export function Stars({ rating = 0, size = 14, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-[1px] ${className}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? 'text-gold' : 'text-neutral-300 dark:text-neutral-700'}>
          <IcStar size={size} />
        </span>
      ))}
    </span>
  );
}

export function Price({ price, previous, size = 'md' }) {
  const cls = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-display font-bold ${cls}`}>₦{Number(price || 0).toLocaleString('en-NG')}</span>
      {previous && previous > price && (
        <span className="text-xs text-neutral-400 line-through dark:text-neutral-500">
          ₦{Number(previous).toLocaleString('en-NG')}
        </span>
      )}
    </span>
  );
}

export function Qty({ qty, setQty, max = 99, small }) {
  const btn = `grid place-items-center rounded-lg border border-neutral-200 bg-white text-ink transition active:scale-90 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 ${
    small ? 'h-8 w-8' : 'h-10 w-10'
  }`;
  return (
    <div className="inline-flex items-center gap-2">
      <button type="button" className={btn} onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
        <IcMinus size={small ? 14 : 16} />
      </button>
      <span className={`text-center font-semibold tabular-nums ${small ? 'w-7 text-sm' : 'w-9'}`}>{qty}</span>
      <button
        type="button"
        className={btn}
        onClick={() => setQty(Math.min(max, qty + 1))}
        aria-label="Increase quantity"
      >
        <IcPlus size={small ? 14 : 16} />
      </button>
    </div>
  );
}

export function Empty({ icon, title, sub, action }) {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-14 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
        {icon || <IcInbox size={26} />}
      </span>
      <p className="font-display font-semibold">{title}</p>
      {sub && <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">{sub}</p>}
      {action}
    </div>
  );
}

export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-gold ${className}`}
      aria-label="Loading"
    />
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-neutral-700 dark:bg-neutral-900';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-gold-dark active:scale-[.97] disabled:opacity-50 disabled:pointer-events-none';
export const btnDark =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black active:scale-[.97] dark:bg-white dark:text-ink dark:hover:bg-neutral-200 disabled:opacity-50 disabled:pointer-events-none';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-neutral-50 active:scale-[.97] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none';
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[.97] disabled:opacity-50';

export function StatusBadge({ status }) {
  const tones = {
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  };
  const map = {
    Delivered: 'green',
    Cancelled: 'red',
    Shipped: 'blue',
    Processing: 'blue',
    'Payment Confirmed': 'teal',
    'Payment Pending': 'amber',
    Pending: 'amber',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[map[status]] || tones.amber}`}>
      {status}
    </span>
  );
}
