import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Break Your Silence - Healthcare Transparency Platform",
  description: "Report hospital malpractices, overcharging, and healthcare issues. Track cases and access transparent healthcare information.",
  keywords: ["healthcare", "hospital", "malpractice", "patient rights", "transparency", "complaints", "medical"],
  authors: [{ name: "Break Your Silence Team" }],
  icons: {
    icon: [
      { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon.png' }
    ],
    apple: '/favicon.png',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Break Your Silence",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Break Your Silence - Healthcare Transparency Platform",
    description: "Report hospital malpractices and track healthcare complaints",
    url: "/",
    siteName: "Break Your Silence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Break Your Silence - Healthcare Transparency Platform",
    description: "Report hospital malpractices and track healthcare complaints",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1976D2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Break Your Silence" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
