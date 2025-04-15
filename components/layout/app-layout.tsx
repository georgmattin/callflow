"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, Phone, Users, FileText, Mail, Settings, ChevronLeft, ChevronRight, Calendar, History } from "lucide-react"
import { Logo } from "./logo"
import { ThemeToggle } from "../theme-toggle"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load sidebar state from localStorage
  useEffect(() => {
    setIsMounted(true)
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === "true")
    }
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.toString())
    }
  }, [isSidebarCollapsed, isMounted])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const navItems = [
    { href: "/", icon: Home, label: "Töölaud" },
    { href: "/calling", icon: Phone, label: "Helistamine" },
    { href: "/contacts", icon: Users, label: "Kontaktid" },
    { href: "/history", icon: History, label: "Kõnede ajalugu" },
    { href: "/scripts", icon: FileText, label: "Skriptid" },
    { href: "/emails", icon: Mail, label: "E-mailid" },
    { href: "/calendar", icon: Calendar, label: "Kalender" },
    { href: "/settings", icon: Settings, label: "Seaded" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-10 h-screen bg-background border-r transition-all duration-300",
          isSidebarCollapsed ? "w-[80px]" : "w-[240px]",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b">
            <Logo showText={!isSidebarCollapsed} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href && "bg-muted",
                        isSidebarCollapsed ? "px-2" : "px-4",
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isSidebarCollapsed ? "mr-0" : "mr-2")} />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background border-t p-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn("min-h-screen", isSidebarCollapsed ? "ml-[80px]" : "ml-[240px]")}>{children}</main>
    </div>
  )
}
