"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Phone, Plus, Upload, Download, Search, Filter } from "lucide-react"
import ContactList from "@/components/contacts/contact-list"
import ContactDetails from "@/components/contact-details"
import ContactListSelector from "@/components/contact-list-selector"
import CSVImport from "@/components/csv-import"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Contact, ContactList as ContactListType } from "@/lib/types"
// import { sampleContacts } from "@/lib/sample-data"
import { processContacts } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function ContactsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [contactLists, setContactLists] = useState<ContactListType[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Get the currently selected contact list
  const selectedList = contactLists.find((list) => list.id === selectedListId)

  // Filter contacts based on search query
  const filteredContacts =
    selectedList?.contacts.filter((contact) => {
      const query = searchQuery.toLowerCase()
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.company.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query)
      )
    }) || []

  // Load data from Supabase
  useEffect(() => {
    const fetchContactLists = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Fetch contact lists
        const { data: listsData, error: listsError } = await supabase
          .from("contact_lists")
          .select("*")
          .order("created_at", { ascending: false })
        
        if (listsError) throw listsError
        
        if (listsData && listsData.length > 0) {
          const listsWithContacts = await Promise.all(
            listsData.map(async (list) => {
              // Fetch contacts for each list
              const { data: contactsData, error: contactsError } = await supabase
                .from("contacts")
                .select("*")
                .eq("list_id", list.id)
              
              if (contactsError) throw contactsError
              
              // Fetch the last call for each contact
              const contactsWithHistory = await Promise.all((contactsData || []).map(async (contact) => {
                // Get the most recent call history entry for this contact
                const { data: historyData, error: historyError } = await supabase
                  .from("call_history")
                  .select("*")
                  .eq("contact_id", contact.id)
                  .order("date", { ascending: false })
                  .limit(1)
                
                if (historyError) {
                  console.error("Error fetching call history:", historyError);
                  return contact;
                }
                
                // If there is call history, update the contact with lastCallDate and callback info
                if (historyData && historyData.length > 0) {
                  const lastCall = historyData[0];
                  return {
                    ...contact,
                    lastCallDate: lastCall.date || null,
                    callbackDate: lastCall.callback_date || null,
                    callbackTime: lastCall.callback_time || null,
                    callbackReason: lastCall.callback_reason || null
                  };
                }
                
                return contact;
              }));

              return {
                id: list.id,
                name: list.name,
                description: list.description,
                createdAt: list.created_at,
                contacts: processContacts(contactsWithHistory || [])
              }
            })
          )
          
          setContactLists(listsWithContacts)
          setSelectedListId(listsWithContacts[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Viga andmete laadimisel",
          description: "Andmete laadimisel tekkis viga. Proovige lehte värskendada.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchContactLists()
  }, [toast])

  const handleImportSuccess = async (
    importedContacts: Contact[],
    listName: string,
    mode: "create" | "append",
    appendToListId?: string,
    listDescription?: string,
  ) => {
    try {
      const supabase = createClientSupabaseClient()
      
      if (mode === "create") {
        // Create a new contact list in Supabase
        const { data: newList, error: listError } = await supabase
          .from("contact_lists")
          .insert({ 
            name: listName,
            description: listDescription || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (listError) {
          console.error("List creation error:", listError)
          throw listError
        }
        
        // Insert all contacts with the new list ID
        const contactsToInsert = importedContacts.map(contact => ({
          name: contact.name,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          status: contact.status || "Uus",
          notes: contact.notes || "",
          website: contact.website || "",
          registrikood: contact.registrikood || "",
          priority: contact.priority || "Unreviewed",
          list_id: newList.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        
        // Log what we're sending to Supabase for debugging
        console.log("Creating contacts:", contactsToInsert)
        
        const { data: insertedContacts, error: contactsError } = await supabase
          .from("contacts")
          .insert(contactsToInsert)
          .select()
        
        if (contactsError) {
          console.error("Contacts insertion error:", contactsError)
          throw contactsError
        }
        
        // Log what we got back from Supabase
        console.log("Received inserted contacts:", insertedContacts)
        
        // Update the UI
        const newContactListWithContacts: ContactListType = {
          id: newList.id,
          name: newList.name,
          description: newList.description,
          createdAt: newList.created_at,
          contacts: processContacts(insertedContacts || [])
        }
        
        setContactLists(prev => [...prev, newContactListWithContacts])
        setSelectedListId(newList.id)
        
        toast({
          title: "Import õnnestus",
          description: `${importedContacts.length} kontakti imporditud uude nimekirja "${listName}"`,
        })
      } else if (mode === "append" && appendToListId) {
        // Append contacts to an existing list
        const contactsToInsert = importedContacts.map(contact => ({
          name: contact.name,
          company: contact.company,
          email: contact.email,
          phone: contact.phone,
          status: contact.status || "Uus",
          notes: contact.notes || "",
          website: contact.website || "",
          registrikood: contact.registrikood || "",
          priority: contact.priority || "Normal",
          list_id: appendToListId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        
        // Log what we're sending to Supabase for debugging
        console.log("Appending contacts:", contactsToInsert)
        
        const { data: insertedContacts, error: contactsError } = await supabase
          .from("contacts")
          .insert(contactsToInsert)
          .select()
        
        if (contactsError) {
          console.error("Contacts insertion error:", contactsError)
          throw contactsError
        }
        
        // Update the UI
        setContactLists(prev =>
          prev.map(list => {
            if (list.id === appendToListId) {
              return {
                ...list,
                contacts: [...list.contacts, ...processContacts(insertedContacts || [])]
              }
            }
            return list
          })
        )
        
        const listName = contactLists.find(list => list.id === appendToListId)?.name || "valitud nimekiri"
        toast({
          title: "Import õnnestus",
          description: `${importedContacts.length} kontakti lisatud nimekirja "${listName}"`,
        })
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Viga importimisel",
        description: "Kontaktide importimisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  const handleContactClick = (contactId: string) => {
    const loadContactWithHistory = async () => {
      try {
        const supabase = createClientSupabaseClient();
        
        // Fetch call history for the selected contact
        const { data: historyData, error: historyError } = await supabase
          .from("call_history")
          .select("*")
          .eq("contact_id", contactId)
          .order("date", { ascending: false });
        
        if (historyError) {
          console.error("Error fetching call history:", historyError);
          toast({
            title: "Viga ajaloo laadimisel",
            description: "Kõnede ajaloo laadimisel tekkis viga.",
            variant: "destructive",
          });
          return;
        }
        
        // Update the selected contact with call history
        if (selectedListId && historyData) {
          const updatedLists = [...contactLists];
          const listIndex = updatedLists.findIndex(list => list.id === selectedListId);
          
          if (listIndex !== -1) {
            const contactIndex = updatedLists[listIndex].contacts.findIndex(
              contact => contact.id === contactId
            );
            
            if (contactIndex !== -1) {
              // Convert the history data to the correct format
              const typedHistoryData = historyData.map(item => ({
                id: item.id as string,
                date: item.date as string,
                notes: item.notes as string,
                result: item.result as string,
                meetingDate: item.meeting_date as string | undefined,
                meetingTime: item.meeting_time as string | undefined,
                callbackDate: item.callback_date as string | undefined,
                callbackTime: item.callback_time as string | undefined,
                callbackReason: item.callback_reason as string | undefined
              }));
              
              updatedLists[listIndex].contacts[contactIndex].callHistory = typedHistoryData;
              setContactLists(updatedLists);
            }
          }
        }
      } catch (error) {
        console.error("Error loading call history:", error);
      }
    };
    
    // Load history and set the selected contact ID
    loadContactWithHistory();
    setSelectedContactId(contactId);
  }

  const handleCloseContactDetails = () => {
    setSelectedContactId(null)
  }

  const handleUpdateContact = async (updatedContact: Contact) => {
    if (!selectedListId) return

    try {
      const supabase = createClientSupabaseClient()
      
      // Prepare data for update
      const contactData = {
        name: updatedContact.name,
        company: updatedContact.company,
        email: updatedContact.email,
        phone: updatedContact.phone,
        status: updatedContact.status,
        notes: updatedContact.notes,
        website: updatedContact.website,
        registrikood: updatedContact.registrikood,
        priority: updatedContact.priority,
        updated_at: new Date().toISOString()
      }
      
      // Update contact in Supabase
      const { error } = await supabase
        .from("contacts")
        .update(contactData)
        .eq("id", updatedContact.id)
      
      if (error) throw error
      
      // Update UI
      const updatedLists = [...contactLists]
      const listIndex = updatedLists.findIndex((list) => list.id === selectedListId)

      if (listIndex === -1) return

      updatedLists[listIndex].contacts = updatedLists[listIndex].contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact,
      )

      setContactLists(updatedLists)

      toast({
        title: "Kontakt uuendatud",
        description: `Kontakti ${updatedContact.name} andmed on uuendatud`,
      })
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Viga uuendamisel",
        description: "Kontakti uuendamisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  const handleRenameList = async (listId: string, newName: string) => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Update list name in Supabase
      const { error } = await supabase
        .from("contact_lists")
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq("id", listId)
      
      if (error) throw error
      
      // Update UI
      const updatedLists = contactLists.map((list) => (list.id === listId ? { ...list, name: newName } : list))
      setContactLists(updatedLists)

      toast({
        title: "Nimekiri ümbernimetatud",
        description: `Nimekiri on nüüd "${newName}"`,
      })
    } catch (error) {
      console.error("Error renaming list:", error)
      toast({
        title: "Viga ümbernimetamisel",
        description: "Nimekirja ümbernimetamisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteList = async (listId: string) => {
    try {
      const supabase = createClientSupabaseClient()
      
      // First delete all contacts in this list
      const { error: contactsError } = await supabase
        .from("contacts")
        .delete()
        .eq("list_id", listId)
      
      if (contactsError) throw contactsError
      
      // Then delete the list itself
      const { error: listError } = await supabase
        .from("contact_lists")
        .delete()
        .eq("id", listId)
      
      if (listError) throw listError
      
      // Update UI
      const listToDelete = contactLists.find((list) => list.id === listId)
      const updatedLists = contactLists.filter((list) => list.id !== listId)
      setContactLists(updatedLists)

      // If the deleted list was selected, select the first available list
      if (listId === selectedListId && updatedLists.length > 0) {
        setSelectedListId(updatedLists[0].id)
      } else if (updatedLists.length === 0) {
        setSelectedListId(null)
      }

      toast({
        title: "Nimekiri kustutatud",
        description: `Nimekiri "${listToDelete?.name}" on kustutatud`,
      })
    } catch (error) {
      console.error("Error deleting list:", error)
      toast({
        title: "Viga kustutamisel",
        description: "Nimekirja kustutamisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  const handleCreateEmptyList = async (name: string) => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Create new list in Supabase
      const { data: newList, error } = await supabase
        .from("contact_lists")
        .insert({ name })
        .select()
        .single()
      
      if (error) throw error
      
      // Update UI
      const newContactList: ContactListType = {
        id: newList.id,
        name: newList.name,
        description: newList.description,
        createdAt: newList.created_at,
        contacts: []
      }
      
      setContactLists((prev) => [...prev, newContactList])
      setSelectedListId(newList.id)

      toast({
        title: "Uus nimekiri loodud",
        description: `Nimekiri "${name}" on loodud`,
      })
    } catch (error) {
      console.error("Error creating list:", error)
      toast({
        title: "Viga loomisel",
        description: "Uue nimekirja loomisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  const handleStartCalling = () => {
    if (!selectedListId || filteredContacts.length === 0) {
      toast({
        title: "Viga",
        description: "Palun valige nimekiri, mis sisaldab kontakte",
        variant: "destructive",
      })
      return
    }

    // Store the selected list ID in localStorage to access it on the calling page
    localStorage.setItem("selectedListId", selectedListId)

    toast({
      title: "Helistamine alustatud",
      description: "Suunatakse helistamise vaatesse...",
    })

    // Navigate to the calling page
    router.push("/calling")
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedListId) return

    try {
      const supabase = createClientSupabaseClient()
      
      // Delete contact from Supabase
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contactId)
      
      if (error) throw error
      
      // Update UI
      const updatedLists = [...contactLists]
      const listIndex = updatedLists.findIndex((list) => list.id === selectedListId)

      if (listIndex === -1) return

      updatedLists[listIndex].contacts = updatedLists[listIndex].contacts.filter(
        (contact) => contact.id !== contactId
      )

      setContactLists(updatedLists)

      toast({
        title: "Kontakt kustutatud",
        description: "Kontakt on nimekirjast eemaldatud",
      })
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Viga kustutamisel",
        description: "Kontakti kustutamisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  // Find selected contact
  const selectedContact =
    selectedContactId && selectedList ? selectedList.contacts.find((contact) => contact.id === selectedContactId) : null

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kontaktid</h1>
          <p className="text-muted-foreground">Halda ja organiseeri oma kontakte</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Impordi
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Ekspordi
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Lisa kontakt
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="contacts">Kontaktid</TabsTrigger>
          <TabsTrigger value="import">CSV Import</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <ContactListSelector
                  contactLists={contactLists}
                  selectedListId={selectedListId}
                  onSelectList={setSelectedListId}
                  onRenameList={handleRenameList}
                  onDeleteList={handleDeleteList}
                  onCreateEmptyList={handleCreateEmptyList}
                />

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Otsi kontakte..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedList ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-1">{selectedList.name}</h2>
                    {selectedList.description && (
                      <p className="text-sm text-muted-foreground">{selectedList.description}</p>
                    )}
                  </div>

                  <div className="mb-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {filteredContacts.length} kontakti {searchQuery && `otsingu "${searchQuery}" tulemusena`}
                    </div>
                    <Button
                      onClick={handleStartCalling}
                      disabled={!selectedList || filteredContacts.length === 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Alusta helistamist
                    </Button>
                  </div>
                  <ContactList 
                    contacts={filteredContacts} 
                    onContactClick={handleContactClick} 
                    onDeleteContact={handleDeleteContact}
                  />
                </>
              ) : (
                <div className="border rounded-md p-8 text-center">
                  <p className="text-muted-foreground">Palun valige kontaktide nimekiri või looge uus.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
            </CardHeader>
            <CardContent>
              <CSVImport onImportSuccess={handleImportSuccess} contactLists={contactLists} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Details Modal */}
      {selectedContact && (
        <ContactDetails
          contact={selectedContact}
          onClose={handleCloseContactDetails}
          onUpdateContact={handleUpdateContact}
        />
      )}
    </div>
  )
}
