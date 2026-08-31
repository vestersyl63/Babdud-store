import '@fontsource-variable/manrope';
import '@fontsource-variable/space-grotesk';
import './globals.css';
import Providers, { Toasts } from '../components/Providers.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import BottomNav from '../components/BottomNav.jsx';

export const metadata = {
  title: {
    default: 'BABDUD Culture — Adire & Ready to Wear',
    template: '%s · BABDUD Culture',
  },
  description:
    'BABDUD Culture (a.k.a Babadudu Aladire) — authentic adire fabrics and ready-to-wear styles from Abeokuta. Promoting the beauty in tradition.',
  icons: { icon: '/brand/logo.jpg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <BottomNav />
          <Toasts />
        </Providers>
      </body>
    </html>
  );
}
