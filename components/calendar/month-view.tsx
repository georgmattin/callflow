"use client"

import { useState, useMemo } from "react"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  startOfWeek as dateFnsStartOfWeek,
  endOfWeek as dateFnsEndOfWeek,
} from "date-fns"
import { type CalendarEvent, CalendarEventType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  isLoading: boolean
}

export function MonthView({ currentDate, events, onEventClick, isLoading }: MonthViewProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  // Generate days for the month view
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = dateFnsStartOfWeek(monthStart, { weekStartsOn: 1 }) // Start from Monday
    const endDate = dateFnsEndOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentDate])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}

    events.forEach((event) => {
      const dateKey = format(new Date(event.start), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  }, [events])

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd")
    return eventsByDate[dateKey] || []
  }

  // Get event color based on type and result
  const getEventColor = (event: CalendarEvent) => {
    // Püüame saada kõne tulemust, kui olemas
    const callResult = event.contact?.status || '';
    
    // Põhitüübi järgi värvimine
    switch (event.type) {
      case CalendarEventType.MEETING:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800";
      
      case CalendarEventType.CALLBACK:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-800";
      
      case CalendarEventType.CALL:
        // Kõnede puhul arvestame ka tulemust
        switch (callResult) {
          case "Kohtumine":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800";
          case "Saada info":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800";
          case "Ei vastanud":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-800";
          case "Pole huvitatud":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800";
          case "Helista hiljem":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-800";
          default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700";
        }
      
      default:
        return "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100 hover:bg-primary-200 dark:hover:bg-primary-800";
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  return (
    <div className="bg-background">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px border-b">
        {["E", "T", "K", "N", "R", "L", "P"].map((day, i) => (
          <div key={i} className="p-2 text-center font-medium text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-muted">
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isHovered = hoveredDate ? isSameDay(day, hoveredDate) : false

          return (
            <div
              key={dayIdx}
              className={cn(
                "min-h-[100px] bg-background p-1 relative",
                !isCurrentMonth && "text-muted-foreground bg-muted/30",
                isHovered && "bg-muted/50",
              )}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full text-sm",
                  isToday && "bg-primary text-primary-foreground font-medium",
                )}
              >
                {format(day, "d")}
              </div>

              <div className="mt-1 max-h-[80px] overflow-y-auto space-y-1 pr-1">
                {dayEvents.slice(0, 3).map((event, eventIdx) => (
                  <div
                    key={eventIdx}
                    className={cn("text-xs px-2 py-1 rounded truncate cursor-pointer", getEventColor(event))}
                    onClick={() => onEventClick(event)}
                  >
                    {format(new Date(event.start), "HH:mm")} {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-2">+ {dayEvents.length - 3} veel</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
