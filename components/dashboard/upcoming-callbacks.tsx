"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Phone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface UpcomingCallbacksProps {
  callbacks?: any[]
  isLoading: boolean
}

export function UpcomingCallbacks({ callbacks, isLoading }: UpcomingCallbacksProps) {
  const { toast } = useToast()
  const router = useRouter()

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    const isDayAfterTomorrow = date.toDateString() === dayAfterTomorrow.toDateString()
    
    if (isToday) {
      return "Täna"
    } else if (isTomorrow) {
      return "Homme"
    } else if (isDayAfterTomorrow) {
      return "Ülehomme"
    } else {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    }
  }

  const handleCall = (callback: any) => {
    toast({
      title: "Helistamine",
      description: `Helistatakse: ${callback.name} (${callback.company})`,
    })

    // Navigate to the calling page with the contact ID
    router.push(`/calling?contactId=${callback.id}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-start space-x-4 p-3 rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-3 w-48" />
              <div className="flex items-center space-x-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // If no callbacks data available
  if (!callbacks || callbacks.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Planeeritud tagasihelistamisi pole</div>
  }

  return (
    <div className="space-y-4">
      {callbacks.map((callback) => (
        <div
          key={callback.id}
          className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(callback.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{callback.name}</p>
              <Button size="sm" variant="outline" className="h-8" onClick={() => handleCall(callback)}>
                <Phone className="h-3 w-3 mr-1" />
                Helista
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{callback.company}</p>
            <div className="flex items-center text-xs text-muted-foreground space-x-3">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(callback.callbackDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{callback.callbackTime || ""}</span>
              </div>
            </div>
            {callback.callbackReason && <p className="text-sm mt-1 italic">"{callback.callbackReason}"</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
