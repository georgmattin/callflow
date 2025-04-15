"use client"

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost"
  showLabel?: boolean
}

// Replace the entire ThemeToggle component with a version that returns null
export function ThemeToggle({ variant = "ghost", showLabel = false }: ThemeToggleProps) {
  // Return null to remove the button completely
  return null
}
