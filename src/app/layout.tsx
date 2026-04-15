import type { Metadata, Viewport } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Famli — Your Private Family Space",
    template: "%s | Famli",
  },
  description: "A private space for your family to share moments, celebrate birthdays, and stay connected.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Famli",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F97316",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
