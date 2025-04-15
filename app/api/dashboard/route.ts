import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Päri kontaktide staatused (status counts)
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('status')
    
    if (contactsError) throw contactsError
    
    // Loenda staatused käsitsi
    const statusCounts = Object.entries(
      contactsData.reduce((acc: { [key: string]: number }, contact) => {
        const status = contact.status || 'Uus' // Vaikimisi 'Uus' kui status on null
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
    ).map(([status, count]) => ({ status, count: String(count) }))
    
    // Hiljutised kõned (recent calls) koos kontaktandmetega
    const { data: recentCallsData, error: recentCallsError } = await supabase
      .from('call_history')
      .select(`
        id,
        date,
        notes,
        result,
        contact_id,
        contacts (
          id,
          name,
          company
        )
      `)
      .order('date', { ascending: false })
      .limit(5)
    
    if (recentCallsError) throw recentCallsError
    
    // Formatteeri kõnede andmed õigesse formaati
    const recentCalls = recentCallsData.map(call => ({
      id: call.id,
      date: call.date,
      notes: call.notes,
      result: call.result,
      contacts: call.contacts
    }))
    
    // Tulevased tagasihelistamised (upcoming callbacks)
    const today = new Date().toISOString().split('T')[0]
    const { data: upcomingCallbacksData, error: callbacksError } = await supabase
      .from('contacts')
      .select('id, name, company, callback_date, callback_time, callback_reason')
      .not('callback_date', 'is', null)
      .gte('callback_date', today)
      .order('callback_date', { ascending: true })
      .order('callback_time', { ascending: true })
      .limit(5)
    
    if (callbacksError) throw callbacksError
    
    // Tänase päeva kõnede statistika
    const todayStart = today + 'T00:00:00Z'
    const todayEnd = today + 'T23:59:59Z'
    
    const { data: todayCallsData, error: todayCallsError } = await supabase
      .from('call_history')
      .select('result')
      .gte('date', todayStart)
      .lte('date', todayEnd)
    
    if (todayCallsError) throw todayCallsError
    
    // Loenda tulemused käsitsi
    const todayStats = Object.entries(
      todayCallsData.reduce((acc: { [key: string]: number }, call) => {
        const result = call.result || 'Muu'
        acc[result] = (acc[result] || 0) + 1
        return acc
      }, {})
    ).map(([result, count]) => ({ result, count: String(count) }))

    // Selle nädala kõnede statistika
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Pühapäev
    weekStart.setHours(0, 0, 0, 0)
    const weekStartStr = weekStart.toISOString()
    
    const { data: weekCallsData, error: weekCallsError } = await supabase
      .from('call_history')
      .select('result')
      .gte('date', weekStartStr)
      .lte('date', todayEnd)
    
    if (weekCallsError) throw weekCallsError
    
    // Loenda nädala tulemused käsitsi
    const weekStats = Object.entries(
      weekCallsData.reduce((acc: { [key: string]: number }, call) => {
        const result = call.result || 'Muu'
        acc[result] = (acc[result] || 0) + 1
        return acc
      }, {})
    ).map(([result, count]) => ({ result, count: String(count) }))

    // Selle kuu kõnede statistika
    const monthStart = new Date()
    monthStart.setDate(1) // Kuu esimene päev
    monthStart.setHours(0, 0, 0, 0)
    const monthStartStr = monthStart.toISOString()
    
    const { data: monthCallsData, error: monthCallsError } = await supabase
      .from('call_history')
      .select('result')
      .gte('date', monthStartStr)
      .lte('date', todayEnd)
    
    if (monthCallsError) throw monthCallsError
    
    // Loenda kuu tulemused käsitsi
    const monthStats = Object.entries(
      monthCallsData.reduce((acc: { [key: string]: number }, call) => {
        const result = call.result || 'Muu'
        acc[result] = (acc[result] || 0) + 1
        return acc
      }, {})
    ).map(([result, count]) => ({ result, count: String(count) }))
    
    // Kontaktide statistika
    const { count: contactsTotal, error: contactsTotalError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
    
    if (contactsTotalError) throw contactsTotalError
    
    const { count: contactListsCount, error: contactListsError } = await supabase
      .from('contact_lists')
      .select('*', { count: 'exact', head: true })
    
    if (contactListsError) throw contactListsError
    
    // Sel nädalal lisatud kontaktid
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString()
    
    const { count: newContactsCount, error: newContactsError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgoStr)
    
    if (newContactsError) throw newContactsError
    
    return NextResponse.json({
      statusCounts,
      recentCalls,
      upcomingCallbacks: upcomingCallbacksData,
      todayStats,
      weekStats,
      monthStats,
      contactsStats: {
        total: contactsTotal || 0,
        listsCount: contactListsCount || 0,
        newThisWeek: newContactsCount || 0
      }
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 