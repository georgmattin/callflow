"use client"

import { useMemo } from "react"
import {
  addMonths,
  startOfYear,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  getDay,
} from "date-fns"
import { et } from "date-fns/locale"
import type { CalendarEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface YearViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  isLoading: boolean
}

export function YearView({ currentDate, events, onEventClick, isLoading }: YearViewProps) {
  const router = useRouter()

  // Generate months for the year view
  const months = useMemo(() => {
    const year = currentDate.getFullYear()
    const yearStart = startOfYear(currentDate)

    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i))
  }, [currentDate])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, number> = {}

    events.forEach((event) => {
      const dateKey = format(event.start, "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = 0
      }
      grouped[dateKey]++
    })

    return grouped
  }, [events])

  // Get event count for a specific day
  const getEventCountForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd")
    return eventsByDate[dateKey] || 0
  }

  // Generate days for a month
  const getDaysForMonth = (month: Date) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start from Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const handleMonthClick = (month: Date) => {
    // Navigate to month view with the selected month
    const newDate = new Date(currentDate)
    newDate.setMonth(month.getMonth())
    router.push(`/calendar?view=month&date=${format(newDate, "yyyy-MM-dd")}`)
  }

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  return (
    <div className="bg-background p-4">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {months.map((month, monthIdx) => (
          <div
            key={monthIdx}
            className="border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMonthClick(month)}
          >
            <div className="bg-muted/30 p-2 text-center font-medium border-b">
              {format(month, "MMMM", { locale: et })}
            </div>

            <div className="grid grid-cols-7 gap-px text-xs">
              {/* Weekday headers */}
              {["E", "T", "K", "N", "R", "L", "P"].map((day, i) => (
                <div key={i} className="p-1 text-center text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Days */}
              {getDaysForMonth(month).map((day, dayIdx) => {
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, month)
                const eventCount = getEventCountForDay(day)

                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      "p-1 text-center",
                      !isCurrentMonth && "text-muted-foreground opacity-30",
                      isToday && "bg-primary/10",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center h-5 w-5 mx-auto rounded-full text-xs",
                        isToday && "bg-primary text-primary-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    {eventCount > 0 && isCurrentMonth && (
                      <div className="h-1 w-1 bg-primary rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper functions
function startOfWeek(date: Date, options: { weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 }) {
  const day = getDay(date)
  const diff = (day < options.weekStartsOn ? 7 : 0) + day - options.weekStartsOn
  return addDays(date, -diff)
}

function endOfWeek(date: Date, options: { weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 }) {
  const weekStart = startOfWeek(date, options)
  return addDays(weekStart, 6)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
