export function json(data, status = 200, opts = {}) {
  return Response.json(data, { status, ...opts });
}

export function err(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function naira(n) {
  const v = Number(n || 0);
  return '₦' + v.toLocaleString('en-NG');
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
  return d.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function discountPct(price, prev) {
  if (!prev || prev <= price) return 0;
  return Math.round(((prev - price) / prev) * 100);
}

export const ORDER_STATUSES = [
  'Pending',
  'Payment Pending',
  'Payment Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export function statusTone(status) {
  switch (status) {
    case 'Delivered':
      return 'green';
    case 'Cancelled':
      return 'red';
    case 'Shipped':
    case 'Processing':
      return 'blue';
    case 'Payment Confirmed':
      return 'teal';
    default:
      return 'amber';
  }
}
