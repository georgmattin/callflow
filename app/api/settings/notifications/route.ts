import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notification settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { enabled, email_notifications, push_notifications } = body;

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        enabled,
        email_notifications,
        push_notifications,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 });
  }
} 