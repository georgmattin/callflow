import { NextResponse } from "next/server"
import { getContactListWithContacts } from "@/app/actions/contact-actions"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const listId = params.id
    const list = await getContactListWithContacts(listId)

    return NextResponse.json(list)
  } catch (error) {
    console.error("Error fetching contact list:", error)
    return NextResponse.json({ error: "Failed to fetch contact list" }, { status: 500 })
  }
}
