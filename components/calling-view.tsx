"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, X, ArrowRight, Globe, Mail, Calendar, Clock, Edit2, Save, XCircle, AlertCircle, Flag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import RichTextEditor from "@/components/rich-text-editor"
import type { Contact, Script, EmailTemplate } from "@/lib/types"
import { replacePlaceholders } from "@/lib/placeholder-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

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
}

export default function CallingView({
  contact,
  scripts,
  emailTemplates,
  onSaveAndNext,
  onExit,
  onUpdateContact,
  progress,
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

  // Get default script or first script
  const defaultScript = scripts.find((script) => script.isDefault) || scripts[0]
  const [selectedScriptId, setSelectedScriptId] = useState(defaultScript?.id || "")

  // Get default email template or first template
  const defaultEmailTemplate = emailTemplates.find((template) => template.isDefault) || emailTemplates[0]

  // Caller's company name (constant)
  const CALLER_COMPANY = "DigiAgentuur OÜ"

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

    onSaveAndNext(notes, callResult, meetingDate, meetingTime, callbackDate, callbackTime, callbackReason)

    setNotes("")
    setCallResult("")
    setMeetingDate("")
    setMeetingTime("")
    setCallbackDate("")
    setCallbackTime("")
    setCallbackReason("")
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
  }

  const handleSendEmail = () => {
    // Set default email template based on call result
    let templateToUse = defaultEmailTemplate

    if (callResult === "Kohtumine") {
      const meetingTemplate = emailTemplates.find((t) => t.name.toLowerCase().includes("kohtumine"))
      if (meetingTemplate) templateToUse = meetingTemplate
    } else if (callResult === "Saada info") {
      const infoTemplate = emailTemplates.find((t) => t.name.toLowerCase().includes("info"))
      if (infoTemplate) templateToUse = infoTemplate
    }

    setSelectedEmailTemplateId(templateToUse?.id || "")

    // Apply the template with placeholders replaced
    const subject = replacePlaceholders(templateToUse.subject, {
      contact,
      callerCompany: CALLER_COMPANY,
      meetingDate,
      meetingTime,
    })

    const content = replacePlaceholders(templateToUse.content, {
      contact,
      callerCompany: CALLER_COMPANY,
      meetingDate,
      meetingTime,
    })

    setEmailSubject(subject)
    setEmailBody(content)
    setIsEmailModalOpen(true)
  }

  const handleEmailTemplateChange = (templateId: string) => {
    const selectedTemplate = emailTemplates.find((template) => template.id === templateId)
    if (selectedTemplate) {
      setSelectedEmailTemplateId(templateId)
      setEmailSubject(
        replacePlaceholders(selectedTemplate.subject, {
          contact,
          callerCompany: CALLER_COMPANY,
          meetingDate,
          meetingTime,
        }),
      )
      setEmailBody(
        replacePlaceholders(selectedTemplate.content, {
          contact,
          callerCompany: CALLER_COMPANY,
          meetingDate,
          meetingTime,
        }),
      )
    }
  }

  const handleSendEmailAction = () => {
    // In a real app, this would send the email via API
    // For demo purposes, we'll use mailto with plain text (stripping HTML)
    const plainTextBody = emailBody.replace(/<[^>]*>?/gm, "")
    const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(plainTextBody)}`
    window.open(mailtoLink, "_blank")
    setIsEmailModalOpen(false)
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
        <CardHeader className="bg-gray-50 border-b">
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
            <span className="text-sm font-normal text-gray-500">{progress}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 max-h-[600px] overflow-y-auto">
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: scriptContent }} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex justify-between items-center">
              <span>Kontakti info</span>
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
                    <Label htmlFor="contact-notes">Märkmed</Label>
                    <Textarea
                      id="contact-notes"
                      value={editedContact.notes || ""}
                      onChange={(e) => setEditedContact({ ...editedContact, notes: e.target.value })}
                      placeholder="Lisa märkmed kontakti kohta..."
                      className="resize-none"
                      rows={4}
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
                        <SelectItem value="High">Kõrge</SelectItem>
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
                      <p className="text-sm font-medium text-gray-500">Ettevõte</p>
                      <p className="font-medium">{contact.company}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Kontaktisik</p>
                      <p className="font-medium">{contact.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefon</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {contact.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">E-post</p>
                      <p className="font-medium">{contact.email}</p>
                    </div>
                  </div>

                  {contact.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Veebileht</p>
                      <p className="font-medium flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        <a
                          href={`https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {contact.website}
                        </a>
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prioriteet</p>
                    <Badge
                      className={
                        contact.priority === "High"
                          ? "bg-green-100 text-green-800"
                          : contact.priority === "Low"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                      }
                    >
                      <Flag className={`h-3 w-3 mr-1 ${contact.priority === "High" ? "text-green-600" : contact.priority === "Low" ? "text-gray-600" : "text-blue-600"}`} />
                      {contact.priority === "High" ? "Kõrge" : contact.priority === "Low" ? "Madal" : "Tavaline"}
                    </Badge>
                  </div>

                  {contact.notes && contact.notes.trim() !== "" && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Märkmed</p>
                      <p className="font-medium whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}
                  
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Kõne tulemus</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">Märkmed</label>
                <Textarea
                  placeholder="Sisesta kõne märkmed siia..."
                  className="min-h-[120px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">Tulemus</label>
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
            <Button onClick={handleSaveAndNext} className="bg-green-600 hover:bg-green-700">
              Salvesta & Järgmine
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
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
                <Select value={selectedEmailTemplateId} onValueChange={handleEmailTemplateChange}>
                  <SelectTrigger>
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
            <Button onClick={handleSendEmailAction}>
              <Mail className="h-4 w-4 mr-2" />
              Saada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
