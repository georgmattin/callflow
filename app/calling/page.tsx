"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Phone, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import CallingView from "@/components/calling/calling-view"
import ContactListSelector from "@/components/contact-list-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Contact, Script, EmailTemplate, ContactList as ContactListType, CallHistory } from "@/lib/types"
import { processContacts } from "@/lib/utils"
import CallbackList from "@/components/calling/callback-list"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function CallingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [contactLists, setContactLists] = useState<ContactListType[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [scripts, setScripts] = useState<Script[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [currentContactIndex, setCurrentContactIndex] = useState(0)
  const [requeuedContacts, setRequeuedContacts] = useState<Contact[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(true)
  const [singleContactMode, setSingleContactMode] = useState(false)
  const [singleContact, setSingleContact] = useState<Contact | null>(null)
  const [callSource, setCallSource] = useState<"contacts" | "callbacks">("contacts")
  const [callbackContacts, setCallbackContacts] = useState<Contact[]>([])

  // Get the contact ID from URL if provided
  const contactId = searchParams.get("contactId")
  const listId = searchParams.get("listId")

  // Get the currently selected contact list
  const selectedList = contactLists.find((list) => list.id === selectedListId)
  const contacts = selectedList?.contacts || []

  // Load data from Supabase
  useEffect(() => {
    // Check if there's a selected list ID in localStorage
    const storedListId = localStorage.getItem("selectedListId")
    
    const fetchData = async () => {
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
              
              // Fetch call history for each contact
              const contactsWithHistory = await Promise.all(
                (contactsData || []).map(async (contact) => {
                  const { data: historyData, error: historyError } = await supabase
                    .from("call_history")
                    .select("*")
                    .eq("contact_id", contact.id)
                    .order("date", { ascending: false })
                  
                  if (historyError) throw historyError
                  
                  return {
                    ...contact,
                    callHistory: historyData || []
                  }
                })
              )
              
              return {
                id: list.id,
                name: list.name,
                createdAt: list.created_at,
                contacts: processContacts(contactsWithHistory || [])
              }
            })
          )
          
          setContactLists(listsWithContacts)
          
          // Set selected list based on priority: listId param > storedListId > first list
          if (listId) {
            setSelectedListId(listId)
            // If we also have a contact ID, we're in single contact mode
            if (contactId) {
              setSingleContactMode(true)
            } else {
              setIsSelectionMode(false)
            }
          } else if (storedListId) {
            setSelectedListId(storedListId)
            setIsSelectionMode(false) // Skip selection mode if we have a stored list ID
          } else if (listsWithContacts.length > 0) {
            setSelectedListId(listsWithContacts[0].id)
          }
          
          // Extract all contacts with callbacks
          const allCallbacks: Contact[] = []
          listsWithContacts.forEach(list => {
            const callbacks = list.contacts.filter(contact => contact.callbackDate)
            allCallbacks.push(...callbacks)
          })
          setCallbackContacts(allCallbacks)
        }
        
        // Fetch scripts
        const { data: scriptsData, error: scriptsError } = await supabase
          .from("scripts")
          .select("*")
          .order("created_at", { ascending: false })
        
        if (scriptsError) throw scriptsError
        
        if (scriptsData) {
          setScripts(scriptsData.map(script => ({
            id: script.id,
            name: script.name,
            content: script.content,
            isDefault: script.is_default || false,
            createdAt: script.created_at,
            updatedAt: script.updated_at
          })))
        }
        
        // Fetch email templates
        const { data: templatesData, error: templatesError } = await supabase
          .from("email_templates")
          .select("*")
          .order("created_at", { ascending: false })
        
        if (templatesError) throw templatesError
        
        if (templatesData) {
          setEmailTemplates(templatesData.map(template => ({
            id: template.id,
            name: template.name,
            subject: template.subject,
            content: template.content,
            isDefault: template.is_default || false,
            callResult: template.call_result,
            createdAt: template.created_at,
            updatedAt: template.updated_at
          })))
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
        // Clear the stored list ID after using it
        localStorage.removeItem("selectedListId")
      }
    }
    
    fetchData()
  }, [contactId, listId, toast])

  // Find the single contact if we have a contact ID
  useEffect(() => {
    if (contactId && contactLists.length > 0) {
      // Find the contact in all lists
      for (const list of contactLists) {
        const contact = list.contacts.find((c) => c.id === contactId)
        if (contact) {
          setSingleContact(contact)
          setSelectedListId(list.id)
          setSingleContactMode(true)
          setIsSelectionMode(false)
          break
        }
      }
    }
  }, [contactId, contactLists])

  // Update callback contacts when contact lists change
  useEffect(() => {
    if (contactLists.length > 0) {
      const allCallbacks: Contact[] = []
      contactLists.forEach((list) => {
        const callbacks = list.contacts.filter((contact) => contact.callbackDate)
        allCallbacks.push(...callbacks)
      })
      setCallbackContacts(allCallbacks)
    }
  }, [contactLists])

  const handleStartCalling = () => {
    if (callSource === "contacts") {
      if (selectedListId && contacts.length > 0) {
        setIsSelectionMode(false)
        toast({
          title: "Helistamine alustatud",
          description: `Helistatakse nimekirja "${selectedList?.name}" kontaktidele`,
        })
      } else {
        toast({
          title: "Viga",
          description: "Palun valige nimekiri, mis sisaldab kontakte",
          variant: "destructive",
        })
      }
    } else if (callSource === "callbacks" && callbackContacts.length > 0) {
      // Find the list that contains the first callback contact
      const firstCallback = callbackContacts[0]
      const listWithCallback = contactLists.find((list) =>
        list.contacts.some((contact) => contact.id === firstCallback.id),
      )

      if (listWithCallback) {
        setSelectedListId(listWithCallback.id)
        // Find the index of the contact in the list
        const contactIndex = listWithCallback.contacts.findIndex((c) => c.id === firstCallback.id)
        if (contactIndex !== -1) {
          setCurrentContactIndex(contactIndex)
          setIsSelectionMode(false)
          toast({
            title: "Helistamine alustatud",
            description: "Helistatakse tagasihelistamise kontaktidele",
          })
        }
      }
    } else {
      toast({
        title: "Viga",
        description: "Tagasihelistamise kontaktid puuduvad",
        variant: "destructive",
      })
    }
  }

  const handleSelectCallback = (contact: Contact) => {
    // Find which list contains this contact
    const listWithContact = contactLists.find((list) => list.contacts.some((c) => c.id === contact.id))

    if (listWithContact) {
      setSelectedListId(listWithContact.id)
      // Find the index of the contact in the list
      const contactIndex = listWithContact.contacts.findIndex((c) => c.id === contact.id)
      if (contactIndex !== -1) {
        setCurrentContactIndex(contactIndex)
        setIsSelectionMode(false)
      }
    }
  }

  const handleSaveAndNext = async (
    notes: string,
    result: string,
    meetingDate?: string,
    meetingTime?: string,
    callbackDate?: string,
    callbackTime?: string,
    callbackReason?: string,
  ) => {
    if (!selectedListId) return

    try {
      const supabase = createClientSupabaseClient()
      
      // Update the current contact with notes and result
      const updatedLists = [...contactLists]
      const listIndex = updatedLists.findIndex((list) => list.id === selectedListId)

      if (listIndex === -1) return

      const currentContact =
        singleContactMode && singleContact ? singleContact : updatedLists[listIndex].contacts[currentContactIndex]

      if (!currentContact || !currentContact.id) {
        throw new Error("Current contact is undefined or missing ID")
      }

      // Create call history entry for Supabase
      const callHistoryData = {
        contact_id: currentContact.id,
        date: new Date().toISOString(),
        notes: notes || "",
        result: result || "",
        meeting_date: meetingDate || null,
        meeting_time: meetingTime || null,
        callback_date: callbackDate || null,
        callback_time: callbackTime || null,
        callback_reason: callbackReason || null
      }

      console.log("Saving call history:", callHistoryData)
      
      // Insert call history to Supabase
      const { data: historyData, error: historyError } = await supabase
        .from("call_history")
        .insert(callHistoryData)
        .select()
        .single()
      
      if (historyError) {
        console.error("Supabase history insert error:", historyError)
        throw historyError
      }
      
      if (!historyData) {
        throw new Error("Failed to insert call history: No data returned")
      }
      
      // Create call history for the UI
      const callHistory: CallHistory = {
        id: historyData.id,
        date: historyData.date,
        notes: historyData.notes,
        result: historyData.result,
        meetingDate: historyData.meeting_date,
        meetingTime: historyData.meeting_time,
        callbackDate: historyData.callback_date,
        callbackTime: historyData.callback_time,
        callbackReason: historyData.callback_reason,
      }

      // Add call history to contact and update status
      const updatedContact = {
        ...currentContact,
        status: result,
        lastCallDate: new Date().toISOString(),
        callHistory: [...(currentContact.callHistory || []), callHistory],
      }

      // Handle callback scheduling
      if (result === "Helista hiljem" && callbackDate && callbackTime) {
        updatedContact.callbackDate = callbackDate
        updatedContact.callbackTime = callbackTime
        updatedContact.callbackReason = callbackReason

        // Update contact in Supabase
        const { error: updateError } = await supabase
          .from("contacts")
          .update({
            status: result,
            last_call_date: new Date().toISOString(),
            callback_date: callbackDate,
            callback_time: callbackTime,
            callback_reason: callbackReason || null
          })
          .eq("id", currentContact.id)
          
        if (updateError) {
          console.error("Supabase contact update error:", updateError)
          throw updateError
        }

        toast({
          title: "Tagasihelistamine planeeritud",
          description: `${currentContact.name} - ${new Date(callbackDate).toLocaleDateString("et-EE")} kell ${callbackTime}`,
        })
      } else {
        // Clear any existing callback data if not scheduling a callback
        updatedContact.callbackDate = undefined
        updatedContact.callbackTime = undefined
        updatedContact.callbackReason = undefined
        
        // Update contact in Supabase
        const { error: updateError } = await supabase
          .from("contacts")
          .update({
            status: result,
            last_call_date: new Date().toISOString(),
            callback_date: null,
            callback_time: null,
            callback_reason: null
          })
          .eq("id", currentContact.id)
          
        if (updateError) {
          console.error("Supabase contact update error:", updateError)
          throw updateError
        }
      }

      // Handle meeting creation if the result is "Kohtumine"
      if (result === "Kohtumine" && meetingDate && meetingTime) {
        try {
          // Get the current user's ID
          const { data: userData } = await supabase.auth.getUser()
          const userId = userData?.user?.id || "00000000-0000-0000-0000-000000000000"; // Default UUID if no user found
          
          console.log("Creating meeting with data:", {
            contact_id: currentContact.id,
            user_id: userId,
            meeting_date: meetingDate,
            meeting_time: meetingTime
          });
          
          // Prepare meeting data - ensure data types match schema
          const meetingRecord = {
            contact_id: currentContact.id,
            user_id: userId,
            title: `Kohtumine - ${currentContact.company}`,
            meeting_date: meetingDate, 
            meeting_time: meetingTime,
            duration: 60, // Default duration of 60 minutes
            location: "",
            description: notes || "",
            status: "scheduled"
          };
          
          // Insert meeting to Supabase
          const { data: createdMeeting, error: meetingError } = await supabase
            .from("meetings")
            .insert(meetingRecord)
            .select();
          
          if (meetingError) {
            console.error("Error creating meeting:", meetingError);
            console.error("Attempted to insert:", meetingRecord);
            toast({
              title: "Viga kohtumise lisamisel",
              description: `Kohtumise lisamine ebaõnnestus: ${meetingError.message}`,
              variant: "destructive",
            });
          } else {
            console.log("Meeting created successfully:", createdMeeting);
            toast({
              title: "Kohtumine planeeritud",
              description: `${currentContact.name} - ${new Date(meetingDate).toLocaleDateString("et-EE")} kell ${meetingTime}`,
            });
          }
        } catch (error) {
          console.error("Exception in meeting creation:", error);
          toast({
            title: "Viga kohtumise lisamisel",
            description: "Kohtumise lisamine ebaõnnestus. Proovige uuesti.",
            variant: "destructive",
          });
        }
      }

      // Handle "Ei vastanud" (No Answer) - mark for requeuing
      if (result === "Ei vastanud" && !singleContactMode) {
        // Store the contact for requeuing after all other contacts are processed
        setRequeuedContacts((prev) => [
          ...prev,
          {
            ...updatedContact,
            requeued: true,
          },
        ])

        toast({
          description: "Kontakt lisatakse uuesti järjekorda pärast teiste kontaktidega helistamist",
        })
      }

      // Update the contact in the list
      if (singleContactMode && singleContact) {
        // Find the contact in the list and update it
        const contactIndex = updatedLists[listIndex].contacts.findIndex((c) => c.id === singleContact.id)
        if (contactIndex !== -1) {
          updatedLists[listIndex].contacts[contactIndex] = updatedContact
        }
        setSingleContact(updatedContact)
      } else {
        updatedLists[listIndex].contacts[currentContactIndex] = updatedContact
      }

      setContactLists(updatedLists)

      // If in single contact mode, we're done
      if (singleContactMode) {
        toast({
          title: "Kõne salvestatud",
          description: "Kõne andmed on edukalt salvestatud",
        })
        return
      }

      // Move to the next contact or end calling session
      if (currentContactIndex < contacts.length - 1) {
        setCurrentContactIndex(currentContactIndex + 1)

        toast({
          description: "Liigutakse järgmise kontakti juurde",
        })
      } else {
        // If we've reached the end of the list, check if there are requeued contacts
        if (requeuedContacts.length > 0) {
          // Add requeued contacts to the end of the list
          const listWithRequeuedContacts = [...updatedLists]
          listWithRequeuedContacts[listIndex].contacts = [
            ...listWithRequeuedContacts[listIndex].contacts,
            ...requeuedContacts,
          ]
          setContactLists(listWithRequeuedContacts)

          toast({
            title: "Vastamata kontaktid",
            description: `Helistatakse ${requeuedContacts.length} vastamata kontaktile`,
          })

          setRequeuedContacts([]) // Clear the requeued contacts

          // Continue with the first requeued contact
          setCurrentContactIndex(contacts.length)
        } else {
          // End calling session if no requeued contacts
          toast({
            title: "Helistamine lõpetatud",
            description: "Kõik kontaktid on läbi helistatud",
          })

          router.push("/")
        }
      }
    } catch (error) {
      console.error("Error saving call data:", error)
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      
      toast({
        title: "Viga andmete salvestamisel",
        description: error instanceof Error ? error.message : "Kõne tulemuse salvestamisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  const handleExitCallingMode = () => {
    // If there are requeued contacts, add them to the list
    if (requeuedContacts.length > 0 && selectedListId) {
      const updatedLists = [...contactLists]
      const listIndex = updatedLists.findIndex((list) => list.id === selectedListId)

      if (listIndex !== -1) {
        updatedLists[listIndex].contacts = [...updatedLists[listIndex].contacts, ...requeuedContacts]
        setContactLists(updatedLists)
      }

      setRequeuedContacts([])
    }

    router.push("/")
  }

  const handleUpdateContact = async (updatedContact: Contact) => {
    if (!selectedListId) return

    try {
      const supabase = createClientSupabaseClient()
      
      // Prepare data for database update
      const contactData = {
        name: updatedContact.name,
        company: updatedContact.company,
        email: updatedContact.email,
        phone: updatedContact.phone,
        website: updatedContact.website,
        registrikood: updatedContact.registrikood,
        notes: updatedContact.notes,
        priority: updatedContact.priority,
        updated_at: new Date().toISOString()
      }
      
      // Update contact in Supabase
      const { error } = await supabase
        .from("contacts")
        .update(contactData)
        .eq("id", updatedContact.id)
      
      if (error) {
        console.error("Error updating contact in database:", error)
        toast({
          title: "Viga",
          description: "Kontakti uuendamine andmebaasis ebaõnnestus",
          variant: "destructive",
        })
        return
      }

      // Update the UI
      const updatedLists = [...contactLists]
      const listIndex = updatedLists.findIndex((list) => list.id === selectedListId)

      if (listIndex === -1) return

      if (singleContactMode && singleContact) {
        // Find the contact in the list and update it
        const contactIndex = updatedLists[listIndex].contacts.findIndex((c) => c.id === singleContact.id)
        if (contactIndex !== -1) {
          updatedLists[listIndex].contacts[contactIndex] = updatedContact
        }
        setSingleContact(updatedContact)
      } else {
        updatedLists[listIndex].contacts = updatedLists[listIndex].contacts.map((contact) =>
          contact.id === updatedContact.id ? updatedContact : contact,
        )
      }

      setContactLists(updatedLists)

      toast({
        title: "Kontakt uuendatud",
        description: "Kontakti andmed on edukalt uuendatud",
      })
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Viga",
        description: "Kontakti uuendamisel tekkis viga",
        variant: "destructive",
      })
    }
  }

  // Get the current contact for calling view
  const currentContact = singleContactMode && singleContact ? singleContact : contacts[currentContactIndex] || null

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Helistamine</h1>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Andmete laadimine...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Helistamine</h1>
      </div>

      {isSelectionMode ? (
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="contacts" onValueChange={(value) => setCallSource(value as "contacts" | "callbacks")}>
              <TabsList className="mb-6">
                <TabsTrigger value="contacts" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Kontaktide nimekiri
                </TabsTrigger>
                <TabsTrigger value="callbacks" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Tagasihelistamised ({callbackContacts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contacts">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Vali kontaktide nimekiri</h2>
                  <ContactListSelector
                    contactLists={contactLists}
                    selectedListId={selectedListId}
                    onSelectList={setSelectedListId}
                    onRenameList={(listId, newName) => {
                      const updatedLists = contactLists.map((list) =>
                        list.id === listId ? { ...list, name: newName } : list,
                      )
                      setContactLists(updatedLists)
                    }}
                    onDeleteList={(listId) => {
                      const updatedLists = contactLists.filter((list) => list.id !== listId)
                      setContactLists(updatedLists)
                      if (selectedListId === listId && updatedLists.length > 0) {
                        setSelectedListId(updatedLists[0].id)
                      } else if (updatedLists.length === 0) {
                        setSelectedListId(null)
                      }
                    }}
                    onCreateEmptyList={(name) => {
                      const newList: ContactListType = {
                        id: `list-${Date.now()}`,
                        name,
                        createdAt: new Date().toISOString(),
                        contacts: [],
                      }
                      setContactLists([...contactLists, newList])
                      setSelectedListId(newList.id)
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    {selectedList && (
                      <p className="text-muted-foreground">
                        {contacts.length} kontakti nimekirjas "{selectedList.name}"
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleStartCalling}
                    disabled={!selectedList || contacts.length === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Alusta helistamist
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="callbacks">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Tagasihelistamised</h2>
                  <CallbackList callbacks={callbackContacts} onSelectCallback={handleSelectCallback} />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-muted-foreground">{callbackContacts.length} tagasihelistamist</p>
                  </div>
                  <Button
                    onClick={handleStartCalling}
                    disabled={callbackContacts.length === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Alusta helistamist
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        currentContact && (
          <CallingView
            contact={currentContact}
            scripts={scripts}
            emailTemplates={emailTemplates}
            onSaveAndNext={handleSaveAndNext}
            onExit={handleExitCallingMode}
            onUpdateContact={handleUpdateContact}
            progress={
              singleContactMode
                ? "Üksikkõne"
                : `${currentContactIndex + 1}/${contacts.length + requeuedContacts.length}`
            }
            singleContactMode={singleContactMode}
          />
        )
      )}
    </div>
  )
}
