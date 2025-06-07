import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getCurrentUser } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Healthlink Pharma - Pharmacy Management System",
  keywords: [
    "pharmacy management",
    "healthcare software",
    "pharmacy software",
    "drug inventory",
    "pharmacy billing",
    "patient management",
    "pharmacy POS",
    "pharmacy administration",
    "pharmacy analytics",
    "pharmacy reporting"],
  authors: [{ name: "Healthlink Pharma Team", url: "https://healthlinkpharma.com" }],
  description: "Healthlink Pharma is a comprehensive pharmacy management system designed to streamline operations, enhance patient care, and improve overall efficiency in pharmacies.",
  icons: {
    icon: "/logo.png",
  },
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
