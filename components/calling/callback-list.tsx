"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Contact } from "@/lib/types"
import { format, isToday, isTomorrow, addDays } from "date-fns"
import { et } from "date-fns/locale"

interface CallbackListProps {
  callbacks: Contact[]
  onSelectCallback: (contact: Contact) => void
}

export default function CallbackList({ callbacks, onSelectCallback }: CallbackListProps) {
  // Sort callbacks by date and time
  const sortedCallbacks = [...callbacks].sort((a, b) => {
    if (!a.callbackDate || !b.callbackDate) return 0

    const dateA = new Date(`${a.callbackDate}T${a.callbackTime || "00:00"}`)
    const dateB = new Date(`${b.callbackDate}T${b.callbackTime || "00:00"}`)

    return dateA.getTime() - dateB.getTime()
  })

  // Format date for display
  const formatCallbackDate = (dateString: string) => {
    const date = new Date(dateString)

    if (isToday(date)) {
      return "Täna"
    } else if (isTomorrow(date)) {
      return "Homme"
    } else if (date < addDays(new Date(), 7)) {
      // If within a week, show day name
      return format(date, "EEEE", { locale: et })
    } else {
      // Otherwise show full date
      return format(date, "d. MMMM", { locale: et })
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="border rounded-md">
      {sortedCallbacks.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Tagasihelistamisi ei ole planeeritud.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kontakt</TableHead>
              <TableHead>Tagasihelistamise aeg</TableHead>
              <TableHead>Põhjus</TableHead>
              <TableHead>Tegevus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCallbacks.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">{contact.company}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {contact.callbackDate && formatCallbackDate(contact.callbackDate)}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Clock className="h-3 w-3 mr-1" />
                      {contact.callbackTime}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm">{contact.callbackReason || "Põhjus puudub"}</div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => onSelectCallback(contact)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Helista
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
