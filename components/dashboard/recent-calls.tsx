"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentCallsProps {
  calls?: any[]
  isLoading: boolean
}

export function RecentCalls({ calls, isLoading }: RecentCallsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Kohtumine":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Saada info":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "Ei vastanud":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "Pole huvitatud":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Helista hiljem":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return `Täna, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    } else if (isYesterday) {
      return `Eile, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    } else {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-start space-x-4 p-3 rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // If no data available
  if (!calls || calls.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Kõneajalugu puudub</div>
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <div key={call.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(call.contacts?.name || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{call.contacts?.name || "Tundmatu kontakt"}</p>
              <Badge className={cn(getStatusColor(call.result))}>{call.result}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{call.contacts?.company || "Tundmatu ettevõte"}</p>
            <p className="text-xs text-muted-foreground">{formatDate(call.date)}</p>
            {call.notes && <p className="text-sm mt-1">{call.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
