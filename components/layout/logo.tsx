import { cn } from "@/lib/utils"
import { Phone } from "lucide-react"

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center justify-center bg-primary rounded-md p-1">
        <Phone className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && <span className="ml-2 font-bold text-xl text-primary">CallFlow</span>}
    </div>
  )
}
