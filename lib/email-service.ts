import nodemailer from 'nodemailer';
import { EmailTemplate } from './types';

// Create a transporter with the SMTP config
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, htmlContent, replyTo }: SendEmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
      replyTo: replyTo || process.env.EMAIL_FROM,
      bcc: process.env.EMAIL_FROM,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Ensures that line breaks are properly rendered in HTML emails
 * This helps with email clients that might not respect certain HTML formatting
 */
function ensureProperLineBreaks(htmlContent: string): string {
  // Replace single newlines that aren't already part of an HTML tag
  // with proper <br> tags to ensure they display in email clients
  return htmlContent
    // Replace consecutive newlines with a temporary marker
    .replace(/\n\s*\n/g, '<div class="paragraph-break"></div>')
    // Ensure single newlines become <br> tags
    .replace(/\n/g, '<br>')
    // Restore paragraph breaks
    .replace(/<div class="paragraph-break"><\/div>/g, '<br><br>');
}

export async function sendContactEmail(
  to: string,
  subject: string,
  content: string,
  signature: string,
  companyName?: string
): Promise<boolean> {
  // Properly separate the content and signature with an HTML divider
  let htmlContent = ensureProperLineBreaks(content);
  
  if (signature) {
    htmlContent = `${htmlContent}<hr style="margin-top: 20px; margin-bottom: 20px; border: 0; border-top: 1px solid #eee;">${signature}`;
  }
  
  // Check if sending to georg@netikodu and modify subject if needed
  let emailSubject = subject;
  if (to.toLowerCase().includes('georg@netikodu')) {
    emailSubject = `KOOPIA+ ${companyName || 'ETTEVÕTTE NIMI'}`;
  }
  
  return sendEmail({
    to,
    subject: emailSubject,
    htmlContent,
  });
} 