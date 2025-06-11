import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ChatGPT Clone - Next.js 15 + Turbopack",
  description: "A fully functional ChatGPT clone built with Next.js 15, Turbopack, and AI SDK",
  keywords: ["ChatGPT", "AI", "Next.js 15", "Turbopack", "OpenAI"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
