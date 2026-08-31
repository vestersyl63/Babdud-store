'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '../../../components/Providers.jsx';
import ProductCard from '../../../components/ProductCard.jsx';
import { Stars, Qty, Price, Empty, Spinner, btnPrimary, btnDark, btnGhost, inputCls, Field } from '../../../components/ui.jsx';
import {
  IcHeart, IcCart, IcChevL, IcImage, IcChat, IcStar, IcAlert,
} from '../../../components/icons.jsx';
import { discountPct, fmtDate } from '../../../lib/util.mjs';

function parseLines(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart, wish, toggleWish, user, toast } = useApp();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [varSel, setVarSel] = useState({});
  const [review, setReview] = useState({ rating: 5, body: '' });
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setData(null);
    setNotFound(false);
    setImgIdx(0);
    setQty(1);
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then(setData)
      .catch(() => setNotFound(true));
  }, [slug]);

  const p = data?.product;
  const liked = p && wish.includes(p.id);
  const pct = p ? discountPct(p.price, p.previous_price) : 0;
  const specs = useMemo(() => parseLines(p?.specs).map((l) => {
    const i = l.indexOf(':');
    return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, ''];
  }), [p]);
  const variations = useMemo(() => parseLines(p?.variations).map((l) => {
    const i = l.indexOf(':');
    const name = i > 0 ? l.slice(0, i).trim() : 'Option';
    const options = (i > 0 ? l.slice(i + 1) : l).split(',').map((s) => s.trim()).filter(Boolean);
    return { name, options };
  }), [p]);

  if (notFound)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Empty
          icon={<IcAlert size={26} />}
          title="Product unavailable"
          sub="This product may have been removed or is no longer listed."
          action={
            <button className={btnPrimary} onClick={() => router.push('/')}>
              Back to store
            </button>
          }
        />
      </div>
    );

  if (!data || !p)
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-2">
        <div className="skeleton aspect-square w-full rounded-2xl" />
        <div className="space-y-3">
          <div className="skeleton h-6 w-1/3" />
          <div className="skeleton h-9 w-3/4" />
          <div className="skeleton h-6 w-1/2" />
          <div className="skeleton h-40 w-full" />
        </div>
      </div>
    );

  const out = p.stock <= 0;
  const topLevelComments = (data.comments || []).filter((c) => !c.parent_id);
  const repliesOf = (id) => (data.comments || []).filter((c) => c.parent_id === id);

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: p.id, rating: review.rating, body: review.body }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not submit review', 'err');
    toast('Review submitted — thank you!');
    setReview({ rating: 5, body: '' });
    const fresh = await fetch(`/api/products/${encodeURIComponent(slug)}`).then((r2) => r2.json());
    setData(fresh);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    const r = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: p.id, body: comment, parent_id: replyTo?.id || null }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not post comment', 'err');
    toast(replyTo ? 'Reply posted' : 'Comment posted');
    setComment('');
    setReplyTo(null);
    const fresh = await fetch(`/api/products/${encodeURIComponent(slug)}`).then((r2) => r2.json());
    setData(fresh);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 transition hover:text-gold-dark dark:hover:text-gold">
        <IcChevL size={16} /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* GALLERY */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-[#F4F1EA] dark:border-neutral-800 dark:bg-neutral-800">
            {p.images?.[imgIdx] ? (
              <img src={p.images[imgIdx].url} alt={p.name} className="h-full w-full object-contain" />
            ) : (
              <div className="grid h-full w-full place-items-center text-neutral-300 dark:text-neutral-600">
                <IcImage size={56} />
              </div>
            )}
            {pct > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-black text-ink">-{pct}%</span>
            )}
          </div>
          {p.images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {p.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F4F1EA] transition dark:bg-neutral-800 ${
                    i === imgIdx ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* BUY BOX */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gold-dark dark:text-gold">
            {p.category?.name || 'BABDUD Culture'}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
            <Stars rating={p.rating} size={15} />
            <span className="font-bold text-ink dark:text-white">{p.rating}</span>
            <span>· {p.review_count} review(s)</span>
            {p.sold > 0 && <span>· {p.sold} sold</span>}
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <Price price={p.price} previous={p.previous_price} size="lg" />
            <p className={`mt-2 text-xs font-bold ${out ? 'text-red-500' : p.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {out ? 'Out of stock' : p.stock <= 5 ? `Hurry — only ${p.stock} left` : 'In stock'}
            </p>
          </div>

          {variations.length > 0 && (
            <div className="mt-4 space-y-3">
              {variations.map((v) => (
                <div key={v.name}>
                  <p className="mb-1.5 text-sm font-semibold">
                    {v.name}: <span className="text-gold-dark dark:text-gold">{varSel[v.name] || v.options[0]}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => setVarSel((s) => ({ ...s, [v.name]: o }))}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                          (varSel[v.name] || v.options[0]) === o
                            ? 'bg-ink text-white dark:bg-gold dark:text-ink'
                            : 'border border-neutral-200 bg-white hover:border-gold dark:border-neutral-700 dark:bg-neutral-900'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center gap-4">
            <Qty qty={qty} setQty={setQty} max={Math.max(1, p.stock)} />
            <button
              onClick={() => toggleWish(p)}
              className={`grid h-11 w-11 place-items-center rounded-xl border transition active:scale-90 ${
                liked ? 'border-red-500 bg-red-500 text-white' : 'border-neutral-200 bg-white text-neutral-500 hover:text-red-500 dark:border-neutral-700 dark:bg-neutral-900'
              }`}
              aria-label="Wishlist"
            >
              <IcHeart size={19} filled={liked} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button disabled={out} onClick={() => addToCart(p, qty)} className={btnDark}>
              <IcCart size={17} /> Add to Cart
            </button>
            <button
              disabled={out}
              onClick={async () => {
                if (!user) return router.push('/auth/login?next=/checkout');
                await addToCart(p, qty);
                router.push('/checkout');
              }}
              className={btnPrimary}
            >
              Buy Now
            </button>
          </div>

          {p.description && (
            <div className="mt-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {p.description}
              </p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider">Specifications</h2>
              <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                {specs.map(([k, v], i) => (
                  <div key={i} className={`grid grid-cols-[1fr_1.6fr] text-sm ${i % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-800/50'}`}>
                    <span className="px-3 py-2 font-semibold text-neutral-500">{k}</span>
                    <span className="px-3 py-2">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="font-display text-lg font-bold">Reviews</h2>
          <div className="mt-3 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-center">
              <p className="font-display text-4xl font-bold">{p.rating}</p>
              <Stars rating={p.rating} size={14} />
              <p className="mt-1 text-xs text-neutral-500">{p.review_count} review(s)</p>
            </div>
            <div className="flex-1 space-y-1">
              {(data.breakdown || []).map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-bold">{b.star}</span>
                  <IcStar size={11} className="text-gold" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: p.review_count ? `${(b.count / p.review_count) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-5 text-right text-neutral-500">{b.count}</span>
                </div>
              ))}
            </div>
          </div>

          {user ? (
            data.canReview && !data.hasReviewed ? (
              <form onSubmit={submitReview} className="mt-4 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-bold">Write a review</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" onClick={() => setReview((r) => ({ ...r, rating: i }))} className={i <= review.rating ? 'text-gold' : 'text-neutral-300 dark:text-neutral-600'} aria-label={`${i} stars`}>
                      <IcStar size={24} />
                    </button>
                  ))}
                </div>
                <textarea value={review.body} onChange={(e) => setReview((r) => ({ ...r, body: e.target.value }))} rows={3} placeholder="How was the fabric, the colour, the delivery?" className={inputCls} />
                <button disabled={busy} className={btnPrimary}>
                  {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Submit review'}
                </button>
              </form>
            ) : data.hasReviewed ? (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                You have reviewed this product. Thank you!
              </p>
            ) : (
              <p className="mt-4 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                Order this product to unlock reviews.
              </p>
            )
          ) : (
            <p className="mt-4 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              <a href="/auth/login" className="font-bold text-gold-dark dark:text-gold">Sign in</a> to write a review after ordering.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {(data.reviews || []).length === 0 ? (
            <p className="text-sm text-neutral-500">No reviews yet.</p>
          ) : (
            (data.reviews || []).map((r) => (
              <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 font-display text-sm font-bold text-gold-dark dark:text-gold">
                    {(r.username || '?')[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{r.username}</p>
                    <p className="text-[11px] text-neutral-400">{fmtDate(r.created_at)}</p>
                  </div>
                  <Stars rating={r.rating} size={12} className="ml-auto" />
                </div>
                {r.body && <p className="mt-2.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{r.body}</p>}
              </div>
            ))
          )}
        </div>
      </section>

      {/* COMMENTS */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-bold">Questions & comments</h2>
        <form onSubmit={submitComment} className="mt-3 flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={replyTo ? `Replying to ${replyTo.username}…` : 'Ask a question about this product…'}
            className={inputCls}
          />
          <button disabled={busy || !user} className={btnDark + ' shrink-0'}>
            <IcChat size={16} /> Post
          </button>
        </form>
        {!user && <p className="mt-2 text-xs text-neutral-500">Sign in to join the conversation.</p>}
        {replyTo && (
          <button onClick={() => setReplyTo(null)} className="mt-2 text-xs font-bold text-red-500">
            Cancel reply
          </button>
        )}
        <div className="mt-4 space-y-3">
          {topLevelComments.length === 0 && <p className="text-sm text-neutral-500">No comments yet — be the first to ask.</p>}
          {topLevelComments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800">
                  {(c.username || '?')[0].toUpperCase()}
                </span>
                <p className="text-sm font-bold">{c.username}</p>
                <p className="text-[11px] text-neutral-400">{fmtDate(c.created_at)}</p>
                <button onClick={() => setReplyTo(c)} className="ml-auto text-xs font-bold text-gold-dark dark:text-gold">
                  Reply
                </button>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{c.body}</p>
              {repliesOf(c.id).map((rp) => (
                <div key={rp.id} className="ml-8 mt-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
                  <p className="text-xs font-bold">
                    {rp.username} <span className="ml-2 font-normal text-neutral-400">{fmtDate(rp.created_at)}</span>
                  </p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{rp.body}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* RELATED */}
      {(data.related || []).length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-lg font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {data.related.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
