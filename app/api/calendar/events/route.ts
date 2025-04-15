import { NextResponse } from "next/server"
import { getContactLists } from "@/app/actions/contact-actions"
import { type CalendarEvent, CalendarEventType } from "@/lib/types"
import { parseISO, addHours } from "date-fns"
import { createClientSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClientSupabaseClient()
    const lists = await getContactLists()
    const allEvents: CalendarEvent[] = []

    // Fetch meetings directly from meetings table
    const { data: meetings, error: meetingsError } = await supabase
      .from("meetings")
      .select(`
        *,
        contacts:contact_id (
          id,
          name,
          company,
          email,
          phone
        )
      `)
    
    if (meetingsError) {
      console.error("Error fetching meetings:", meetingsError)
    } else if (meetings) {
      // Process meetings from meetings table
      for (const meeting of meetings) {
        allEvents.push({
          id: `meeting-db-${meeting.id}`,
          title: meeting.title || `Kohtumine: ${meeting.contacts?.company || 'Tundmatu'}`,
          start: parseISO(`${meeting.meeting_date}T${meeting.meeting_time || "09:00"}:00`),
          end: addHours(parseISO(`${meeting.meeting_date}T${meeting.meeting_time || "09:00"}:00`), meeting.duration / 60 || 1),
          allDay: false,
          type: CalendarEventType.MEETING,
          contact: meeting.contacts,
          description: meeting.description || `Kohtumine kontaktiga ${meeting.contacts?.name || 'Tundmatu'} (${meeting.contacts?.company || 'Tundmatu'})`,
        })
      }
    }

    // Process each list to extract events
    for (const list of lists) {
      try {
        // Kasutame supabase päringut otse kontaktide saamiseks
        const { data: contacts, error } = await supabase
          .from("contacts")
          .select("*")
          .eq("list_id", list.id);

        if (error) {
          console.error("Error fetching contacts for list:", error);
          continue;
        }

        // Process contacts for callbacks
        for (const contact of contacts) {
          // Add callbacks
          if (contact.callback_date) {
            allEvents.push({
              id: `callback-${contact.id}-${contact.callback_date}`,
              title: `Tagasihelistamine: ${contact.company}`,
              start: parseISO(`${contact.callback_date}T${contact.callback_time || "09:00"}:00`),
              end: parseISO(`${contact.callback_date}T${contact.callback_time || "09:00"}:00`),
              allDay: false,
              type: CalendarEventType.CALLBACK,
              contact: contact,
              description: contact.callback_reason || `Tagasihelistamine kontaktile ${contact.name} (${contact.company})`,
            })
          }

          // Get call history for this contact
          const { data: callHistory, error: callHistoryError } = await supabase
            .from("call_history")
            .select("*")
            .eq("contact_id", contact.id);

          if (callHistoryError) {
            console.error("Error fetching call history:", callHistoryError);
            continue;
          }

          // Process call history for meetings
          if (callHistory) {
            for (const call of callHistory) {
              if (call.meeting_date) {
                allEvents.push({
                  id: `meeting-${call.id}`,
                  title: `Kohtumine: ${contact.company}`,
                  start: parseISO(`${call.meeting_date}T${call.meeting_time || "09:00"}:00`),
                  end: addHours(parseISO(`${call.meeting_date}T${call.meeting_time || "09:00"}:00`), 1),
                  allDay: false,
                  type: CalendarEventType.MEETING,
                  contact: contact,
                  description: call.notes || `Kohtumine kontaktiga ${contact.name} (${contact.company})`,
                })
              }

              // Add call logs
              allEvents.push({
                id: `call-${call.id}`,
                title: `Kõne: ${contact.company}`,
                start: parseISO(call.date),
                end: parseISO(call.date),
                allDay: false,
                type: CalendarEventType.CALL,
                contact: contact,
                description: call.notes || `Kõne kontaktile ${contact.name} (${contact.company})`,
              })
            }
          }
        }
      } catch (listError) {
        console.error("Error processing list:", listError);
        continue;
      }
    }

    return NextResponse.json(allEvents)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 })
  }
}
