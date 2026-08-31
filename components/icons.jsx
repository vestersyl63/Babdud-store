const I = ({ children, size = 22, className = '', strokeWidth = 1.8, filled = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IcHome = (p) => (
  <I {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </I>
);
export const IcGrid = (p) => (
  <I {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </I>
);
export const IcCart = (p) => (
  <I {...p}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17.5" cy="20" r="1.4" />
    <path d="M2.5 3.5h2.6l2.5 12h10.6l2.3-8.5H6" />
  </I>
);
export const IcUser = (p) => (
  <I {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </I>
);
export const IcShield = (p) => (
  <I {...p}>
    <path d="M12 2.8 5 5.5v6c0 4.6 3 8 7 9.7 4-1.7 7-5.1 7-9.7v-6L12 2.8Z" />
  </I>
);
export const IcSearch = (p) => (
  <I {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.2-4.2" />
  </I>
);
export const IcHeart = ({ filled, ...p }) => (
  <I {...p} filled={filled}>
    <path d="M12 20.5s-7.8-4.7-9.3-9.6C1.6 7.3 4 4.5 7.2 4.5c2 0 3.7 1.1 4.8 2.8 1.1-1.7 2.8-2.8 4.8-2.8 3.2 0 5.6 2.8 4.5 6.4-1.5 4.9-9.3 9.6-9.3 9.6Z" />
  </I>
);
export const IcStar = ({ half, ...p }) => (
  <I {...p} filled>
    <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9 2.9-6z" />
  </I>
);
export const IcPlus = (p) => (
  <I {...p}>
    <path d="M12 5v14M5 12h14" />
  </I>
);
export const IcMinus = (p) => (
  <I {...p}>
    <path d="M5 12h14" />
  </I>
);
export const IcTrash = (p) => (
  <I {...p}>
    <path d="M4 6.5h16M9.5 6V4.5h5V6M6.5 6.5l1 14h9l1-14M10 10.5v6M14 10.5v6" />
  </I>
);
export const IcEdit = (p) => (
  <I {...p}>
    <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z" />
    <path d="m14.5 8 2.5 2.5" />
  </I>
);
export const IcX = (p) => (
  <I {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </I>
);
export const IcChevR = (p) => (
  <I {...p}>
    <path d="m9 5 7 7-7 7" />
  </I>
);
export const IcChevL = (p) => (
  <I {...p}>
    <path d="m15 5-7 7 7 7" />
  </I>
);
export const IcChevD = (p) => (
  <I {...p}>
    <path d="m5 9 7 7 7-7" />
  </I>
);
export const IcPhone = (p) => (
  <I {...p}>
    <path d="M5 3.5h4l1.5 5-2.5 1.8a13 13 0 0 0 5.7 5.7l1.8-2.5 5 1.5v4c0 1-.8 1.6-1.8 1.5C10.5 19.6 4.4 13.5 3.5 5.3 3.4 4.3 4 3.5 5 3.5Z" />
  </I>
);
export const IcWhatsapp = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A9.9 9.9 0 1 0 12 2Zm0 1.8a8.1 8.1 0 1 1-4.1 15.1l-.3-.2-3 .8.8-3-.2-.3A8.1 8.1 0 0 1 12 3.8Zm-3.1 4c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.4-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.6-.8c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.3-.5-.5-.5h-.6Z" />
  </svg>
);
export const IcTiktok = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 3c.4 2.2 1.8 3.7 4.4 3.9v3c-1.7 0-3.1-.5-4.4-1.4v6.6c0 4-2.9 6.4-6.3 6.4A6 6 0 0 1 4 15.6c0-3.5 2.9-6.2 6.6-6 .3 0 .7 0 1 .1v3.1a3 3 0 0 0-1.2-.2 2.9 2.9 0 0 0-3 2.9 3 3 0 0 0 3 3c1.8 0 3-1.2 3-3.1V3h3.2Z" />
  </svg>
);
export const IcPackage = (p) => (
  <I {...p}>
    <path d="M12 2.8 21 7v10l-9 4.2L3 17V7l9-4.2Z" />
    <path d="M3.3 7.2 12 11.3l8.7-4.1M12 11.3V21" />
  </I>
);
export const IcSettings = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19 12a7 7 0 0 0-.15-1.4l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2.4-1.4L13.7 2.6h-3.4l-.35 2.6a7 7 0 0 0-2.4 1.4l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.8l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2.4 1.4l.35 2.6h3.4l.35-2.6a7 7 0 0 0 2.4-1.4l2.4 1 2-3.4-2-1.6c.1-.45.15-.92.15-1.4Z" />
  </I>
);
export const IcLogout = (p) => (
  <I {...p}>
    <path d="M14 4h-8v16h8M10 12h11M18 8.5 21.5 12 18 15.5" />
  </I>
);
export const IcSun = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </I>
);
export const IcMoon = (p) => (
  <I {...p}>
    <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
  </I>
);
export const IcCopy = (p) => (
  <I {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </I>
);
export const IcCheck = (p) => (
  <I {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </I>
);
export const IcUpload = (p) => (
  <I {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
  </I>
);
export const IcImage = (p) => (
  <I {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="m4 18 5-5 3 3 4-4 4 4" />
  </I>
);
export const IcInbox = (p) => (
  <I {...p}>
    <path d="M3 13.5 6 5h12l3 8.5V19a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19v-5.5Z" />
    <path d="M3 13.5h5.5a3.5 3.5 0 0 0 7 0H21" />
  </I>
);
export const IcAlert = (p) => (
  <I {...p}>
    <path d="M12 3 1.8 20.5h20.4L12 3Z" />
    <path d="M12 10v4.5M12 17.8v.2" />
  </I>
);
export const IcBag = (p) => (
  <I {...p}>
    <path d="M5 8h14l-1 13H6L5 8Z" />
    <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" />
  </I>
);
export const IcBank = (p) => (
  <I {...p}>
    <path d="M3 9.5 12 4l9 5.5M4 10v8M9 10v8M15 10v8M20 10v8M2.5 20.5h19" />
  </I>
);
export const IcLocation = (p) => (
  <I {...p}>
    <path d="M12 21.5S5 14.9 5 10a7 7 0 0 1 14 0c0 4.9-7 11.5-7 11.5Z" />
    <circle cx="12" cy="10" r="2.6" />
  </I>
);
export const IcChat = (p) => (
  <I {...p}>
    <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 21l1.6-5A8.5 8.5 0 1 1 21 12Z" />
  </I>
);
export const IcEye = (p) => (
  <I {...p}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </I>
);
