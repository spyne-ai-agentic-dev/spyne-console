import type React from "react"
import type { Metadata } from "next"
// Spyne Console (legacy design system, ported). The Tailwind v4 globals.css remains in
// the repo for the future intelligent-console-v2 code push; this standalone console uses
// its own self-contained stylesheet for visual fidelity with the original.
import "./console.css"

export const metadata: Metadata = {
  title: "Console · Retail Suite by Spyne",
  description: "Spyne Console — retail suite dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
