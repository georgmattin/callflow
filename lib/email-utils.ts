/**
 * Client-side utility functions for email handling
 */

/**
 * Sends an email using the API route
 */
export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  signature: string,
  companyName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if georg@netikodu is included in recipients (either as primary or cc)
    const isGeorgCopied = to.toLowerCase().includes('georg@netikodu');
    
    // If georg@netikodu is in recipients, modify the subject line
    let emailSubject = subject;
    if (isGeorgCopied) {
      // Extract company name from the content or use provided companyName
      // This assumes the company name is already available in the component calling this function
      const company = companyName || extractCompanyFromSubject(subject);
      emailSubject = `KOOPIA+ ${company}`;
    }

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject: emailSubject, content, signature }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.error || 'Failed to send email' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Extracts company name from email subject
 * This is a helper function to get company name from typical subjects like:
 * "Kohtumine: DigiAgentuur OÜ ja Company X - 2023-10-15 10:00"
 */
function extractCompanyFromSubject(subject: string): string {
  // Try to extract company name from common patterns in subjects
  const companyMatch = subject.match(/: ([^-]+) ja ([^-]+)/);
  if (companyMatch && companyMatch.length > 2) {
    return companyMatch[2].trim();
  }
  
  // Fallback to generic company name if pattern doesn't match
  return "ETTEVÕTTE NIMI";
}

/**
 * Strips HTML from an email body for plain text display
 */
export function stripHtmlForPlainText(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

/**
 * Get the stored email signature or empty string
 */
export function getStoredEmailSignature(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('emailSignature') || '';
} 