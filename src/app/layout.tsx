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
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
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
