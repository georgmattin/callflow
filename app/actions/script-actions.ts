"use server"

import { revalidatePath } from "next/cache"
import * as db from "@/lib/db-operations"
import type { Script } from "@/lib/types"

export async function getScripts() {
  try {
    return await db.getScripts()
  } catch (error) {
    console.error("Error fetching scripts:", error)
    throw new Error("Failed to fetch scripts")
  }
}

export async function createScript(script: Omit<Script, "id">) {
  try {
    const newScript = await db.createScript(script)
    revalidatePath("/scripts")
    return newScript
  } catch (error) {
    console.error("Error creating script:", error)
    throw new Error("Failed to create script")
  }
}

export async function updateScript(id: string, script: Partial<Script>) {
  try {
    const updatedScript = await db.updateScript(id, script)
    revalidatePath("/scripts")
    return updatedScript
  } catch (error) {
    console.error(`Error updating script ${id}:`, error)
    throw new Error("Failed to update script")
  }
}

export async function deleteScript(id: string) {
  try {
    await db.deleteScript(id)
    revalidatePath("/scripts")
    return true
  } catch (error) {
    console.error(`Error deleting script ${id}:`, error)
    throw new Error("Failed to delete script")
  }
}
