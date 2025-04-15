"use server"

import { revalidatePath } from "next/cache"
import * as db from "@/lib/db-operations"
import type { EmailTemplate } from "@/lib/types"
import { sendContactEmail } from "@/lib/email-service"

export async function getEmailTemplates() {
  try {
    return await db.getEmailTemplates()
  } catch (error) {
    console.error("Error fetching email templates:", error)
    throw new Error("Failed to fetch email templates")
  }
}

export async function createEmailTemplate(template: Omit<EmailTemplate, "id">) {
  try {
    const newTemplate = await db.createEmailTemplate(template)
    revalidatePath("/emails")
    return newTemplate
  } catch (error) {
    console.error("Error creating email template:", error)
    throw new Error("Failed to create email template")
  }
}

export async function updateEmailTemplate(id: string, template: Partial<EmailTemplate>) {
  try {
    const updatedTemplate = await db.updateEmailTemplate(id, template)
    revalidatePath("/emails")
    return updatedTemplate
  } catch (error) {
    console.error(`Error updating email template ${id}:`, error)
    throw new Error("Failed to update email template")
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    await db.deleteEmailTemplate(id)
    revalidatePath("/emails")
    return true
  } catch (error) {
    console.error(`Error deleting email template ${id}:`, error)
    throw new Error("Failed to delete email template")
  }
}

export async function sendEmail(to: string, subject: string, content: string, signature: string, companyName?: string) {
  try {
    const success = await sendContactEmail(to, subject, content, signature, companyName)
    return { success }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: "Failed to send email" }
  }
}
