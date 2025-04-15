import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('todos')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
} 