"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Contact as ContactType, ContactList } from "@/lib/types"
// import { sampleContacts } from "@/lib/sample-data"
import { processContacts } from "@/lib/utils"
import * as XLSX from 'xlsx'

interface CSVImportProps {
  onImportSuccess: (contacts: ContactType[], listName: string, mode: "create" | "append", appendToListId?: string, listDescription?: string) => void
  contactLists: ContactList[]
}

export default function CSVImport({ onImportSuccess, contactLists }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [importMode, setImportMode] = useState<"create" | "append">("create")
  const [selectedListId, setSelectedListId] = useState<string>("")
  const [previewData, setPreviewData] = useState<{headers: string[], rows: string[][]} | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Set default list name based on file name (without extension) if in create mode
      if (importMode === "create") {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "")
        if (!listName) {
          setListName(fileName)
        }
      }

      setImportStatus("idle")
      
      // Create a preview of the data
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = event.target?.result
          
          // Check if it's Excel or CSV file
          if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
            processExcelData(data as ArrayBuffer)
          } else {
            // For CSV files
            processCSVData(data as string)
          }
        } catch (error) {
          console.error("File preview error:", error)
        }
      }
      
      // Different reading method depending on file type
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(selectedFile)
      } else {
        // For CSV files, read as text with UTF-8 encoding
        reader.readAsText(selectedFile, 'UTF-8')
      }
    }
  }

  // Process Excel file data
  const processExcelData = (data: ArrayBuffer) => {
    try {
      // Read the Excel file
      const workbook = XLSX.read(data, { type: 'array' })
      
      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })
      
      // Extract headers and data rows
      const headers = jsonData[0] as string[]
      const rows = jsonData.slice(1, 6) as string[][] // Show first 5 rows
      
      setPreviewData({ headers, rows })
    } catch (error) {
      console.error("Excel processing error:", error)
      setErrorMessage("Excel faili töötlemisel tekkis viga.")
      setImportStatus("error")
    }
  }

  // Extract common CSV processing logic to reuse in both handleFileChange and Drop event
  const processCSVData = (csvData: string) => {
    const lines = csvData.split("\n")
    
    // Determine separator (comma or semicolon)
    const firstLine = lines[0]
    const separator = firstLine.includes(';') ? ';' : ','
    
    const headers = firstLine.split(separator).map(header => header.trim())
    
    // Show 5 rows as preview
    const previewRows = lines.slice(1, 6)
      .filter(line => line.trim() !== "")
      .map(line => {
        // Parse CSV row considering quotes
        let row: string[] = []
        let insideQuotes = false
        let currentValue = ""
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            insideQuotes = !insideQuotes
          } else if (char === separator && !insideQuotes) {
            row.push(currentValue.trim())
            currentValue = ""
          } else {
            currentValue += char
          }
        }
        row.push(currentValue.trim())
        
        return row
      })
    
    setPreviewData({headers, rows: previewRows})
  }

  const handleImport = () => {
    if (!file) {
      setErrorMessage("Palun valige CSV või Excel fail")
      setImportStatus("error")
      return
    }

    if (importMode === "create" && !listName.trim()) {
      setErrorMessage("Palun sisestage kontaktide nimekirja nimi")
      setImportStatus("error")
      return
    }

    if (importMode === "append" && !selectedListId) {
      setErrorMessage("Palun valige nimekiri, kuhu kontaktid lisada")
      setImportStatus("error")
      return
    }

    setIsLoading(true)

    try {
      // Check file type and process accordingly
      const isExcelFile = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      
      if (isExcelFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = e.target?.result as ArrayBuffer
            const contacts = parseExcel(data)
            
            // Process contacts to add website information
            const processedContacts = processContacts(contacts)

            if (importMode === "create") {
              onImportSuccess(processedContacts, listName, "create", undefined, listDescription)
            } else {
              onImportSuccess(processedContacts, "", "append", selectedListId)
            }

            setImportStatus("success")
            setIsLoading(false)
            // Reset form for next import
            setFile(null)
            setPreviewData(null)
            if (importMode === "create") {
              setListName("")
              setListDescription("")
            }
          } catch (error) {
            console.error("Excel parsing error:", error)
            setErrorMessage(error instanceof Error ? error.message : "Excel faili töötlemisel tekkis viga. Kontrollige faili formaati.")
            setImportStatus("error")
            setIsLoading(false)
          }
        }
        reader.readAsArrayBuffer(file)
      } else {
        // For CSV files, use existing logic
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const csvData = e.target?.result as string
            const contacts = parseCSV(csvData)

            // Process contacts to add website information
            const processedContacts = processContacts(contacts)

            if (importMode === "create") {
              onImportSuccess(processedContacts, listName, "create", undefined, listDescription)
            } else {
              onImportSuccess(processedContacts, "", "append", selectedListId)
            }

            setImportStatus("success")
            setIsLoading(false)
            // Reset form for next import
            setFile(null)
            setPreviewData(null)
            if (importMode === "create") {
              setListName("")
              setListDescription("")
            }
          } catch (error) {
            console.error("CSV parsing error:", error)
            setErrorMessage(error instanceof Error ? error.message : "CSV faili töötlemisel tekkis viga. Kontrollige faili formaati.")
            setImportStatus("error")
            setIsLoading(false)
          }
        }
        reader.readAsText(file, 'UTF-8')
      }
    } catch (error) {
      console.error("File processing error:", error)
      setErrorMessage("Faili töötlemisel tekkis viga.")
      setImportStatus("error")
      setIsLoading(false)
    }
  }

  // Parse Excel file
  const parseExcel = (data: ArrayBuffer): ContactType[] => {
    // Read the Excel file
    const workbook = XLSX.read(data, { type: 'array' })
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })
    
    // Extract headers and data rows
    const headers = jsonData[0] as string[]
    const rows = jsonData.slice(1) as any[][]
    
    // Fix encoding for each value if needed
    rows.forEach(row => {
      for (let i = 0; i < row.length; i++) {
        if (typeof row[i] === 'string') {
          row[i] = fixEncoding(row[i])
        }
      }
    })

    // Validate required headers
    const requiredHeaders = ["company", "phone", "email", "name"]
    const missingHeaders = requiredHeaders.filter(
      (h) => !headers.some((header) => typeof header === 'string' && header.toLowerCase() === h.toLowerCase()),
    )

    if (missingHeaders.length > 0) {
      throw new Error(`Puuduvad vajalikud veerud: ${missingHeaders.join(", ")}`)
    }

    // Find all headers indices
    const getHeaderIndex = (header: string) => headers.findIndex(
      (h) => typeof h === 'string' && h.toLowerCase() === header.toLowerCase()
    )

    const companyIndex = getHeaderIndex("company")
    const phoneIndex = getHeaderIndex("phone")
    const emailIndex = getHeaderIndex("email")
    const nameIndex = getHeaderIndex("name")
    const statusIndex = getHeaderIndex("status")
    const notesIndex = getHeaderIndex("notes")
    const websiteIndex = getHeaderIndex("website")
    const registrikoodIndex = getHeaderIndex("registrikood")

    // Parse data rows
    return rows
      .filter(row => row.length > 0)
      .map((row, index) => {
        // Ensure values are strings
        const getStringValue = (idx: number) => {
          if (idx === -1) return ""
          const value = row[idx]
          return value !== undefined ? String(value) : ""
        }

        const contact: ContactType = {
          id: `contact-${Date.now()}-${index}`,
          company: getStringValue(companyIndex),
          phone: getStringValue(phoneIndex),
          email: getStringValue(emailIndex),
          name: getStringValue(nameIndex),
          status: statusIndex !== -1 ? getStringValue(statusIndex) : "Uus",
          notes: notesIndex !== -1 ? getStringValue(notesIndex) : "",
          website: websiteIndex !== -1 ? getStringValue(websiteIndex) : "",
          registrikood: registrikoodIndex !== -1 ? getStringValue(registrikoodIndex) : "",
          lastCallDate: null,
        }
        return contact
      })
  }

  // Funktsioon, mis aitab valesti kodeeritud täpitähtedega
  const fixEncoding = (text: string): string => {
    // Teisendame levinumad probleemsed kodeeringud
    return text
      // Väikesed tähed
      .replace(/Ã¤/g, 'ä')
      .replace(/Ã¶/g, 'ö') 
      .replace(/Ãµ/g, 'õ')
      .replace(/Ã¼/g, 'ü')
      // Suured tähed
      .replace(/Ã„/g, 'Ä')
      .replace(/Ã–/g, 'Ö')
      .replace(/Ãœ/g, 'Ü')
      .replace(/Ã•/g, 'Õ')
      // Muud tüüpilised probleemid CSV failides
      .replace(/O\u00F5/g, 'OÜ')  // O õ -> OÜ
      .replace(/\u00F5/g, 'õ')    // õ sümbol
      .replace(/OSAU\u00F5HING/g, 'OSAÜHING')
      .replace(/ANNEM\u00F5ISA/g, 'ANNEMÕISA')
      .replace(/Klimu\u00F5ev/g, 'Klimuõev');
  }

  const parseCSV = (csvData: string): ContactType[] => {
    // Püüame parandada kogu faili kodeeringut
    csvData = fixEncoding(csvData);
    
    const lines = csvData.split("\n")
    
    // Determine separator (comma or semicolon)
    const firstLine = lines[0]
    const separator = firstLine.includes(';') ? ';' : ','
    
    const headers = firstLine.split(separator).map((header) => header.trim())

    // Validate required headers
    const requiredHeaders = ["company", "phone", "email", "name"]
    const missingHeaders = requiredHeaders.filter(
      (h) => !headers.some((header) => header.toLowerCase() === h.toLowerCase()),
    )

    if (missingHeaders.length > 0) {
      throw new Error(`Puuduvad vajalikud veerud: ${missingHeaders.join(", ")}`)
    }

    // Find all headers indices
    const getHeaderIndex = (header: string) => headers.findIndex(
      (h) => h.toLowerCase() === header.toLowerCase()
    )

    const companyIndex = getHeaderIndex("company")
    const phoneIndex = getHeaderIndex("phone")
    const emailIndex = getHeaderIndex("email")
    const nameIndex = getHeaderIndex("name")
    const statusIndex = getHeaderIndex("status")
    const notesIndex = getHeaderIndex("notes")
    const websiteIndex = getHeaderIndex("website")
    const registrikoodIndex = getHeaderIndex("registrikood")

    // Parse data rows
    return lines
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line, index) => {
        // Handle quoted values correctly
        let values: string[] = []
        let insideQuotes = false
        let currentValue = ""
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          
          if (char === '"') {
            insideQuotes = !insideQuotes
          } else if ((char === separator) && !insideQuotes) {
            values.push(currentValue.trim())
            currentValue = ""
          } else {
            currentValue += char
          }
        }
        values.push(currentValue.trim()) // Don't forget the last value
        
        // Ensure we have enough values for all headers
        while (values.length < headers.length) {
          values.push("")
        }

        // Parandame iga väärtuse kodeeringut
        values = values.map(value => fixEncoding(value));

        return {
          id: `contact-${Date.now()}-${index}`,
          company: values[companyIndex] || "",
          phone: values[phoneIndex] || "",
          email: values[emailIndex] || "",
          name: values[nameIndex] || "",
          status: statusIndex !== -1 ? values[statusIndex] : "Uus",
          notes: notesIndex !== -1 ? values[notesIndex] : "",
          website: values[websiteIndex] || "",
          registrikood: values[registrikoodIndex] || "",
          lastCallDate: null,
        }
      })
  }

  const handleImportModeChange = (value: "create" | "append") => {
    setImportMode(value)
    setImportStatus("idle")

    // If switching to append mode and there's only one list, auto-select it
    if (value === "append" && contactLists.length === 1) {
      setSelectedListId(contactLists[0].id)
    }
  }

  // Get the name of the selected list for success message
  const selectedListName = contactLists.find((list) => list.id === selectedListId)?.name || ""

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <RadioGroup
            value={importMode}
            onValueChange={(value) => handleImportModeChange(value as "create" | "append")}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="create" id="create" />
              <Label htmlFor="create">Loo uus kontaktide nimekiri</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="append" id="append" />
              <Label htmlFor="append">Lisa kontaktid olemasolevasse nimekirja</Label>
            </div>
          </RadioGroup>

          {importMode === "create" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="list-name">Kontaktide nimekirja nimi</Label>
                <Input
                  id="list-name"
                  placeholder="Nt. IT Ettevõtted, Puhastusfirmad, jne."
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="list-description">Kirjeldus (valikuline)</Label>
                <Input
                  id="list-description"
                  placeholder="Nt. Importitud Firmast X, tegevusala, vms."
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="existing-list">Vali nimekiri</Label>
              <Select value={selectedListId} onValueChange={setSelectedListId}>
                <SelectTrigger id="existing-list">
                  <SelectValue placeholder="Vali nimekiri" />
                </SelectTrigger>
                <SelectContent>
                  {contactLists.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nimekirjad puuduvad
                    </SelectItem>
                  ) : (
                    contactLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.contacts.length} kontakti)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div 
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const droppedFile = e.dataTransfer.files[0];
                // Kontrolli, kas on CSV või Excel fail
                if (droppedFile.name.endsWith('.csv') || 
                    droppedFile.name.endsWith('.xlsx') || 
                    droppedFile.name.endsWith('.xls')) {
                  setFile(droppedFile);
                  
                  // Määra nimekirja nimi faili nime järgi, kui ollakse loomise režiimis
                  if (importMode === "create") {
                    const fileName = droppedFile.name.replace(/\.[^/.]+$/, "");
                    if (!listName) {
                      setListName(fileName);
                    }
                  }
                  
                  // Loo faili eelvaade
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      // Kontrolli failitüüpi
                      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                        processExcelData(event.target?.result as ArrayBuffer);
                      } else {
                        const csvData = event.target?.result as string;
                        processCSVData(csvData);
                      }
                    } catch (error) {
                      console.error("File preview error:", error);
                    }
                  };
                  
                  // Loe faili vastavalt tüübile
                  if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
                    reader.readAsArrayBuffer(droppedFile);
                  } else {
                    reader.readAsText(droppedFile, 'UTF-8');
                  }
                } else {
                  setErrorMessage("Palun kasutage ainult CSV või Excel faile (.csv, .xlsx või .xls laiendiga)");
                  setImportStatus("error");
                }
              }
            }}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">Lohista CSV või Excel fail siia või kliki allpool</p>
            <p className="text-xs text-muted-foreground mb-4">
              Fail peab sisaldama vähemalt järgmisi veerge: name, company, email, phone.
              <br />CSV puhul võivad veerud olla eraldatud koma (,) või semikooloniga (;).
              <br />Kasutage UTF-8 kodeeringut, et säilitada täpitähed.
              <br />Toetatakse .csv, .xlsx ja .xls failitüüpe.
            </p>
            <input type="file" id="csv-upload" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
            <label htmlFor="csv-upload">
              <Button variant="outline">
                Vali fail
              </Button>
            </label>
            {file && <p className="mt-2 text-sm text-gray-600">Valitud: {file.name}</p>}
          </div>
          
          {previewData && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Faili eelvaade:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      {previewData.headers.map((header, index) => (
                        <th key={index} className="px-2 py-1 border">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-muted/50"}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1 border truncate max-w-[150px]">{cell}</td>
                        ))}
                        {/* Add empty cells if row is shorter than headers */}
                        {row.length < previewData.headers.length && 
                          Array(previewData.headers.length - row.length).fill(0).map((_, i) => (
                            <td key={`empty-${i}`} className="px-2 py-1 border"></td>
                          ))
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Näidatakse kuni 5 esimest rida. Impordil töödeldakse kõik read.
              </p>
            </div>
          )}

          {importStatus === "success" && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4" />
              <AlertTitle>Import õnnestus</AlertTitle>
              <AlertDescription>
                {importMode === "create"
                  ? `Kontaktid imporditud uude nimekirja "${listName}"`
                  : `Kontaktid lisatud nimekirja "${selectedListName}"`}
              </AlertDescription>
            </Alert>
          )}

          {importStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Viga</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleImport}
              disabled={isLoading || (!file && importStatus !== "success")}
              className="mr-2"
            >
              {isLoading ? "Importimine..." : "Impordi kontaktid"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
