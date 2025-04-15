"use client"

import { useMemo } from "react"
import { addDays, startOfWeek, format, isSameDay, differenceInMinutes } from "date-fns"
import { et } from "date-fns/locale"
import { type CalendarEvent, CalendarEventType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  isLoading: boolean
}

export function WeekView({ currentDate, events, onEventClick, isLoading }: WeekViewProps) {
  // Generate days for the week view
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [currentDate])

  // Generate hours for the day
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i)
  }, [])

  // Filter events for the current week
  const weekEvents = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = addDays(weekStart, 6)

    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return eventDate >= weekStart && eventDate <= weekEnd
    })
  }, [currentDate, events])

  // Get event color based on type and result
  const getEventColor = (event: CalendarEvent) => {
    // Püüame saada kõne tulemust, kui olemas
    const callResult = event.contact?.status || '';
    
    // Põhitüübi järgi värvimine
    switch (event.type) {
      case CalendarEventType.MEETING:
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800";
      
      case CalendarEventType.CALLBACK:
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-800";
      
      case CalendarEventType.CALL:
        // Kõnede puhul arvestame ka tulemust
        switch (callResult) {
          case "Kohtumine":
            return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800";
          case "Saada info":
            return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800";
          case "Ei vastanud":
            return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800";
          case "Pole huvitatud":
            return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800";
          case "Helista hiljem":
            return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-800";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
        }
      
      default:
        return "bg-primary-100 text-primary-800 border-primary-200";
    }
  }

  // Calculate event position and height
  const getEventStyle = (event: CalendarEvent, day: Date) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // Only show events for the current day
    if (!isSameDay(eventStart, day)) return null

    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)

    const startMinutes = differenceInMinutes(eventStart, dayStart)
    const durationMinutes = differenceInMinutes(eventEnd, eventStart)

    // Calculate position and height
    const top = (startMinutes / 60) * 60 // 60px per hour
    const height = Math.max((durationMinutes / 60) * 60, 20) // Minimum height of 20px

    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  return (
    <div className="bg-background">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 text-center font-medium text-sm border-r"></div>
        {days.map((day, i) => {
          const isToday = isSameDay(day, new Date())
          return (
            <div key={i} className={cn("p-2 text-center font-medium border-r", isToday && "bg-primary/10")}>
              <div>{format(day, "EEEE", { locale: et })}</div>
              <div
                className={cn(
                  "inline-flex items-center justify-center h-6 w-6 rounded-full text-sm",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-8 relative" style={{ height: `${24 * 60}px` }}>
        {/* Hour labels */}
        <div className="border-r">
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-b text-xs text-right pr-2 sticky"
              style={{ height: "60px", top: `${hour * 60}px` }}
            >
              {hour}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="border-r relative">
            {/* Hour grid lines */}
            {hours.map((hour) => (
              <div key={hour} className="border-b" style={{ height: "60px" }} />
            ))}

            {/* Events */}
            {weekEvents.map((event, eventIdx) => {
              const style = getEventStyle(event, day)
              if (!style) return null

              return (
                <div
                  key={eventIdx}
                  className={cn(
                    "absolute left-0 right-0 mx-1 p-1 text-xs rounded border overflow-hidden cursor-pointer",
                    getEventColor(event),
                  )}
                  style={style}
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-medium truncate">
                    {format(event.start, "HH:mm")} {event.title}
                  </div>
                  {Number.parseInt(style.height) > 40 && (
                    <div className="truncate text-xs opacity-75">
                      {event.description?.substring(0, 30)}
                      {event.description && event.description.length > 30 ? "..." : ""}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Current time indicator */}
            {isSameDay(day, new Date()) && (
              <div
                className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                style={{
                  top: `${new Date().getHours() * 60 + new Date().getMinutes()}px`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
