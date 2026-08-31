'use client';
import { useRef, useState } from 'react';
import { useApp } from '../../components/Providers.jsx';
import { Field, inputCls, btnPrimary, Spinner } from '../../components/ui.jsx';
import { IcUpload } from '../../components/icons.jsx';

export default function ProfilePage() {
  const { user, refreshUser, toast } = useApp();
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const save = async (patch) => {
    setBusy(true);
    const r = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error || 'Could not save', 'err');
    await refreshUser();
    toast('Profile updated');
  };

  const uploadAvatar = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const r = await fetch('/api/upload?scope=avatar', { method: 'POST', body: fd });
    const d = await r.json();
    if (!r.ok) return toast(d.error || 'Upload failed', 'err');
    await save({ avatar: d.url });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="font-display text-lg font-bold">Profile</h1>
        <div className="mt-4 flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-gold" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gold font-display text-3xl font-bold text-ink">
              {(user.username || '?')[0].toUpperCase()}
            </span>
          )}
          <div>
            <button onClick={() => fileRef.current?.click()} className={`${btnPrimary} !px-4 !py-2`}>
              <IcUpload size={15} /> {user.avatar ? 'Change photo' : 'Upload photo'}
            </button>
            <p className="mt-2 text-xs text-neutral-500">From your phone gallery or computer.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider">Personal information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Username">
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Phone number">
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <button disabled={busy} onClick={() => save({ username, phone })} className={`${btnPrimary} mt-4`}>
          {busy ? <Spinner className="border-ink/30 border-t-ink" /> : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
