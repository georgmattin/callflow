"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type CalendarEvent, CalendarEventType } from "@/lib/types"
import { format } from "date-fns"
import { et } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Building, Phone, Mail, FileText, Repeat } from "lucide-react"
import Link from "next/link"

interface EventDetailDialogProps {
  event: CalendarEvent
  isOpen: boolean
  onClose: () => void
}

export function EventDetailDialog({ event, isOpen, onClose }: EventDetailDialogProps) {
  // Get event type badge color
  const getBadgeVariant = () => {
    switch (event.type) {
      case CalendarEventType.MEETING:
        return "default"
      case CalendarEventType.CALLBACK:
        return "secondary"
      case CalendarEventType.CALL:
        return "outline"
      default:
        return "default"
    }
  }

  // Get event type label
  const getEventTypeLabel = () => {
    switch (event.type) {
      case CalendarEventType.MEETING:
        return "Kohtumine"
      case CalendarEventType.CALLBACK:
        return "Tagasihelistamine"
      case CalendarEventType.CALL:
        return "Kõne"
      default:
        return "Sündmus"
    }
  }

  // Format date and time
  const formatDateTime = (date: Date | string) => {
    return format(new Date(date), "d. MMMM yyyy, HH:mm", { locale: et })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{event.title}</span>
            <Badge variant={getBadgeVariant()}>{getEventTypeLabel()}</Badge>
            {event.recurring && (
              <Badge variant="secondary" className="ml-2">
                <Repeat className="h-3 w-3 mr-1" />
                Korduv
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date and time */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Aeg</p>
              <p>
                {formatDateTime(event.start)}
                {!event.allDay && new Date(event.start).getTime() !== new Date(event.end).getTime() && (
                  <> - {formatDateTime(event.end)}</>
                )}
              </p>
              {event.allDay && <Badge variant="outline">Terve päev</Badge>}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Kirjeldus</p>
                <p>{event.description}</p>
              </div>
            </div>
          )}

          {/* Contact information */}
          {event.contact && (
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{event.contact.company}</p>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p>{event.contact.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p>{event.contact.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p>{event.contact.email}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between">
          <div>
            {event.contact && (
              <Link href={`/contacts?id=${event.contact.id}`}>
                <Button variant="outline">Vaata kontakti</Button>
              </Link>
            )}
          </div>
          <Button onClick={onClose}>Sulge</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
