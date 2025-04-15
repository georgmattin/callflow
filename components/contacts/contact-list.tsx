"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Globe, Phone, Calendar, Clock, Mail, Trash2, MoreVertical, Smartphone, Flag, PhoneCall } from "lucide-react"
import type { Contact } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { isMobileNumber } from "@/lib/utils"

interface ContactListProps {
  contacts: Contact[]
  onContactClick: (contactId: string) => void
  onDeleteContact?: (contactId: string) => void
  onCallContact?: (contactId: string) => void
}

export default function ContactList({ contacts, onContactClick, onDeleteContact, onCallContact }: ContactListProps) {
  const [activeRowId, setActiveRowId] = useState<string | null>(null)

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
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Unreviewed":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "High":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Medium":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "Low":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "Normal":
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    }
  }

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "numeric",
      month: "long",
    })
  }

  // Format full datetime for display
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return `${date.toLocaleDateString("et-EE", {
      day: "numeric",
      month: "long",
    })} ${date.toLocaleTimeString("et-EE", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Käsitle kustutamist ilma et klikk läbi tablei rea läheks
  const handleDelete = (e: React.MouseEvent, contactId: string) => {
    e.stopPropagation()
    if (onDeleteContact) {
      if (window.confirm("Kas oled kindel, et soovid selle kontakti kustutada?")) {
        onDeleteContact(contactId)
      }
    }
  }

  // Handle call without triggering row click
  const handleCall = (e: React.MouseEvent, contactId: string) => {
    e.stopPropagation()
    if (onCallContact) {
      onCallContact(contactId)
    }
  }

  return (
    <div className="border rounded-md">
      {contacts.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            Kontaktide nimekiri on tühi. Palun importige kontaktid CSV faili kaudu.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kontakt</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Veebileht</TableHead>
              <TableHead>Staatus</TableHead>
              <TableHead>Prioriteet</TableHead>
              <TableHead>Viimane kõne</TableHead>
              {onDeleteContact && <TableHead className="w-[80px]">Tegevused</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => {
              const hasMobileNumber = isMobileNumber(contact.phone);
              return (
                <TableRow
                  key={contact.id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    contact.requeued ? "bg-yellow-50" : ""
                  } ${!hasMobileNumber ? "bg-gray-50" : ""}`}
                  onClick={() => onContactClick(contact.id)}
                  onMouseEnter={() => setActiveRowId(contact.id)}
                  onMouseLeave={() => setActiveRowId(null)}
                >
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
                      {hasMobileNumber ? (
                        <Smartphone className="h-4 w-4 mr-1 text-green-600" title="Mobiiltelefon" />
                      ) : (
                        <Phone className="h-4 w-4 mr-1 text-muted-foreground" title="Lauatelefon" />
                      )}
                      {contact.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="max-w-[150px] truncate">{contact.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.website ? (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
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
                    <Badge className={getPriorityColor(contact.priority)}>
                      <Flag className={`h-3 w-3 mr-1 ${
                        contact.priority === "Unreviewed" ? "text-red-600" :
                        contact.priority === "High" ? "text-green-600" : 
                        contact.priority === "Medium" ? "text-orange-600" : 
                        contact.priority === "Low" ? "text-gray-600" : 
                        "text-blue-600"
                      }`} />
                      {contact.priority === "Unreviewed" ? "Ülevaatamata" :
                       contact.priority === "High" ? "Kõrge" : 
                       contact.priority === "Medium" ? "Keskmine" :
                       contact.priority === "Low" ? "Madal" : 
                       "Tavaline"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {contact.lastCallDate ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDateTime(contact.lastCallDate)}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  {(onDeleteContact || onCallContact) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onCallContact && (
                            <DropdownMenuItem 
                              className="text-green-600 cursor-pointer"
                              onClick={(e) => handleCall(e, contact.id)}
                            >
                              <PhoneCall className="h-4 w-4 mr-2" />
                              Helista uuesti
                            </DropdownMenuItem>
                          )}
                          {onDeleteContact && (
                            <DropdownMenuItem 
                              className="text-red-600 cursor-pointer"
                              onClick={(e) => handleDelete(e, contact.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Kustuta
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
