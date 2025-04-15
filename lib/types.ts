export interface CallHistory {
  id: string
  date: string
  notes: string
  result: string
  meetingDate?: string
  meetingTime?: string
  callbackDate?: string
  callbackTime?: string
  callbackReason?: string
}

export interface Contact {
  id: string
  company: string
  name: string
  phone: string
  email: string
  website?: string
  registrikood?: string
  status: string
  notes: string
  priority: string
  lastCallDate: string | null
  callHistory?: CallHistory[]
  callbackDate?: string
  callbackTime?: string
  callbackReason?: string
  requeued?: boolean
}

export interface ContactList {
  id: string
  name: string
  description?: string
  createdAt: string
  contacts: Contact[]
}

export interface Script {
  id: string
  name: string
  content: string
  isDefault?: boolean
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  isDefault?: boolean
  callResult?: string
}

export enum CalendarEventType {
  MEETING = "meeting",
  CALLBACK = "callback",
  CALL = "call",
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  type: CalendarEventType
  contact?: Contact
  description?: string
  recurring?: boolean
  recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly"
}

export type CalendarSettings = {
  defaultTitle?: string;
  defaultDuration?: string;
  defaultLocation?: string;
  defaultDescription?: string;
  defaultReminderTime?: string;
  sendInvite?: boolean;
  addReminder?: boolean;
}

export type UserSettings = {
  id?: string;
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
  daily_call_target?: number;
  company_name?: string;
  calendar_settings?: CalendarSettings;
  notification_details?: {
    call_reminders?: boolean;
    daily_summary?: boolean;
    desktop_notifications?: boolean;
    sound_alerts?: boolean;
  };
  updated_at?: string;
}
