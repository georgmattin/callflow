"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Edit2, Trash2, Plus, List } from "lucide-react"
import type { ContactList } from "@/lib/types"

interface ContactListSelectorProps {
  contactLists: ContactList[]
  selectedListId: string | null
  onSelectList: (listId: string) => void
  onRenameList: (listId: string, newName: string) => void
  onDeleteList: (listId: string) => void
  onCreateEmptyList: (name: string) => void
}

export default function ContactListSelector({
  contactLists,
  selectedListId,
  onSelectList,
  onRenameList,
  onDeleteList,
  onCreateEmptyList,
}: ContactListSelectorProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [listToModify, setListToModify] = useState<ContactList | null>(null)
  const [newListName, setNewListName] = useState("")

  const selectedList = contactLists.find((list) => list.id === selectedListId) || null

  const handleOpenRenameDialog = (list: ContactList) => {
    setListToModify(list)
    setNewListName(list.name)
    setIsRenameDialogOpen(true)
  }

  const handleOpenDeleteDialog = (list: ContactList) => {
    setListToModify(list)
    setIsDeleteDialogOpen(true)
  }

  const handleRename = () => {
    if (listToModify && newListName.trim()) {
      onRenameList(listToModify.id, newListName)
      setIsRenameDialogOpen(false)
    }
  }

  const handleDelete = () => {
    if (listToModify) {
      onDeleteList(listToModify.id)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateEmptyList(newListName)
      setIsCreateDialogOpen(false)
      setNewListName("")
    }
  }

  const openCreateDialog = () => {
    setNewListName("")
    setIsCreateDialogOpen(true)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-between">
                <div className="flex items-center">
                  <List className="h-4 w-4 mr-2" />
                  {selectedList ? selectedList.name : "Vali nimekiri"}
                </div>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {contactLists.length === 0 ? (
                <DropdownMenuItem disabled>Nimekirjad puuduvad</DropdownMenuItem>
              ) : (
                contactLists.map((list) => (
                  <DropdownMenuItem
                    key={list.id}
                    onClick={() => onSelectList(list.id)}
                    className="flex justify-between"
                  >
                    <span>{list.name}</span>
                    <span className="text-xs text-gray-500">{list.contacts.length} kontakti</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {selectedList && (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenRenameDialog(selectedList)}
              className="flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Nimeta ümber
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDeleteDialog(selectedList)}
              className="flex items-center text-red-600 hover:text-red-700"
              disabled={contactLists.length <= 1}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Kustuta
            </Button>
          </div>
        )}
      </div>

      {selectedList && (
        <div className="mt-2 text-sm text-gray-500">
          <span>Loodud: {new Date(selectedList.createdAt).toLocaleDateString("et-EE")}</span>
          <span className="mx-2">•</span>
          <span>{selectedList.contacts.length} kontakti</span>
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nimeta nimekiri ümber</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="list-name">Nimekirja nimi</Label>
            <Input
              id="list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Tühista
            </Button>
            <Button onClick={handleRename}>Salvesta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kustuta nimekiri</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Kas olete kindel, et soovite kustutada nimekirja "{listToModify?.name}"? See kustutab kõik nimekirjas
              olevad kontaktid ja seda tegevust ei saa tagasi võtta.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Tühista
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Kustuta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Loo uus kontaktide nimekiri</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-list-name">Nimekirja nimi</Label>
            <Input
              id="new-list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="mt-2"
              placeholder="Nt. IT Ettevõtted, Puhastusfirmad, jne."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Tühista
            </Button>
            <Button onClick={handleCreateList}>Loo nimekiri</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
