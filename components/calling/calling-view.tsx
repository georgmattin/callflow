"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Phone,
  X,
  ArrowRight,
  Globe,
  Mail,
  Calendar,
  Clock,
  Edit2,
  Save,
  XCircle,
  AlertCircle,
  CalendarPlus,
  ExternalLink,
  FileText,
  CheckCircle,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Search,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import RichTextEditor from "@/components/rich-text-editor"
import type { Contact, Script, EmailTemplate } from "@/lib/types"
import { replacePlaceholders } from "@/lib/placeholder-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import MeetingScheduler from "@/components/meeting-scheduler"
import { toast } from "@/components/ui/use-toast"
import { sendEmail, getStoredEmailSignature } from "@/lib/email-utils"

interface CallingViewProps {
  contact: Contact
  scripts: Script[]
  emailTemplates: EmailTemplate[]
  onSaveAndNext: (
    notes: string,
    result: string,
    meetingDate?: string,
    meetingTime?: string,
    callbackDate?: string,
    callbackTime?: string,
    callbackReason?: string,
  ) => void
  onExit: () => void
  onUpdateContact: (updatedContact: Contact) => void
  progress: string
  singleContactMode?: boolean
}

export default function CallingView({
  contact,
  scripts,
  emailTemplates,
  onSaveAndNext,
  onExit,
  onUpdateContact,
  progress,
  singleContactMode = false,
}: CallingViewProps) {
  const [notes, setNotes] = useState("")
  const [callResult, setCallResult] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [callbackDate, setCallbackDate] = useState("")
  const [callbackTime, setCallbackTime] = useState("")
  const [callbackReason, setCallbackReason] = useState("")
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [editedContact, setEditedContact] = useState({ ...contact })
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState("")
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isCallCompleted, setIsCallCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get default script or first script
  const defaultScript = scripts.find((script) => script.isDefault) || scripts[0]
  const [selectedScriptId, setSelectedScriptId] = useState(defaultScript?.id || "")

  // Get default email template or first template
  const defaultEmailTemplate = emailTemplates.find((template) => template.isDefault) || emailTemplates[0]

  // Caller's company name (constant)
  const CALLER_COMPANY = "DigiAgentuur OÜ"

  // Effect to update email content when template changes
  useEffect(() => {
    // Skip if no template is selected yet
    if (!selectedEmailTemplateId) return;
    
    console.log("useEffect triggered with template ID:", selectedEmailTemplateId);
    
    // Find the selected template
    const selectedTemplate = emailTemplates.find(template => template.id === selectedEmailTemplateId);
    if (!selectedTemplate) {
      console.error("Template not found for ID:", selectedEmailTemplateId);
      return;
    }
    
    console.log("Applying template in useEffect:", selectedTemplate.name);
    
    // Apply the template with placeholders replaced
    const subject = replacePlaceholders(selectedTemplate.subject, {
      contact,
      callerCompany: CALLER_COMPANY,
      meetingDate,
      meetingTime,
    });
    
    const content = replacePlaceholders(selectedTemplate.content, {
      contact,
      callerCompany: CALLER_COMPANY,
      meetingDate,
      meetingTime,
    });
    
    // Update the email content
    setEmailSubject(subject);
    setEmailBody(content);
    
  }, [selectedEmailTemplateId, contact, emailTemplates, CALLER_COMPANY, meetingDate, meetingTime]);

  // Set default template when modal opens
  useEffect(() => {
    if (isEmailModalOpen && !selectedEmailTemplateId && emailTemplates.length > 0) {
      // Find the default template or use the first one
      const defaultTemplate = emailTemplates.find((template) => template.isDefault) || emailTemplates[0];
      console.log("Setting default template when modal opens:", defaultTemplate?.name);
      setSelectedEmailTemplateId(defaultTemplate.id);
    }
  }, [isEmailModalOpen, selectedEmailTemplateId, emailTemplates]);

  const handleSaveAndNext = () => {
    if (!callResult) {
      alert("Palun valige kõne tulemus")
      return
    }

    // Validate callback date and time if "Helista hiljem" is selected
    if (callResult === "Helista hiljem" && (!callbackDate || !callbackTime)) {
      alert("Palun määrake tagasihelistamise kuupäev ja kellaaeg")
      return
    }

    // Validate meeting date and time if "Kohtumine" is selected
    if (callResult === "Kohtumine" && (!meetingDate || !meetingTime)) {
      alert("Palun määrake kohtumise kuupäev ja kellaaeg")
      return
    }
    
    // First save data for all call results
    onSaveAndNext(notes, callResult, meetingDate, meetingTime, callbackDate, callbackTime, callbackReason)
    
    // If it's a meeting, set call as completed to show the schedule meeting button
    if (callResult === "Kohtumine") {
      setIsCallCompleted(true)
    } else {
      // If not a meeting, reset the form
      resetForm()
    }
  }

  const resetForm = () => {
    setNotes("")
    setCallResult("")
    setMeetingDate("")
    setMeetingTime("")
    setCallbackDate("")
    setCallbackTime("")
    setCallbackReason("")
    setIsCallCompleted(false)
  }

  const handleProceedToNext = () => {
    // No need to call onSaveAndNext again, data is already saved
    resetForm()
  }

  const handleCallResultChange = (value: string) => {
    setCallResult(value)

    // If meeting is selected, set default meeting date to tomorrow
    if (value === "Kohtumine" && !meetingDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setMeetingDate(tomorrow.toISOString().split("T")[0])
      setMeetingTime("14:00")
    }

    // If call later is selected, set default callback date to tomorrow
    if (value === "Helista hiljem" && !callbackDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setCallbackDate(tomorrow.toISOString().split("T")[0])
      setCallbackTime("10:00")
    }
    
    // Auto-select email template based on call result
    const matchingTemplate = emailTemplates.find(template => template.callResult === value);
    if (matchingTemplate) {
      console.log(`Automaatselt valitud e-kirja mall "${matchingTemplate.name}" kõne tulemusele "${value}"`);
      setSelectedEmailTemplateId(matchingTemplate.id);
    } else {
      console.log(`Kõne tulemusele "${value}" ei leitud vastavat e-kirja malli`);
    }
  }

  const handleSendEmail = () => {
    // First check if there's a template associated with the current call result
    let templateToUse = emailTemplates.find(template => template.callResult === callResult);
    
    // If no specific template for this call result, use default or first template
    if (!templateToUse) {
      templateToUse = emailTemplates.find((template) => template.isDefault) || emailTemplates[0];
      console.log("Ei leitud kõne tulemusele vastavat malli, kasutame vaikimisi malli:", templateToUse?.name);
    } else {
      console.log(`Kasutame kõne tulemusele "${callResult}" vastavat malli:`, templateToUse.name);
    }

    if (!templateToUse) {
      console.error("Ühtegi e-kirja malli ei leitud");
      return;
    }

    // Set the selected template ID - useEffect will handle updating the content
    setSelectedEmailTemplateId(templateToUse.id);
    
    // Open the email modal
    setIsEmailModalOpen(true);
  };

  const handleEmailTemplateChange = (templateId: string) => {
    console.log("Template change requested for ID:", templateId);
    
    // Simply update the selected template ID
    // The useEffect hook will handle updating the email content
    setSelectedEmailTemplateId(templateId);
  };

  const handleSendEmailAction = async () => {
    // Show loading state
    setIsLoading(true);
    
    try {
      // Call the email utility to send the email
      const { success, error } = await sendEmail(
        contact.email,
        emailSubject,
        emailBody,
        getStoredEmailSignature(),
        contact.company
      );
      
      if (success) {
        toast({
          title: "E-kiri saadetud",
          description: `E-kiri aadressile ${contact.email} on edukalt saadetud.`,
        });
        setIsEmailModalOpen(false);
      } else {
        toast({
          title: "Viga e-kirja saatmisel",
          description: error || "E-kirja saatmisel tekkis viga. Proovige uuesti.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Viga e-kirja saatmisel",
        description: "E-kirja saatmisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditContact = () => {
    setIsEditingContact(true)
    setEditedContact({ ...contact })
  }

  const handleSaveContactChanges = () => {
    onUpdateContact(editedContact)
    setIsEditingContact(false)
  }

  const handleCancelEditContact = () => {
    setIsEditingContact(false)
    setEditedContact({ ...contact })
  }

  const handleOpenScheduler = () => {
    setIsSchedulerOpen(true)
  }

  const handleCloseScheduler = () => {
    setIsSchedulerOpen(false)
    // After scheduling, just reset the form
    resetForm()
  }

  // Get the selected script
  const selectedScript = scripts.find((script) => script.id === selectedScriptId) || defaultScript

  // Replace placeholders in the script with actual contact data
  const scriptContent = replacePlaceholders(selectedScript.content, {
    contact,
    callerCompany: CALLER_COMPANY,
    meetingDate,
    meetingTime,
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("et-EE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
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
    <div className="grid md:grid-cols-2 gap-6 relative">
      <Button variant="ghost" size="icon" className="absolute right-0 top-0 z-10" onClick={onExit}>
        <XCircle className="h-6 w-6" />
      </Button>

      {contact.requeued && (
        <Alert className="absolute left-0 top-0 z-10 bg-yellow-50 border-yellow-200 max-w-md">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            See kontakt on uuesti järjekorda lisatud, kuna eelmine kõne jäi vastuseta.
          </AlertDescription>
        </Alert>
      )}

      {contact.callbackDate && (
        <Alert className="absolute left-0 top-0 z-10 bg-blue-50 border-blue-200 max-w-md">
          <Calendar className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Tagasihelistamine planeeritud: {formatDate(contact.callbackDate)} kell {contact.callbackTime}
            {contact.callbackReason && <div className="mt-1 text-sm italic">"{contact.callbackReason}"</div>}
          </AlertDescription>
        </Alert>
      )}

      <Card className="h-fit">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Müügiskript:</span>
              <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Vali skript" />
                </SelectTrigger>
                <SelectContent>
                  {scripts.map((script) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="text-sm font-normal">
              {progress}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 max-h-[600px] overflow-y-auto">
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: scriptContent }} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <span>Kontakti info</span>
              </div>
              {!isEditingContact ? (
                <Button variant="ghost" size="sm" onClick={handleEditContact}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Muuda
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleCancelEditContact}>
                    <X className="h-4 w-4 mr-1" />
                    Tühista
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSaveContactChanges}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvesta
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {isEditingContact ? (
                // Editing mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Ettevõte</Label>
                      <Input
                        id="company"
                        value={editedContact.company}
                        onChange={(e) => setEditedContact({ ...editedContact, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Kontaktisik</Label>
                      <Input
                        id="name"
                        value={editedContact.name}
                        onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={editedContact.phone}
                        onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-post</Label>
                      <Input
                        id="email"
                        value={editedContact.email}
                        onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Veebileht</Label>
                    <Input
                      id="website"
                      value={editedContact.website || ""}
                      onChange={(e) => setEditedContact({ ...editedContact, website: e.target.value || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrikood">Registrikood</Label>
                    <Input
                      id="registrikood"
                      value={editedContact.registrikood || ""}
                      onChange={(e) =>
                        setEditedContact({ ...editedContact, registrikood: e.target.value || undefined })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Märkmed</Label>
                    <Textarea
                      id="notes"
                      value={editedContact.notes || ""}
                      onChange={(e) => setEditedContact({ ...editedContact, notes: e.target.value })}
                      placeholder="Lisa märkmed kontakti kohta..."
                      className="resize-none h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Prioriteet</Label>
                    <Select 
                      value={editedContact.priority || "Normal"} 
                      onValueChange={(value) => setEditedContact({ ...editedContact, priority: value })}
                    >
                      <SelectTrigger id="edit-priority">
                        <SelectValue placeholder="Vali prioriteet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unreviewed">Ülevaatamata</SelectItem>
                        <SelectItem value="High">Kõrge</SelectItem>
                        <SelectItem value="Medium">Keskmine</SelectItem>
                        <SelectItem value="Normal">Tavaline</SelectItem>
                        <SelectItem value="Low">Madal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ettevõte</p>
                      <p className="font-medium">{contact.company}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Kontaktisik</p>
                      <p className="font-medium">{contact.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                        {contact.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">E-post</p>
                      <p className="font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                        {contact.email}
                      </p>
                    </div>
                  </div>

                  {contact.website && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Veebileht</p>
                      <p className="font-medium flex items-center">
                        <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                        <a
                          href={`https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {contact.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {contact.registrikood && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Teatmik</p>
                      <p className="font-medium flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1 text-muted-foreground" />
                        <a
                          href={`https://www.teatmik.ee/et/personlegal/${contact.registrikood}-${contact.company.replace(/\s+/g, "-")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Vaata Teatmikus
                        </a>
                      </p>
                    </div>
                  )}
                  
                  {/* Prioriteedi väli */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prioriteet</p>
                    <Badge
                      className={
                        contact.priority === "Unreviewed"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : contact.priority === "High"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : contact.priority === "Medium"
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : contact.priority === "Low"
                                      ? "bg-gray-100 text-gray-800 border-gray-200"
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {contact.priority === "Unreviewed" ? "Ülevaatamata" :
                       contact.priority === "High" ? "Kõrge" : 
                       contact.priority === "Medium" ? "Keskmine" :
                       contact.priority === "Low" ? "Madal" : 
                       "Tavaline"}
                    </Badge>
                  </div>

                  {/* Märkmete väli */}
                  {contact.notes && contact.notes.trim() !== "" && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Märkmed</p>
                      <p className="font-medium whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Google otsing</p>
                    <p className="font-medium flex items-center">
                      <Search className="h-4 w-4 mr-1 text-muted-foreground" />
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(contact.company)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Otsi Googlest
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {isCallCompleted ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="bg-green-100/50 border-b border-green-200">
              <CardTitle className="text-green-800">Kohtumine kokku lepitud</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium">{formatDate(meetingDate)}</span>
                  <Clock className="h-5 w-5 mx-2 text-green-600" />
                  <span className="font-medium">{meetingTime}</span>
                </div>

                <p className="text-sm">Kohtumine on salvestatud. Kas soovite lisada kohtumise kalendrisse?</p>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={handleProceedToNext}>
                    Jätka ilma kalendrisse lisamata
                  </Button>
                  <Button onClick={handleOpenScheduler} className="bg-green-600 hover:bg-green-700">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Lisa Google kalendrisse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle>Kõne tulemus</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Märkmed</label>
                  <Textarea
                    placeholder="Sisesta kõne märkmed siia..."
                    className="min-h-[120px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Tulemus</label>
                  <Select value={callResult} onValueChange={handleCallResultChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vali kõne tulemus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kohtumine">Kohtumine</SelectItem>
                      <SelectItem value="Saada info">Saada info</SelectItem>
                      <SelectItem value="Ei vastanud">Ei vastanud</SelectItem>
                      <SelectItem value="Pole huvitatud">Pole huvitatud</SelectItem>
                      <SelectItem value="Helista hiljem">Helista hiljem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {callResult === "Kohtumine" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meeting-date" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Kohtumise kuupäev
                      </Label>
                      <Input
                        id="meeting-date"
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meeting-time" className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Kohtumise kellaaeg
                      </Label>
                      <Input
                        id="meeting-time"
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {callResult === "Helista hiljem" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="callback-date" className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Tagasihelistamise kuupäev
                        </Label>
                        <Input
                          id="callback-date"
                          type="date"
                          value={callbackDate}
                          onChange={(e) => setCallbackDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="callback-time" className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Tagasihelistamise kellaaeg
                        </Label>
                        <Input
                          id="callback-time"
                          type="time"
                          value={callbackTime}
                          onChange={(e) => setCallbackTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="callback-reason" className="flex items-center">
                        Tagasihelistamise põhjus
                      </Label>
                      <Input
                        id="callback-reason"
                        placeholder="Nt: Kontaktisik on koosolekul, palus helistada homme"
                        value={callbackReason}
                        onChange={(e) => setCallbackReason(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-center pt-2">
                  <Button variant="outline" className="w-full" onClick={handleSendEmail} disabled={!callResult}>
                    <Mail className="h-4 w-4 mr-2" />
                    Saada e-kiri
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={onExit}>
                <X className="h-4 w-4 mr-2" />
                Lõpeta helistamine
              </Button>
              <Button onClick={handleSaveAndNext} className="bg-primary hover:bg-primary/90">
                {singleContactMode ? "Salvesta" : "Salvesta & Järgmine"}
                {!singleContactMode && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Email Modal with Rich Text Editor */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Saada e-kiri</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-6 items-center gap-4">
              <Label htmlFor="email-to" className="text-right">
                Saaja:
              </Label>
              <Input id="email-to" value={contact.email} className="col-span-5" readOnly />
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <Label htmlFor="email-template" className="text-right">
                Mall:
              </Label>
              <div className="col-span-5">
                <Select 
                  value={selectedEmailTemplateId} 
                  onValueChange={handleEmailTemplateChange}
                >
                  <SelectTrigger id="email-template">
                    <SelectValue placeholder="Vali e-kirja mall" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-6 items-center gap-4">
              <Label htmlFor="email-subject" className="text-right">
                Teema:
              </Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="col-span-5"
              />
            </div>
            <div className="grid grid-cols-6 gap-4">
              <Label htmlFor="email-body" className="text-right pt-2">
                Sisu:
              </Label>
              <div className="col-span-5 h-[400px] overflow-hidden">
                <RichTextEditor content={emailBody} onChange={setEmailBody} className="h-full" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
              Tühista
            </Button>
            <Button onClick={handleSendEmailAction} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saadan...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Saada
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Scheduler Modal */}
      <MeetingScheduler
        isOpen={isSchedulerOpen}
        onClose={handleCloseScheduler}
        contactName={contact.name}
        contactEmail={contact.email}
        contactCompany={contact.company}
        initialDate={meetingDate}
        initialTime={meetingTime}
      />
    </div>
  )
}
