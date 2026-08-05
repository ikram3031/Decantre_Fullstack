import './globals.css';
import { StoreInitializer } from '@/providers/StoreInitializer';

export const metadata = {
  title: 'Toyoland | Kids Educational & Wooden Montessori Toys',
  description: 'Shop premium educational wooden toys, Montessori learning materials, sensory games and gift items at Toyoland.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <StoreInitializer>
          {children}
        </StoreInitializer>
      </body>
    </html>
  );
}
