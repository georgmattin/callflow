import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get first settings entry or create default one
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1)
      .single();

    // If no settings found, create default settings
    if (error && error.code === 'PGRST116') { // Code for no rows returned
      // Default settings
      const defaultSettings = {
        theme: 'light',
        language: 'et',
        notifications_enabled: true,
        daily_call_target: 30,
        company_name: 'DigiAgentuur OÜ',
        notification_details: {
          call_reminders: true,
          daily_summary: true,
          desktop_notifications: true,
          sound_alerts: true
        },
        calendar_settings: {
          defaultTitle: 'Kohtumine: [Kontakti ettevõte]',
          defaultDuration: '60',
          defaultLocation: 'Google Meet',
          defaultDescription: 'Kohtumine ettevõttega [Kontakti ettevõte].\n\nOsalejad:\n- [Ettevõtte nimi]\n- [Kontaktisiku nimi] ([Kontakti ettevõte])',
          defaultReminderTime: '15',
          sendInvite: true,
          addReminder: true
        }
      };
      
      // Insert default settings
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();
        
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      
      return NextResponse.json(newData);
    }
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    
    // First check if any settings entry exists
    const { data: existingData, error: checkError } = await supabase
      .from('user_settings')
      .select('id')
      .limit(1)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    if (!existingData) {
      // Create new settings
      const newSettings = {
        ...body,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_settings')
        .insert(newSettings)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    } else {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...body,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 });
  }
} 