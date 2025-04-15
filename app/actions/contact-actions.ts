"use server"

import { revalidatePath } from "next/cache"
import * as db from "@/lib/db-operations"
import type { Contact } from "@/lib/types"

export async function getContactLists() {
  try {
    return await db.getContactLists()
  } catch (error) {
    console.error("Error fetching contact lists:", error)
    throw new Error("Failed to fetch contact lists")
  }
}

export async function getContactListWithContacts(listId: string) {
  try {
    return await db.getContactListWithContacts(listId)
  } catch (error) {
    console.error(`Error fetching contact list ${listId}:`, error)
    throw new Error("Failed to fetch contact list")
  }
}

export async function createContactList(name: string) {
  try {
    const list = await db.createContactList(name)
    revalidatePath("/contacts")
    return list
  } catch (error) {
    console.error("Error creating contact list:", error)
    throw new Error("Failed to create contact list")
  }
}

export async function updateContactList(id: string, name: string) {
  try {
    const list = await db.updateContactList(id, name)
    revalidatePath("/contacts")
    return list
  } catch (error) {
    console.error(`Error updating contact list ${id}:`, error)
    throw new Error("Failed to update contact list")
  }
}

export async function deleteContactList(id: string) {
  try {
    await db.deleteContactList(id)
    revalidatePath("/contacts")
    return true
  } catch (error) {
    console.error(`Error deleting contact list ${id}:`, error)
    throw new Error("Failed to delete contact list")
  }
}

export async function createContact(contact: Omit<Contact, "id">) {
  try {
    const newContact = await db.createContact(contact)
    revalidatePath("/contacts")
    return newContact
  } catch (error) {
    console.error("Error creating contact:", error)
    throw new Error("Failed to create contact")
  }
}

export async function updateContact(id: string, contact: Partial<Contact>) {
  try {
    const updatedContact = await db.updateContact(id, contact)
    revalidatePath("/contacts")
    return updatedContact
  } catch (error) {
    console.error(`Error updating contact ${id}:`, error)
    throw new Error("Failed to update contact")
  }
}

export async function deleteContact(id: string) {
  try {
    await db.deleteContact(id)
    revalidatePath("/contacts")
    return true
  } catch (error) {
    console.error(`Error deleting contact ${id}:`, error)
    throw new Error("Failed to delete contact")
  }
}

export async function addCallHistory(
  contactId: string,
  callData: {
    notes: string
    result: string
    meetingDate?: string
    meetingTime?: string
    callbackDate?: string
    callbackTime?: string
    callbackReason?: string
  },
) {
  try {
    // Add call history
    await db.addCallHistory({
      contact_id: contactId,
      notes: callData.notes,
      result: callData.result,
      meeting_date: callData.meetingDate ? new Date(callData.meetingDate) : undefined,
      meeting_time: callData.meetingTime,
      callback_date: callData.callbackDate ? new Date(callData.callbackDate) : undefined,
      callback_time: callData.callbackTime,
      callback_reason: callData.callbackReason,
    })

    // Update contact status and callback info
    const contactUpdate: Partial<Contact> = {
      status: callData.result,
      last_call_date: new Date().toISOString(),
    }

    if (callData.result === "Helista hiljem" && callData.callbackDate) {
      contactUpdate.callback_date = callData.callbackDate
      contactUpdate.callback_time = callData.callbackTime
      contactUpdate.callback_reason = callData.callbackReason
    } else {
      // Clear callback data if not scheduling a callback
      contactUpdate.callback_date = undefined
      contactUpdate.callback_time = undefined
      contactUpdate.callback_reason = undefined
    }

    await db.updateContact(contactId, contactUpdate)

    revalidatePath("/contacts")
    revalidatePath("/calling")
    return true
  } catch (error) {
    console.error(`Error adding call history for contact ${contactId}:`, error)
    throw new Error("Failed to add call history")
  }
}
