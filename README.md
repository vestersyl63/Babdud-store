# BABDUD Culture — E-Commerce Store

Full-stack store for **BABDUD Culture (a.k.a Babadudu Aladire)** — authentic adire from Abeokuta.
Next.js 14 (App Router) · SQLite (better-sqlite3) · Tailwind CSS.

## Run

```bash
npm install
npm run build
npm run start        # serves on 0.0.0.0:3000
# or: npm run dev
```

The SQLite database (`data/store.db`) and default records are created automatically on first boot.

## Deploy

The app stores its database (`data/`) and uploaded images (`public/uploads/`) **on disk**, so deploy it on a
server with a persistent filesystem — a VPS (Hostinger, DigitalOcean, Contabo…), a Raspberry Pi, or any
Node 18+ machine. It is not suited to stateless serverless hosts (e.g. plain Vercel) unless you move
storage to a volume.

Typical VPS setup (Ubuntu):

```bash
# 1. install Node 20 (via nodesource or nvm), then:
npm install
npm run build
# 2. keep it running (pick one):
npm run start                      # foreground
nohup npm run start &              # simple background
# or use pm2:  npm i -g pm2 && pm2 start npm --name babdud -- start
# 3. point your domain at the server and put Nginx/Caddy in front as a reverse proxy to port 3000
#    (Caddy gives you HTTPS automatically).
```

Before going live:

1. Log in to **Admin** with the default password and change it (Admin → Settings).
2. Enter your real **bank transfer details** (Admin → Settings) — customers see exactly what you save there.
3. Optionally set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env` and restart to enable Google Sign-In
   (register `https://your-domain.com/api/auth/google/callback` as the redirect URI in Google Cloud Console).
4. Add your products with real photos from Admin → Products → Add product.

## Admin

- Open **Admin** (small item in the bottom nav on mobile, or `/admin`).
- Default admin password: `babdud101` — change it immediately in **Admin → Settings**.
- The password is stored as a salted scrypt hash, never in plain text, and never shown in the UI.

From the admin panel you can:

- Add / edit / delete products, with **multi-image upload from phone gallery or PC** (cover selection, replace, delete).
- Manage categories, orders (status workflow), customers, review/comment moderation.
- Configure the **bank-transfer details** shown at checkout (bank name, account name, account number, instructions), delivery fee, and home-page announcement.

## Customers

- Register with phone + password (min 8 chars, letters + numbers). No SMS OTP.
- Cart, wishlist, reviews (purchase-gated, one per product), comments with replies, order history with the
  bank-transfer payment flow (Pending → Payment Pending → Payment Confirmed → Processing → Shipped → Delivered).
- Light / dark mode persisted per device.

## Google Sign-In (optional)

Set these environment variables and the "Continue with Google" button appears automatically
(it stays hidden when they are absent — there is never a dead button):

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
```

OAuth redirect URI to register in Google Cloud Console: `https://<your-host>/api/auth/google/callback`.

## Notes

- Product images are served with a `contain` fit strategy — portrait, landscape and square photos are never stretched or cropped.
- Bank details live in the database (admin-editable) and are **not** hard-coded in the frontend.
