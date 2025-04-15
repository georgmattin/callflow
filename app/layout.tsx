import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AppLayout from "@/components/layout/app-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CallFlow - Külmade Kõnede Haldussüsteem",
  description: "Professionaalne külmade kõnede haldussüsteem ettevõtetele",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="et" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'