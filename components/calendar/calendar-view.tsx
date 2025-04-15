"use client"

import { useState, useEffect, useMemo } from "react"
import {
  addDays,
  addMonths,
  format,
  parseISO,
  addYears,
  subYears,
  subDays,
  subMonths,
  isSameDay,
  isWithinInterval,
  startOfDay as dateFnsStartOfDay,
  endOfDay as dateFnsEndOfDay,
  startOfWeek as dateFnsStartOfWeek,
} from "date-fns"
import { et } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getContactLists } from "@/app/actions/contact-actions"
import { type CalendarEvent, CalendarEventType } from "@/lib/types"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { YearView } from "./year-view"
import { DayView } from "./day-view"
import { EventDetailDialog } from "./event-detail-dialog"

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week" | "month" | "year">("month")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false)

  // Fetch events from the database
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        // Fetch events from the calendar API endpoint
        const response = await fetch('/api/calendar/events')
        if (!response.ok) {
          throw new Error('Failed to fetch calendar events')
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Navigation functions
  const navigatePrevious = () => {
    switch (view) {
      case "day":
        setCurrentDate((prev) => addDays(prev, -1))
        break
      case "week":
        setCurrentDate((prev) => addDays(prev, -7))
        break
      case "month":
        setCurrentDate((prev) => addMonths(prev, -1))
        break
      case "year":
        setCurrentDate((prev) => subYears(prev, 1))
        break
    }
  }

  const navigateNext = () => {
    switch (view) {
      case "day":
        setCurrentDate((prev) => addDays(prev, 1))
        break
      case "week":
        setCurrentDate((prev) => addDays(prev, 7))
        break
      case "month":
        setCurrentDate((prev) => addMonths(prev, 1))
        break
      case "year":
        setCurrentDate((prev) => addYears(prev, 1))
        break
    }
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  // Format the current view's title
  const viewTitle = useMemo(() => {
    switch (view) {
      case "day":
        return format(currentDate, "d. MMMM yyyy", { locale: et })
      case "week": {
        const start = dateFnsStartOfWeek(currentDate, { weekStartsOn: 1 })
        const end = addDays(start, 6)
        return `${format(start, "d.", { locale: et })} - ${format(end, "d. MMMM yyyy", { locale: et })}`
      }
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: et })
      case "year":
        return format(currentDate, "yyyy", { locale: et })
    }
  }, [currentDate, view])

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventDetailOpen(true)
  }

  // Filter events for the current view
  const filteredEvents = useMemo(() => {
    if (view === "day") {
      return events.filter((event) => isSameDay(new Date(event.start), currentDate))
    } else if (view === "week") {
      const weekStart = dateFnsStartOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = addDays(weekStart, 6)
      return events.filter((event) =>
        isWithinInterval(new Date(event.start), {
          start: dateFnsStartOfDay(weekStart),
          end: dateFnsEndOfDay(weekEnd),
        }),
      )
    }
    return events
  }, [events, currentDate, view])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={navigateToday}>
            Täna
          </Button>
          <h2 className="text-xl font-semibold ml-2">{viewTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="day">Päev</TabsTrigger>
              <TabsTrigger value="week">Nädal</TabsTrigger>
              <TabsTrigger value="month">Kuu</TabsTrigger>
              <TabsTrigger value="year">Aasta</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
        <Card className="p-0 overflow-hidden">
          <TabsContent value="day" className="m-0">
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="week" className="m-0">
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="month" className="m-0">
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="year" className="m-0">
            <YearView currentDate={currentDate} events={events} onEventClick={handleEventClick} isLoading={isLoading} />
          </TabsContent>
        </Card>
      </Tabs>

      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          isOpen={isEventDetailOpen}
          onClose={() => setIsEventDetailOpen(false)}
        />
      )}
    </div>
  )
}

// Helper function to add hours to a date
function addHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

// Helper function to set hours and minutes on a date
function setHours(date: Date, hours: number, minutes = 0): Date {
  const result = new Date(date)
  result.setHours(hours)
  result.setMinutes(minutes)
  return result
}
