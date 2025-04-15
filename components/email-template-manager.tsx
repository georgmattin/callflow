"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit2, Trash2, Check, Info, Settings } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"
import EmailSignatureEditor from "@/components/email-signature-editor"
import type { EmailTemplate, Contact } from "@/lib/types"
import { sampleEmailTemplates } from "@/lib/sample-emails"
import { replacePlaceholders } from "@/lib/placeholder-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EmailTemplateManagerProps {
  emailTemplates: EmailTemplate[]
  onEmailTemplatesChange: (emailTemplates: EmailTemplate[]) => void
  signature?: string
  onSignatureChange?: (signature: string) => void
}

export default function EmailTemplateManager({
  emailTemplates,
  onEmailTemplatesChange,
  signature = "",
  onSignatureChange = () => {},
}: EmailTemplateManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateSubject, setNewTemplateSubject] = useState("")
  const [newTemplateContent, setNewTemplateContent] = useState("")
  const [newTemplateCallResult, setNewTemplateCallResult] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("view")

  // Sample contact data for preview
  const sampleContact: Contact = {
    id: "sample-contact",
    company: "Näidisettevõte OÜ",
    name: "Mart Maasikas",
    phone: "+372 5123 4567",
    email: "mart@naidisettevote.ee",
    website: "www.naidisettevote.ee",
    status: "Uus",
    notes: "",
    lastCallDate: null,
  }

  // Define available call result options
  const callResultOptions = [
    { label: "Pole seotud", value: "none" },
    { label: "Kohtumine", value: "Kohtumine" },
    { label: "Saada info", value: "Saada info" },
    { label: "Helista hiljem", value: "Helista hiljem" },
    { label: "Ei vastanud", value: "Ei vastanud" },
    { label: "Pole huvitatud", value: "Pole huvitatud" },
  ]

  const handleAddTemplate = () => {
    setNewTemplateName("")
    setNewTemplateSubject("")
    setNewTemplateContent("<p>Sisesta e-kirja sisu siia...</p>")
    setIsAddDialogOpen(true)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template)
    setNewTemplateName(template.name)
    setNewTemplateSubject(template.subject)
    setNewTemplateContent(template.content)
    setNewTemplateCallResult(template.callResult || "none")
    setIsEditDialogOpen(true)
  }

  const handleDeleteTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveNewTemplate = () => {
    if (!newTemplateName.trim()) {
      alert("Palun sisesta e-kirja malli nimi")
      return
    }

    const newTemplate: EmailTemplate = {
      id: `email-${Date.now()}`,
      name: newTemplateName,
      subject: newTemplateSubject,
      content: newTemplateContent,
      callResult: newTemplateCallResult === "none" ? undefined : newTemplateCallResult,
    }

    onEmailTemplatesChange([...emailTemplates, newTemplate])
    setIsAddDialogOpen(false)
  }

  const handleUpdateTemplate = () => {
    if (!currentTemplate || !newTemplateName.trim()) {
      alert("Palun sisesta e-kirja malli nimi")
      return
    }

    const updatedTemplates = emailTemplates.map((template) =>
      template.id === currentTemplate.id
        ? {
            ...template,
            name: newTemplateName,
            subject: newTemplateSubject,
            content: newTemplateContent,
            callResult: newTemplateCallResult === "none" ? undefined : newTemplateCallResult,
          }
        : template,
    )

    onEmailTemplatesChange(updatedTemplates)
    setIsEditDialogOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!currentTemplate) return

    const updatedTemplates = emailTemplates.filter((template) => template.id !== currentTemplate.id)
    onEmailTemplatesChange(updatedTemplates)
    setIsDeleteDialogOpen(false)
  }

  const handleSetDefaultTemplate = (templateId: string) => {
    const updatedTemplates = emailTemplates.map((template) => ({
      ...template,
      isDefault: template.id === templateId,
    }))

    onEmailTemplatesChange(updatedTemplates)
  }

  const handleLoadSampleTemplates = () => {
    onEmailTemplatesChange(sampleEmailTemplates)
  }

  const handleSaveSignature = (newSignature: string) => {
    onSignatureChange(newSignature)
    setIsSignatureDialogOpen(false)
  }

  // Get the template to preview (default or first)
  const templateToPreview = emailTemplates.find((template) => template.isDefault) || emailTemplates[0]

  // Replace placeholders in the preview with sample data
  const previewSubject = templateToPreview
    ? replacePlaceholders(templateToPreview.subject, {
        contact: sampleContact,
        callerCompany: "DigiAgentuur OÜ",
        meetingDate: new Date().toISOString(),
        meetingTime: "14:00",
      })
    : ""

  // Combine template content with signature for preview
  const previewContent = templateToPreview
    ? replacePlaceholders(templateToPreview.content + (signature ? signature : ""), {
        contact: sampleContact,
        callerCompany: "DigiAgentuur OÜ",
        meetingDate: new Date().toISOString(),
        meetingTime: "14:00",
      })
    : ""

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">E-kirja mallid</h2>
        <div className="space-x-2">
          {emailTemplates.length === 0 && (
            <Button onClick={handleLoadSampleTemplates} variant="outline">
              Lae näidismallid
            </Button>
          )}
          <Button onClick={() => setIsSignatureDialogOpen(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Halda allkirja
          </Button>
          <Button onClick={handleAddTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Lisa uus mall
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="view">Vaata malle</TabsTrigger>
          <TabsTrigger value="preview">Eelvaade</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          {emailTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">E-kirja mallide nimekiri on tühi.</p>
                  <Button onClick={handleAddTemplate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Lisa uus mall
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {emailTemplates.map((template) => (
                <Card key={template.id} className={template.isDefault ? "border-green-500" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{template.name}</span>
                      {template.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded-full">
                          Vaikimisi
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Teema:</p>
                    <p className="text-sm mb-2">{template.subject}</p>
                    {template.callResult && (
                      <p className="text-xs mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded inline-block">
                        Kõne tulemus: {template.callResult}
                      </p>
                    )}
                    <div className="h-24 overflow-hidden text-sm text-gray-500 dark:text-gray-400">
                      <div
                        className="prose prose-sm dark:prose-invert line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: template.content }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Muuda
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template)}
                        disabled={emailTemplates.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Kustuta
                      </Button>
                    </div>
                    {!template.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultTemplate(template.id)}
                        className="text-green-600 dark:text-green-500"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Määra vaikimisi
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview">
          {emailTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">E-kirja mallide nimekiri on tühi.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{templateToPreview?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Teema: {previewSubject}</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        See on e-kirja malli eelvaade näidisandmetega. E-kirja saatmisel asendatakse väljad automaatselt
                        kontakti andmetega.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Template Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Lisa uus e-kirja mall</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Nimi:
              </Label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="col-span-3"
                placeholder="Sisesta malli nimi"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-subject" className="text-right">
                Teema:
              </Label>
              <Input
                id="template-subject"
                value={newTemplateSubject}
                onChange={(e) => setNewTemplateSubject(e.target.value)}
                className="col-span-3"
                placeholder="Sisesta e-kirja teema"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-call-result" className="text-right">
                Kõne tulemus:
              </Label>
              <div className="col-span-3">
                <Select 
                  value={newTemplateCallResult || "none"} 
                  onValueChange={(value) => setNewTemplateCallResult(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vali kõne tulemus" />
                  </SelectTrigger>
                  <SelectContent>
                    {callResultOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Kui valite kõne tulemuse, siis see mall valitakse automaatselt kui kõne tulemus on määratud
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="template-content" className="text-right pt-2">
                Sisu:
              </Label>
              <div className="col-span-3 h-[500px] flex-1 overflow-hidden">
                <RichTextEditor
                  content={newTemplateContent}
                  onChange={setNewTemplateContent}
                  className="h-full flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Tühista
            </Button>
            <Button onClick={handleSaveNewTemplate}>Salvesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Muuda e-kirja malli</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-template-name" className="text-right">
                Nimi:
              </Label>
              <Input
                id="edit-template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-template-subject" className="text-right">
                Teema:
              </Label>
              <Input
                id="edit-template-subject"
                value={newTemplateSubject}
                onChange={(e) => setNewTemplateSubject(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-template-call-result" className="text-right">
                Kõne tulemus:
              </Label>
              <div className="col-span-3">
                <Select 
                  value={newTemplateCallResult || "none"} 
                  onValueChange={(value) => setNewTemplateCallResult(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vali kõne tulemus" />
                  </SelectTrigger>
                  <SelectContent>
                    {callResultOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Kui valite kõne tulemuse, siis see mall valitakse automaatselt kui kõne tulemus on määratud
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="edit-template-content" className="text-right pt-2">
                Sisu:
              </Label>
              <div className="col-span-3 h-[500px] flex-1 overflow-hidden">
                <RichTextEditor
                  content={newTemplateContent}
                  onChange={setNewTemplateContent}
                  className="h-full flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Tühista
            </Button>
            <Button onClick={handleUpdateTemplate}>Salvesta muudatused</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kustuta e-kirja mall</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Kas olete kindel, et soovite kustutada e-kirja malli "{currentTemplate?.name}"? Seda tegevust ei saa
              tagasi võtta.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Tühista
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Kustuta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Signature Editor Dialog */}
      <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E-kirja allkirja seaded</DialogTitle>
          </DialogHeader>
          <EmailSignatureEditor initialSignature={signature} onSave={handleSaveSignature} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
