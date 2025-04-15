import { createServerSupabaseClient } from "./supabase"
import type { Contact, ContactList, Script, EmailTemplate, CallHistory } from "./types"

// Kontaktide nimekirjade operatsioonid
export async function getContactLists() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("contact_lists").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data as ContactList[]
}

export async function getContactListWithContacts(listId: string) {
  const supabase = createServerSupabaseClient()

  // Fetch the list
  const { data: list, error: listError } = await supabase.from("contact_lists").select("*").eq("id", listId).single()

  if (listError) throw listError

  // Fetch contacts for this list
  const { data: contacts, error: contactsError } = await supabase.from("contacts").select("*").eq("list_id", listId)

  if (contactsError) throw contactsError

  // Fetch call history for each contact
  const contactsWithHistory = await Promise.all(
    contacts.map(async (contact) => {
      const { data: history, error: historyError } = await supabase
        .from("call_history")
        .select("*")
        .eq("contact_id", contact.id)
        .order("date", { ascending: false })

      if (historyError) throw historyError

      return {
        ...contact,
        callHistory: history,
      }
    }),
  )

  return {
    ...list,
    contacts: contactsWithHistory,
  } as ContactList
}

export async function createContactList(name: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("contact_lists").insert({ name }).select().single()

  if (error) throw error
  return data as ContactList
}

export async function updateContactList(id: string, name: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("contact_lists")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as ContactList
}

export async function deleteContactList(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("contact_lists").delete().eq("id", id)

  if (error) throw error
  return true
}

// Kontaktide operatsioonid
export async function createContact(contact: Omit<Contact, "id">) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("contacts").insert(contact).select().single()

  if (error) throw error
  return data as Contact
}

export async function updateContact(id: string, contact: Partial<Contact>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("contacts")
    .update({ ...contact, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Contact
}

export async function deleteContact(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) throw error
  return true
}

// Kõnede ajaloo operatsioonid
export async function addCallHistory(callHistory: Omit<CallHistory, "id">) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("call_history").insert(callHistory).select().single()

  if (error) throw error
  return data as CallHistory
}

// Skriptide operatsioonid
export async function getScripts() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("scripts").select("*")

  if (error) throw error
  return data as Script[]
}

export async function createScript(script: Omit<Script, "id">) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("scripts").insert(script).select().single()

  if (error) throw error
  return data as Script
}

export async function updateScript(id: string, script: Partial<Script>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("scripts")
    .update({ ...script, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as Script
}

export async function deleteScript(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("scripts").delete().eq("id", id)

  if (error) throw error
  return true
}

// E-posti mallide operatsioonid
export async function getEmailTemplates() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("email_templates").select("*")

  if (error) throw error
  return data as EmailTemplate[]
}

export async function createEmailTemplate(template: Omit<EmailTemplate, "id">) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("email_templates").insert(template).select().single()

  if (error) throw error
  return data as EmailTemplate
}

export async function updateEmailTemplate(id: string, template: Partial<EmailTemplate>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("email_templates")
    .update({ ...template, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as EmailTemplate
}

export async function deleteEmailTemplate(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from("email_templates").delete().eq("id", id)

  if (error) throw error
  return true
}

// Supabase Database Operations
export type TodoItem = {
  id?: string;
  title: string;
  completed: boolean;
  created_at?: string;
};

export async function getTodos() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }

  return data || [];
}

export async function addTodo(todo: Omit<TodoItem, 'id' | 'created_at'>) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select()
    .single();

  if (error) {
    console.error('Error adding todo:', error);
    throw error;
  }

  return data;
}

export async function updateTodo(id: string, updates: Partial<TodoItem>) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating todo:', error);
    throw error;
  }

  return data;
}

export async function deleteTodo(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }

  return true;
}
