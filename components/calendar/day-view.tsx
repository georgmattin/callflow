"use client"

import { useMemo } from "react"
import { format, isSameDay, differenceInMinutes } from "date-fns"
import { et } from "date-fns/locale"
import { type CalendarEvent, CalendarEventType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  isLoading: boolean
}

export function DayView({ currentDate, events, onEventClick, isLoading }: DayViewProps) {
  // Generate hours for the day
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i)
  }, [])

  // Filter events for the current day
  const dayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(new Date(event.start), currentDate))
  }, [currentDate, events])

  // Group events by hour
  const eventsByHour = useMemo(() => {
    const groupedEvents: Record<number, CalendarEvent[]> = {}
    
    dayEvents.forEach((event) => {
      const hour = new Date(event.start).getHours()
      if (!groupedEvents[hour]) {
        groupedEvents[hour] = []
      }
      groupedEvents[hour].push(event)
    })
    
    return groupedEvents
  }, [dayEvents])

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
  };

  // Calculate dynamic hour heights based on event count
  const getHourHeight = (hour: number) => {
    const eventCount = eventsByHour[hour]?.length || 0;
    if (eventCount === 0) return 60;
    if (eventCount <= 2) return 60;
    if (eventCount <= 4) return 120;
    return 160; // maximum height for an hour with many events
  }

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  return (
    <div className="bg-background">
      {/* Day header */}
      <div className="border-b p-2 text-center font-medium">
        <div>{format(currentDate, "EEEE", { locale: et })}</div>
        <div className="inline-flex items-center justify-center h-6 w-6 rounded-full text-sm bg-primary text-primary-foreground">
          {format(currentDate, "d")}
        </div>
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[80px_1fr] overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
        {/* Hour labels */}
        <div className="border-r">
          {hours.map((hour) => {
            const hourHeight = getHourHeight(hour);
            return (
              <div
                key={hour}
                className="border-b text-xs text-right pr-2 flex items-start"
                style={{ height: `${hourHeight}px`, minHeight: `${hourHeight}px` }}
              >
                <div className="pt-2">{hour}:00</div>
              </div>
            );
          })}
        </div>

        {/* Day column */}
        <div className="relative">
          {/* Hour grid with events */}
          {hours.map((hour) => {
            const hourHeight = getHourHeight(hour);
            const eventCount = eventsByHour[hour]?.length || 0;
            
            return (
              <div 
                key={hour} 
                className="border-b relative" 
                style={{ height: `${hourHeight}px`, minHeight: `${hourHeight}px` }}
              >
                {/* Events for this hour */}
                <div 
                  className={cn(
                    "p-1",
                    eventCount > 4 ? "max-h-[150px] overflow-y-auto pr-1" : ""
                  )}
                >
                  {eventsByHour[hour]?.map((event, eventIdx) => (
                    <div
                      key={eventIdx}
                      className={cn(
                        "mb-1 p-2 text-sm rounded border cursor-pointer",
                        getEventColor(event),
                      )}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="flex items-center">
                        <div className="font-medium mr-1">{format(new Date(event.start), "HH:mm")}</div>
                        <div className="font-medium flex-1 truncate">{event.title}</div>
                      </div>
                      {event.description && (
                        <div className="text-xs opacity-75 truncate mt-1">
                          {event.description.substring(0, 50)}
                          {event.description.length > 50 ? "..." : ""}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Current time indicator */}
          {isSameDay(currentDate, new Date()) && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
              style={{
                top: `${hours.slice(0, new Date().getHours()).reduce((acc, hour) => acc + getHourHeight(hour), 0) + new Date().getMinutes() * (getHourHeight(new Date().getHours()) / 60)}px`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
