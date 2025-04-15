// Define available placeholders and their descriptions
export const availablePlaceholders = [
  { key: "[Kontaktisiku nimi]", description: "Kontakti isiku nimi" },
  { key: "[Kontaktisiku nimega]", description: "Kontakti isiku nimi kaasaütlevas käändes (nt Meelisega)" },
  { key: "[Kontakti ettevõte]", description: "Kontakti ettevõtte nimi" },
  { key: "[E-post]", description: "Kontakti e-posti aadress" },
  { key: "[Telefon]", description: "Kontakti telefoninumber" },
  { key: "[Veebileht]", description: "Kontakti ettevõtte veebileht" },
  { key: "[Ettevõtte nimi]", description: "Teie ettevõtte nimi" },
  { key: "[Kuupäev]", description: "Kohtumise kuupäev (kui määratud)" },
  { key: "[Nädalapäev]", description: "Kohtumise nädalapäev (kui määratud)" },
  { key: "[Kellaaeg]", description: "Kohtumise kellaaeg (kui määratud)" },
  { key: "[Tänane kuupäev]", description: "Tänane kuupäev" },
]

// Function to format contact name according to rules
function formatContactName(fullName: string): string {
  if (!fullName) return "[kontakti nimi puudub]"
  
  // Split by spaces and hyphens while preserving hyphens in the result
  const nameParts = fullName.split(/\s+/)
  
  // If only one word, return it as is
  if (nameParts.length === 1) return nameParts[0]
  
  // Check if first part contains hyphen (e.g., "Georg-Marttin")
  if (nameParts[0].includes('-')) {
    return nameParts[0]
  }
  
  // If two words, return first word
  if (nameParts.length === 2) {
    return nameParts[0]
  }
  
  // If three or more words, return first two words
  // This handles cases like "Georg Marttin Toim"
  return `${nameParts[0]} ${nameParts[1]}`
}

// Function to convert Estonian first name to comitative case (kaasaütlev)
function getNameInComitativeCase(name: string): string {
  if (!name) return "[kontakti nimi puudub]"
  
  // First get the proper first name format
  const firstName = formatContactName(name)
  
  // Define common Estonian name declension patterns for comitative case
  const declensionRules = [
    // Names with special cases first (to take precedence)
    { pattern: /s$/i, suffix: 'ega' },  // Madis -> Madisega, Meelis -> Meelisega
    { pattern: /ne$/i, transform: (name) => name.replace(/ne$/, 'sega') },  // Kristiine -> Kristiisega
    
    // Names ending with hard consonant - add 'iga'
    { pattern: /[bdgklmnprtv]$/i, suffix: 'iga' },
    
    // Names ending with vowels
    { pattern: /a$/i, suffix: 'ga' },  // Tiina -> Tiinaga
    { pattern: /e$/i, suffix: 'ga' },  // Rene -> Renega
    { pattern: /i$/i, suffix: 'ga' },  // Mari -> Mariga
    { pattern: /o$/i, suffix: 'ga' },  // Marko -> Markoga
    { pattern: /u$/i, suffix: 'ga' },  // Marju -> Marjuga
    { pattern: /õ$/i, suffix: 'ga' },  // Anõ -> Anõga
    { pattern: /ä$/i, suffix: 'ga' },  // Ülemä -> Ülemäga
    { pattern: /ö$/i, suffix: 'ga' },  // Jörö -> Jöröga
    { pattern: /ü$/i, suffix: 'ga' },  // Küllü -> Küllüga
    
    // Default case for other endings
    { pattern: /./, suffix: 'ga' }
  ]
  
  // Find the matching rule and apply it
  for (const rule of declensionRules) {
    if (rule.pattern.test(firstName)) {
      if (rule.transform) {
        return rule.transform(firstName)
      }
      return firstName + rule.suffix
    }
  }
  
  // Default fallback
  return firstName + 'ga'
}

// Function to replace placeholders in content with actual contact data
export function replacePlaceholders(
  content: string,
  data: {
    contact?: {
      name?: string
      company?: string
      email?: string
      phone?: string
      website?: string
    }
    callerCompany?: string
    meetingDate?: string
    meetingTime?: string
  },
) {
  let result = content

  if (data.contact) {
    result = result
      .replace(/\[Kontaktisiku nimi\]/g, data.contact.name ? formatContactName(data.contact.name) : "[kontakti nimi puudub]")
      .replace(/\[Kontaktisiku nimega\]/g, data.contact.name ? getNameInComitativeCase(data.contact.name) : "[kontakti nimega puudub]")
      .replace(/\[Kontakti ettevõte\]/g, data.contact.company || "[ettevõtte nimi puudub]")
      .replace(/\[E-post\]/g, data.contact.email || "[e-post puudub]")
      .replace(/\[Telefon\]/g, data.contact.phone || "[telefon puudub]")
      .replace(/\[Veebileht\]/g, data.contact.website || "[veebileht puudub]")
  }

  if (data.callerCompany) {
    result = result.replace(/\[Ettevõtte nimi\]/g, data.callerCompany)
  }

  // Replace meeting date and time if available
  if (data.meetingDate) {
    const date = new Date(data.meetingDate)
    const dateFormatted = formatDateWithMonth(date)
    const dayName = getWeekdayInAdessiveCase(date)

    result = result.replace(/\[Kuupäev\]/g, dateFormatted).replace(/\[Nädalapäev\]/g, dayName)
  }

  if (data.meetingTime) {
    result = result.replace(/\[Kellaaeg\]/g, data.meetingTime)
  }

  // Replace today's date
  const today = new Date()
  const todayFormatted = formatDateWithMonth(today)
  result = result.replace(/\[Tänane kuupäev\]/g, todayFormatted)

  return result
}

// Function to format date with month name
function formatDateWithMonth(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString("et-EE", { month: "long" })
  return `${day}.${month}`
}

// Function to get weekday name in adessive case
function getWeekdayInAdessiveCase(date: Date): string {
  const weekdayName = date.toLocaleDateString("et-EE", { weekday: "long" })
  const weekdayMapping: { [key: string]: string } = {
    'esmaspäev': 'Esmaspäeval',
    'teisipäev': 'Teisipäeval',
    'kolmapäev': 'Kolmapäeval',
    'neljapäev': 'Neljapäeval',
    'reede': 'Reedel',
    'laupäev': 'Laupäeval',
    'pühapäev': 'Pühapäeval'
  }
  
  return weekdayMapping[weekdayName.toLowerCase()] || weekdayName
}
