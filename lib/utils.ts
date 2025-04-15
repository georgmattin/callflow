import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common email providers that should not be converted to websites
export const commonEmailProviders = [
  "gmail.com",
  "gmail.ee",
  "hot.ee",
  "hotmail.com",
  "hotmail.ee",
  "yahoo.com",
  "outlook.com",
  "mail.ee",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "live.com",
  "msn.com",
  "inbox.lv",
  "mail.ru",
  "yandex.ru",
  "telia.ee",
  "elisa.ee",
]

// Function to extract website from email if it's a company email
export function extractWebsiteFromEmail(email: string): string | null {
  if (!email || !email.includes("@")) return null

  const domain = email.split("@")[1]

  // Check if it's a common email provider
  if (commonEmailProviders.includes(domain)) {
    return null
  }

  // Return the domain as a website
  return `www.${domain}`
}

// Function to determine if a phone number is a mobile number
export function isMobileNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false

  // Debug: log the original phone number
  // console.log("Checking number:", phoneNumber);

  // Remove spaces, dashes, parentheses, and plus sign
  const cleanedNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, "")
  
  // Debug: log the cleaned phone number
  // console.log("Cleaned number:", cleanedNumber);

  // For numbers that are all digits (no country code), 
  // Estonian mobile numbers typically start with 5 and are 7-8 digits long
  if (cleanedNumber.startsWith("5") && (cleanedNumber.length === 7 || cleanedNumber.length === 8)) {
    return true
  }

  // For numbers with country code:
  // Check for international Estonian mobile format with country code (372)
  // Estonian mobile numbers start with 5 after country code
  if (cleanedNumber.startsWith("372") && cleanedNumber.length >= 9) {
    const numberAfterCountryCode = cleanedNumber.substring(3);
    return numberAfterCountryCode.startsWith("5");
  }

  return false
}

// Define the Contact interface
interface Contact {
  email: string
  phone: string
  [key: string]: any // Allows for other properties
}

// Function to process contacts and add website information
export function processContacts(contacts: Contact[]): Contact[] {
  // First, add website information to all contacts
  const processedContacts = contacts.map((contact) => {
    const website = extractWebsiteFromEmail(contact.email)
    return {
      ...contact,
      website: contact.website || website || undefined,
      hasMobileNumber: isMobileNumber(contact.phone),
      // Ensure priority exists with a default value
      priority: contact.priority || "Unreviewed"
    }
  })

  // Then sort contacts - by priority first, then by mobile numbers
  return processedContacts.sort((a, b) => {
    // First sort by priority
    const priorityOrder = { "Unreviewed": -1, "High": 0, "Medium": 1, "Normal": 2, "Low": 3 };
    const priorityA = priorityOrder[a.priority || "Normal"];
    const priorityB = priorityOrder[b.priority || "Normal"];
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Then sort by mobile/non-mobile
    if (a.hasMobileNumber && !b.hasMobileNumber) return -1
    if (!a.hasMobileNumber && b.hasMobileNumber) return 1
    return 0
  })
}
