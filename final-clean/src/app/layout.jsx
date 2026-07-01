import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'PathForge — Career Guidance Platform',
  description: 'Personalized career roadmap and mentorship platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
