"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Globe, Phone, Calendar, Clock } from "lucide-react"
import type { Contact } from "@/lib/types"

interface ContactListProps {
  contacts: Contact[]
  onContactClick: (contactId: string) => void
}

export default function ContactList({ contacts, onContactClick }: ContactListProps) {
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
      case "Uus":
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "numeric",
      month: "numeric",
    })
  }

  return (
    <div className="border rounded-md">
      {contacts.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">Kontaktide nimekiri on tühi. Palun importige kontaktid CSV faili kaudu.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ettevõte</TableHead>
              <TableHead>Kontaktisik</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Veebileht</TableHead>
              <TableHead>Staatus</TableHead>
              <TableHead>Viimane kõne</TableHead>
              <TableHead>Tagasihelistamine</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow
                key={contact.id}
                className={`cursor-pointer hover:bg-gray-50 ${contact.requeued ? "bg-yellow-50" : ""}`}
                onClick={() => onContactClick(contact.id)}
              >
                <TableCell className="font-medium">{contact.company}</TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-500" />
                    {contact.phone}
                  </div>
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  {contact.website ? (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1 text-gray-500" />
                      {contact.website}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                </TableCell>
                <TableCell>
                  {contact.lastCallDate ? new Date(contact.lastCallDate).toLocaleDateString("et-EE") : "-"}
                </TableCell>
                <TableCell>
                  {contact.callbackDate ? (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                      {formatDate(contact.callbackDate)}
                      <Clock className="h-4 w-4 mx-1 text-blue-500" />
                      {contact.callbackTime}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
