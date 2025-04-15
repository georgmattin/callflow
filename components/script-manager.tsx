"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit2, Trash2, Check, Info } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"
import type { Script, Contact } from "@/lib/types"
import { sampleScripts } from "@/lib/sample-scripts"
import { replacePlaceholders } from "@/lib/placeholder-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ScriptManagerProps {
  scripts: Script[]
  onScriptsChange: (scripts: Script[]) => void
}

export default function ScriptManager({ scripts, onScriptsChange }: ScriptManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [newScriptName, setNewScriptName] = useState("")
  const [newScriptContent, setNewScriptContent] = useState("")
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

  const handleAddScript = () => {
    setNewScriptName("")
    setNewScriptContent("<p>Sisesta skripti sisu siia...</p>")
    setIsAddDialogOpen(true)
  }

  const handleEditScript = (script: Script) => {
    setCurrentScript(script)
    setNewScriptName(script.name)
    setNewScriptContent(script.content)
    setIsEditDialogOpen(true)
  }

  const handleDeleteScript = (script: Script) => {
    setCurrentScript(script)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveNewScript = () => {
    if (!newScriptName.trim()) {
      alert("Palun sisesta skripti nimi")
      return
    }

    const newScript: Script = {
      id: `script-${Date.now()}`,
      name: newScriptName,
      content: newScriptContent,
    }

    onScriptsChange([...scripts, newScript])
    setIsAddDialogOpen(false)
  }

  const handleUpdateScript = () => {
    if (!currentScript || !newScriptName.trim()) {
      alert("Palun sisesta skripti nimi")
      return
    }

    const updatedScripts = scripts.map((script) =>
      script.id === currentScript.id
        ? {
            ...script,
            name: newScriptName,
            content: newScriptContent,
          }
        : script,
    )

    onScriptsChange(updatedScripts)
    setIsEditDialogOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!currentScript) return

    const updatedScripts = scripts.filter((script) => script.id !== currentScript.id)
    onScriptsChange(updatedScripts)
    setIsDeleteDialogOpen(false)
  }

  const handleSetDefaultScript = (scriptId: string) => {
    const updatedScripts = scripts.map((script) => ({
      ...script,
      isDefault: script.id === scriptId,
    }))

    onScriptsChange(updatedScripts)
  }

  const handleLoadSampleScripts = () => {
    onScriptsChange(sampleScripts)
  }

  // Get the script to preview (default or first)
  const scriptToPreview = scripts.find((script) => script.isDefault) || scripts[0]

  // Replace placeholders in the preview with sample data
  const previewContent = scriptToPreview
    ? replacePlaceholders(scriptToPreview.content, {
        contact: sampleContact,
        callerCompany: "DigiAgentuur OÜ",
        meetingDate: new Date().toISOString(),
        meetingTime: "14:00",
      })
    : ""

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Müügiskriptid</h2>
        <div className="space-x-2">
          {scripts.length === 0 && (
            <Button onClick={handleLoadSampleScripts} variant="outline">
              Lae näidisskriptid
            </Button>
          )}
          <Button onClick={handleAddScript}>
            <Plus className="h-4 w-4 mr-2" />
            Lisa uus skript
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="view">Vaata skripte</TabsTrigger>
          <TabsTrigger value="preview">Eelvaade</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          {scripts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Skriptide nimekiri on tühi.</p>
                  <Button onClick={handleAddScript}>
                    <Plus className="h-4 w-4 mr-2" />
                    Lisa uus skript
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {scripts.map((script) => (
                <Card key={script.id} className={script.isDefault ? "border-green-500" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{script.name}</span>
                      {script.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Vaikimisi</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-24 overflow-hidden text-sm text-gray-500">
                      <div
                        className="prose prose-sm line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: script.content }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditScript(script)}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Muuda
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteScript(script)}
                        disabled={scripts.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Kustuta
                      </Button>
                    </div>
                    {!script.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultScript(script.id)}
                        className="text-green-600"
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
          {scripts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">Skriptide nimekiri on tühi.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{scriptToPreview?.name}</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        See on skripti eelvaade näidisandmetega. Helistamise ajal asendatakse väljad automaatselt
                        kontakti andmetega.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewContent }} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Script Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Lisa uus skript</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="script-name" className="text-right">
                Nimi:
              </Label>
              <Input
                id="script-name"
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                className="col-span-3"
                placeholder="Sisesta skripti nimi"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="script-content" className="text-right pt-2">
                Sisu:
              </Label>
              <div className="col-span-3 h-[500px] flex-1 overflow-hidden">
                <RichTextEditor content={newScriptContent} onChange={setNewScriptContent} className="h-full flex-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Tühista
            </Button>
            <Button onClick={handleSaveNewScript}>Salvesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Script Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Muuda skripti</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-script-name" className="text-right">
                Nimi:
              </Label>
              <Input
                id="edit-script-name"
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="edit-script-content" className="text-right pt-2">
                Sisu:
              </Label>
              <div className="col-span-3 h-[500px] flex-1 overflow-hidden">
                <RichTextEditor content={newScriptContent} onChange={setNewScriptContent} className="h-full flex-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Tühista
            </Button>
            <Button onClick={handleUpdateScript}>Salvesta muudatused</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kustuta skript</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Kas olete kindel, et soovite kustutada skripti "{currentScript?.name}"? Seda tegevust ei saa tagasi võtta.
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
    </div>
  )
}
