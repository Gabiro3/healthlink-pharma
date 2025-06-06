import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getCurrentUser } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pharmly - Pharmacy Management System",
  description: "Comprehensive pharmacy management solution",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        {user ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar
              user={{
                email: user.email,
                pharmacy_name: user.pharmacy_name,
                role: user.role,
              }}
            />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
