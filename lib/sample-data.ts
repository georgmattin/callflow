import type { Contact } from "./types"
import { processContacts } from "./utils"

const rawSampleContacts: Contact[] = [
  {
    id: "contact-1",
    company: "Tallink Grupp AS",
    name: "Mart Tamm", // Fictional contact person
    phone: "+372 5123 4567", // Fictional phone
    email: "mart.tamm@tallink.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10238429",
    website: "https://www.tallink.ee",
  },
  {
    id: "contact-2",
    company: "Eesti Energia AS",
    name: "Liisa Kask", // Fictional contact person
    phone: "+372 5234 5678", // Fictional phone
    email: "liisa.kask@energia.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10421629",
    website: "https://www.energia.ee",
  },
  {
    id: "contact-3",
    company: "LHV Pank AS",
    name: "Andres Mets", // Fictional contact person
    phone: "+372 5345 6789", // Fictional phone
    email: "andres.mets@lhv.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10539549",
    website: "https://www.lhv.ee",
  },
  {
    id: "contact-4",
    company: "Bolt Technology OÜ",
    name: "Katrin Saar", // Fictional contact person
    phone: "+372 5456 7890", // Fictional phone
    email: "katrin.saar@bolt.eu", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "12417834",
    website: "https://www.bolt.eu",
  },
  {
    id: "contact-5",
    company: "Nortal AS",
    name: "Sergei Ivanov", // Fictional contact person
    phone: "+372 5567 8901", // Fictional phone
    email: "sergei.ivanov@nortal.com", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10391131",
    website: "https://www.nortal.com",
  },
  {
    id: "contact-6",
    company: "Wise (TransferWise) OÜ",
    name: "Tiina Lepp", // Fictional contact person
    phone: "+372 5678 9012", // Fictional phone
    email: "tiina.lepp@wise.com", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "12907412",
    website: "https://www.wise.com",
  },
  {
    id: "contact-7",
    company: "Cleveron AS",
    name: "Peeter Kuusk", // Fictional contact person
    phone: "+372 5789 0123", // Fictional phone
    email: "peeter.kuusk@cleveron.com", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "11052975",
    website: "https://www.cleveron.com",
  },
  {
    id: "contact-8",
    company: "Pipedrive OÜ",
    name: "Maarika Pärn", // Fictional contact person
    phone: "+372 5890 1234", // Fictional phone
    email: "maarika.parn@pipedrive.com", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "11958539",
    website: "https://www.pipedrive.com",
  },
  {
    id: "contact-9",
    company: "Veriff OÜ",
    name: "Jaanus Tamm", // Fictional contact person
    phone: "+372 5901 2345", // Fictional phone
    email: "jaanus.tamm@veriff.com", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "12932944",
    website: "https://www.veriff.com",
  },
  {
    id: "contact-10",
    company: "Skeleton Technologies OÜ",
    name: "Kristiina Kask", // Fictional contact person
    phone: "+372 5012 3456", // Fictional phone
    email: "kristiina.kask@skeletontech.com", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "11226285",
    website: "https://www.skeletontech.com",
  },
  {
    id: "contact-11",
    company: "Starship Technologies OÜ",
    name: "Jaan Meri", // Fictional contact person
    phone: "+372 5112 3456", // Fictional phone
    email: "jaan.meri@starship.xyz", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "14041629",
    website: "https://www.starship.xyz",
  },
  {
    id: "contact-12",
    company: "Playtech Estonia OÜ",
    name: "Mari Kivi", // Fictional contact person
    phone: "+372 5212 3456", // Fictional phone
    email: "mari.kivi@playtech.com", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10940366",
    website: "https://www.playtech.com",
  },
  {
    id: "contact-13",
    company: "Swedbank AS",
    name: "Tõnu Vaher", // Fictional contact person
    phone: "+372 5313 4567", // Fictional phone
    email: "tonu.vaher@swedbank.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10060701",
    website: "https://www.swedbank.ee",
  },
  {
    id: "contact-14",
    company: "Telia Eesti AS",
    name: "Kadri Tamm", // Fictional contact person
    phone: "+372 5414 5678", // Fictional phone
    email: "kadri.tamm@telia.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10234957",
    website: "https://www.telia.ee",
  },
  {
    id: "contact-15",
    company: "Elisa Eesti AS",
    name: "Rein Kask", // Fictional contact person
    phone: "+372 5515 6789", // Fictional phone
    email: "rein.kask@elisa.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10178070",
    website: "https://www.elisa.ee",
  },
  {
    id: "contact-16",
    company: "Coop Pank AS",
    name: "Liina Mägi", // Fictional contact person
    phone: "+372 5616 7890", // Fictional phone
    email: "liina.magi@cooppank.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10237832",
    website: "https://www.cooppank.ee",
  },
  {
    id: "contact-17",
    company: "Luminor Bank AS",
    name: "Madis Oja", // Fictional contact person
    phone: "+372 5717 8901", // Fictional phone
    email: "madis.oja@luminor.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "11315936",
    website: "https://www.luminor.ee",
  },
  {
    id: "contact-18",
    company: "Bigbank AS",
    name: "Eva Rebane", // Fictional contact person
    phone: "+372 5818 9012", // Fictional phone
    email: "eva.rebane@bigbank.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10183757",
    website: "https://www.bigbank.ee",
  },
  {
    id: "contact-19",
    company: "Alexela AS",
    name: "Toomas Kull", // Fictional contact person
    phone: "+372 5919 0123", // Fictional phone
    email: "toomas.kull@alexela.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10015238",
    website: "https://www.alexela.ee",
  },
  {
    id: "contact-20",
    company: "Olerex AS",
    name: "Piret Sepp", // Fictional contact person
    phone: "+372 5020 1234", // Fictional phone
    email: "piret.sepp@olerex.ee", // Fictional email
    status: "Uus",
    notes: "",
    lastCallDate: null,
    registrikood: "10039402",
    website: "https://www.olerex.ee",
  },
]

// Process the sample contacts to add website information
export const sampleContacts = processContacts(rawSampleContacts)
