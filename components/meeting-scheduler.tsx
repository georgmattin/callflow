"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, MapPin, CalendarPlus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { et } from "date-fns/locale"

interface MeetingSchedulerProps {
  isOpen: boolean
  onClose: () => void
  contactName: string
  contactEmail: string
  contactCompany: string
  initialDate?: string
  initialTime?: string
}

interface CalendarSettings {
  defaultTitle?: string
  defaultDuration?: string
  defaultLocation?: string
  defaultDescription?: string
  defaultReminderTime?: string
  sendInvite?: boolean
  addReminder?: boolean
}

export default function MeetingScheduler({
  isOpen,
  onClose,
  contactName,
  contactEmail,
  contactCompany,
  initialDate,
  initialTime,
}: MeetingSchedulerProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("google")
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({
    defaultTitle: "Kohtumine: [Kontakti ettevõte]",
    defaultDuration: "60",
    defaultLocation: "Google Meet",
    defaultDescription: `Kohtumine ettevõttega [Kontakti ettevõte].\n\nOsalejad:\n- [Ettevõtte nimi]\n- [Kontaktisiku nimi] ([Kontakti ettevõte])`,
    defaultReminderTime: "15",
    sendInvite: true,
    addReminder: true,
  })

  const today = new Date()
  const formattedToday = format(today, "yyyy-MM-dd")
  
  // Log the received initialDate and initialTime for debugging
  useEffect(() => {
    console.log('MeetingScheduler received initialDate:', initialDate)
    console.log('MeetingScheduler received initialTime:', initialTime)
  }, [initialDate, initialTime])

  // Fetch calendar settings on component mount
  useEffect(() => {
    const fetchCalendarSettings = async () => {
      try {
        const response = await fetch('/api/settings/user')
        if (response.ok) {
          const data = await response.json()
          if (data.calendar_settings) {
            setCalendarSettings(data.calendar_settings)
          }
        }
      } catch (error) {
        console.error("Error fetching calendar settings:", error)
      }
    }

    fetchCalendarSettings()
  }, [])

  // Replace placeholders in text
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/\[Kontakti ettevõte\]/g, contactCompany || '')
      .replace(/\[Kontaktisiku nimi\]/g, contactName || '')
      .replace(/\[Ettevõtte nimi\]/g, 'DigiAgentuur OÜ')
  }

  // Initialize meeting data with initial values or defaults
  const [meetingData, setMeetingData] = useState({
    title: replacePlaceholders(calendarSettings.defaultTitle || "Kohtumine: [Kontakti ettevõte]"),
    date: initialDate || formattedToday,
    time: initialTime || "14:00",
    duration: calendarSettings.defaultDuration || "60",
    location: calendarSettings.defaultLocation || "Google Meet",
    description: replacePlaceholders(calendarSettings.defaultDescription || `Kohtumine ettevõttega [Kontakti ettevõte].\n\nOsalejad:\n- [Ettevõtte nimi]\n- [Kontaktisiku nimi] ([Kontakti ettevõte])`),
    sendInvite: calendarSettings.sendInvite ?? true,
    addReminder: calendarSettings.addReminder ?? true,
    reminderTime: calendarSettings.defaultReminderTime || "15",
  })

  // Update meeting data when initialDate or initialTime change
  useEffect(() => {
    if (initialDate || initialTime) {
      console.log('Updating meeting data with initialDate:', initialDate, 'initialTime:', initialTime)
      setMeetingData(prev => ({
        ...prev,
        date: initialDate || prev.date,
        time: initialTime || prev.time,
      }))
    }
  }, [initialDate, initialTime])

  // Update meeting data when calendar settings change
  useEffect(() => {
    setMeetingData(prev => ({
      ...prev,
      title: replacePlaceholders(calendarSettings.defaultTitle || "Kohtumine: [Kontakti ettevõte]"),
      duration: calendarSettings.defaultDuration || "60",
      location: calendarSettings.defaultLocation || "Google Meet",
      description: replacePlaceholders(calendarSettings.defaultDescription || `Kohtumine ettevõttega [Kontakti ettevõte].\n\nOsalejad:\n- [Ettevõtte nimi]\n- [Kontaktisiku nimi] ([Kontakti ettevõte])`),
      sendInvite: calendarSettings.sendInvite ?? true,
      addReminder: calendarSettings.addReminder ?? true,
      reminderTime: calendarSettings.defaultReminderTime || "15",
    }))
  }, [calendarSettings, contactName, contactCompany])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMeetingData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setMeetingData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setMeetingData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleScheduleGoogleCalendar = () => {
    setIsLoading(true)
    
    // Log the data being used for debugging
    console.log('Scheduling with date:', meetingData.date, 'time:', meetingData.time)

    try {
      // Create a Date object from the selected date and time
      const [year, month, day] = meetingData.date.split('-').map(Number)
      const [hours, minutes] = meetingData.time.split(':').map(Number)
      
      // Create Date objects for start and end times
      const startDate = new Date(year, month - 1, day, hours, minutes)
      const endDate = new Date(startDate.getTime() + parseInt(meetingData.duration) * 60000)
      
      console.log('Start date UTC:', startDate.toISOString())
      console.log('End date UTC:', endDate.toISOString())
      
      // Format dates in the expected format for Google Calendar (YYYYMMDDTHHMMSSZ)
      // Note: We use UTC time (Z) as required by Google Calendar
      const formatGoogleDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '')
      }
      
      const formattedStart = formatGoogleDate(startDate)
      const formattedEnd = formatGoogleDate(endDate)
      
      console.log('Formatted dates for Google Calendar:', formattedStart, formattedEnd)

      // Create Google Calendar URL
      const googleCalendarUrl = new URL("https://calendar.google.com/calendar/render")
      googleCalendarUrl.searchParams.append("action", "TEMPLATE")
      googleCalendarUrl.searchParams.append("text", meetingData.title)
      googleCalendarUrl.searchParams.append("dates", `${formattedStart}/${formattedEnd}`)
      googleCalendarUrl.searchParams.append("details", meetingData.description)
      googleCalendarUrl.searchParams.append("location", meetingData.location)

      if (meetingData.sendInvite && contactEmail) {
        googleCalendarUrl.searchParams.append("add", contactEmail)
      }
      
      console.log('Google Calendar URL:', googleCalendarUrl.toString())

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)

        // Open Google Calendar in a new tab
        window.open(googleCalendarUrl.toString(), "_blank")

        toast({
          title: "Kohtumine lisatud",
          description: "Kohtumine on edukalt lisatud Google kalendrisse.",
        })

        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error creating calendar event:', error)
      toast({
        title: "Viga",
        description: "Kalendrisse lisamisel tekkis viga. Palun proovige uuesti.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  const handleScheduleTeamwave = () => {
    setIsLoading(true)

    // Simulate API call to Teamwave
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Kohtumine lisatud",
        description: "Kohtumine on edukalt lisatud Teamwave'i.",
      })
      onClose()
    }, 1500)
  }

  const handleScheduleMeeting = () => {
    if (activeTab === "google") {
      handleScheduleGoogleCalendar()
    } else {
      handleScheduleTeamwave()
    }
  }

  // Format date for display
  const formattedDate = meetingData.date ? format(new Date(meetingData.date), "EEEE, d. MMMM yyyy", { locale: et }) : ""

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Planeeri kohtumine</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google">Google Calendar</TabsTrigger>
            <TabsTrigger value="teamwave">Teamwave</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Kohtumise pealkiri</Label>
              <Input id="title" name="title" value={meetingData.title} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Kuupäev
                </Label>
                <Input id="date" name="date" type="date" value={meetingData.date} onChange={handleInputChange} />
                {meetingData.date && <p className="text-xs text-muted-foreground">{formattedDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Kellaaeg
                </Label>
                <Input id="time" name="time" type="time" value={meetingData.time} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Kestus (minutites)</Label>
                <Select value={meetingData.duration} onValueChange={(value) => handleSelectChange("duration", value)}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Vali kestus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutit</SelectItem>
                    <SelectItem value="45">45 minutit</SelectItem>
                    <SelectItem value="60">1 tund</SelectItem>
                    <SelectItem value="90">1 tund 30 minutit</SelectItem>
                    <SelectItem value="120">2 tundi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Asukoht
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={meetingData.location}
                  onChange={handleInputChange}
                  placeholder="Google Meet, kontor, jne."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Kirjeldus</Label>
              <Textarea
                id="description"
                name="description"
                value={meetingData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="send-invite" className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Saada kutse
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Saada kutse kontaktile {contactName} ({contactEmail})
                  </p>
                </div>
                <Switch
                  id="send-invite"
                  checked={meetingData.sendInvite}
                  onCheckedChange={(checked) => handleSwitchChange("sendInvite", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="add-reminder">Lisa meeldetuletus</Label>
                  <p className="text-xs text-muted-foreground">Saada meeldetuletus enne kohtumist</p>
                </div>
                <Switch
                  id="add-reminder"
                  checked={meetingData.addReminder}
                  onCheckedChange={(checked) => handleSwitchChange("addReminder", checked)}
                />
              </div>

              {meetingData.addReminder && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Meeldetuletuse aeg</Label>
                  <Select
                    value={meetingData.reminderTime}
                    onValueChange={(value) => handleSelectChange("reminderTime", value)}
                  >
                    <SelectTrigger id="reminder-time">
                      <SelectValue placeholder="Vali aeg" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutit enne</SelectItem>
                      <SelectItem value="15">15 minutit enne</SelectItem>
                      <SelectItem value="30">30 minutit enne</SelectItem>
                      <SelectItem value="60">1 tund enne</SelectItem>
                      <SelectItem value="1440">1 päev enne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="teamwave" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tw-title">Kohtumise pealkiri</Label>
              <Input id="tw-title" name="title" value={meetingData.title} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tw-date" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Kuupäev
                </Label>
                <Input id="tw-date" name="date" type="date" value={meetingData.date} onChange={handleInputChange} />
                {meetingData.date && <p className="text-xs text-muted-foreground">{formattedDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tw-time" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Kellaaeg
                </Label>
                <Input id="tw-time" name="time" type="time" value={meetingData.time} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tw-duration">Kestus (minutites)</Label>
                <Select value={meetingData.duration} onValueChange={(value) => handleSelectChange("duration", value)}>
                  <SelectTrigger id="tw-duration">
                    <SelectValue placeholder="Vali kestus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutit</SelectItem>
                    <SelectItem value="45">45 minutit</SelectItem>
                    <SelectItem value="60">1 tund</SelectItem>
                    <SelectItem value="90">1 tund 30 minutit</SelectItem>
                    <SelectItem value="120">2 tundi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tw-location" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Asukoht
                </Label>
                <Input
                  id="tw-location"
                  name="location"
                  value={meetingData.location}
                  onChange={handleInputChange}
                  placeholder="Google Meet, kontor, jne."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tw-description">Kirjeldus</Label>
              <Textarea
                id="tw-description"
                name="description"
                value={meetingData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Seotud kontakt</Label>
              <div className="p-3 border rounded-md bg-muted/50">
                <p className="font-medium">{contactName}</p>
                <p className="text-sm text-muted-foreground">{contactCompany}</p>
                <p className="text-sm text-muted-foreground">{contactEmail}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tw-add-reminder">Lisa meeldetuletus</Label>
                  <p className="text-xs text-muted-foreground">Saada meeldetuletus enne kohtumist</p>
                </div>
                <Switch
                  id="tw-add-reminder"
                  checked={meetingData.addReminder}
                  onCheckedChange={(checked) => handleSwitchChange("addReminder", checked)}
                />
              </div>

              {meetingData.addReminder && (
                <div className="space-y-2">
                  <Label htmlFor="tw-reminder-time">Meeldetuletuse aeg</Label>
                  <Select
                    value={meetingData.reminderTime}
                    onValueChange={(value) => handleSelectChange("reminderTime", value)}
                  >
                    <SelectTrigger id="tw-reminder-time">
                      <SelectValue placeholder="Vali aeg" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutit enne</SelectItem>
                      <SelectItem value="15">15 minutit enne</SelectItem>
                      <SelectItem value="30">30 minutit enne</SelectItem>
                      <SelectItem value="60">1 tund enne</SelectItem>
                      <SelectItem value="1440">1 päev enne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Tühista
          </Button>
          <Button onClick={handleScheduleMeeting} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Planeerimine...
              </>
            ) : (
              <>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Planeeri kohtumine
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
