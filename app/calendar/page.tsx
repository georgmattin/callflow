import { Suspense } from "react"
import CalendarView from "@/components/calendar/calendar-view"
import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kalender</h1>
          <p className="text-muted-foreground">Halda oma kohtumisi ja tagasihelistamisi</p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <CalendarView />
      </Suspense>
    </div>
  )
}
