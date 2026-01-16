import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./contexts/AuthContext"

export const metadata: Metadata = {
  title: "RiderGo - Kenya Delivery Platform",
  description: "Instant delivery for documents and goods",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
