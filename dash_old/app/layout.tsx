import type {Metadata} from 'next';
import './globals.css';
import { Inter, Nunito_Sans } from "next/font/google";
import { cn } from "@/lib/core/utils";
import { ThemeProvider } from "@/components/core/theme-provider";
import { TooltipProvider } from "@/components/core/ui/tooltip";
import { ReactQueryProvider } from "@/components/core/providers";

const nunitoSansHeading = Nunito_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'A modern admin dashboard',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, nunitoSansHeading.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
