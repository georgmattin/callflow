import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const { to, subject, content, signature, companyName } = await request.json();
    
    // Validate required fields
    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or content' },
        { status: 400 }
      );
    }
    
    // Send the email
    const success = await sendContactEmail(to, subject, content, signature || '', companyName);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 