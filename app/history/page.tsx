"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface CallHistoryItem {
  id: string
  date: string
  notes: string
  result: string
  contact_id: string
  contact?: {
    id: string
    name: string
    company: string
    phone: string
  }
}

export default function HistoryPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Load data from Supabase
  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Fetch call history with contact information
        const { data, error } = await supabase
          .from("call_history")
          .select(`
            id,
            date,
            notes,
            result,
            contact_id,
            contacts (
              id,
              name,
              company,
              phone
            )
          `)
          .order('date', { ascending: false })
        
        if (error) throw error
        
        // Format data for display
        const formattedData = data.map((item) => ({
          id: item.id,
          date: item.date,
          notes: item.notes,
          result: item.result,
          contact_id: item.contact_id,
          contact: item.contacts
        }))
        
        setCallHistory(formattedData)
      } catch (error) {
        console.error("Error fetching call history:", error)
        toast({
          title: "Viga andmete laadimisel",
          description: "Kõnede ajaloo laadimisel tekkis viga. Proovige lehte värskendada.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCallHistory()
  }, [toast])

  // Filter by search query and status
  const filteredCallHistory = callHistory.filter((call) => {
    const matchesSearch = 
      call.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.contact?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || call.result === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Function to get all unique status values
  const getUniqueStatuses = () => {
    const statuses = new Set<string>()
    callHistory.forEach(call => {
      if (call.result) statuses.add(call.result)
    })
    return Array.from(statuses)
  }
  
  const uniqueStatuses = getUniqueStatuses()

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Kohtumine":
        return "bg-green-100 text-green-800"
      case "Saada info":
        return "bg-blue-100 text-blue-800"
      case "Ei vastanud":
        return "bg-yellow-100 text-yellow-800"
      case "Pole huvitatud":
        return "bg-red-100 text-red-800"
      case "Helista hiljem":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("et-EE", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("et-EE", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kõnede ajalugu</h1>
          <p className="text-muted-foreground">Kõikide tehtud kõnede ülevaade</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filtrid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Otsi kontakti või märkmeid..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtreeri staatuse järgi" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Kõik staatused</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCallHistory.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                Kõnede ajalugu pole saadaval või ei vasta otsingu kriteeriumidele.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Kuupäev ja aeg</TableHead>
                  <TableHead>Tulemus</TableHead>
                  <TableHead>Märkmed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCallHistory.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(call.contact?.name || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{call.contact?.name || "Tundmatu kontakt"}</div>
                          <div className="text-xs text-muted-foreground">{call.contact?.company || ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(call.date)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(call.result)}>
                        {call.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {call.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 