"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import EmailTemplateManager from "@/components/email-template-manager"
import type { EmailTemplate } from "@/lib/types"
// import { sampleEmailTemplates } from "@/lib/sample-emails"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function EmailsPage() {
  const { toast } = useToast()
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [emailSignature, setEmailSignature] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Load data from Supabase
  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Fetch email templates
        const { data, error } = await supabase
          .from("email_templates")
          .select("*")
          .order("created_at", { ascending: false })
        
        if (error) throw error
        
        if (data) {
          setEmailTemplates(data.map(template => ({
            id: template.id,
            name: template.name,
            subject: template.subject,
            content: template.content,
            isDefault: template.is_default || false,
            callResult: template.call_result,
            createdAt: template.created_at,
            updatedAt: template.updated_at
          })))
        }
        
        // Get signature from supabase settings or localStorage
        const { data: settingsData, error: settingsError } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "email_signature")
          .single()
        
        // Load signature from localStorage if not in Supabase
        let savedSignature = settingsData?.value
        if (!savedSignature) {
          savedSignature = localStorage.getItem("emailSignature")
        }
        
        if (savedSignature) {
          setEmailSignature(savedSignature)
        } else {
          // Default signature
          const defaultSignature = `
            <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
              <p>Parimate soovidega,</p>
              <p><strong>Georg-Marttin</strong></p>
              <p>DigiAgentuur OÜ</p>
            </div>
          `
          setEmailSignature(defaultSignature)
          
          // Save default to Supabase
          await supabase
            .from("settings")
            .upsert({
              key: "email_signature",
              value: defaultSignature,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
        }
      } catch (error) {
        console.error("Error fetching email templates:", error)
        toast({
          title: "Viga mallide laadimisel",
          description: "E-kirja mallide laadimisel tekkis viga. Proovige lehte värskendada.",
          variant: "destructive",
        })
        
        // Load signature from localStorage as fallback
        const savedSignature = localStorage.getItem("emailSignature")
        if (savedSignature) {
          setEmailSignature(savedSignature)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEmailTemplates()
  }, [toast])

  const handleEmailTemplatesChange = async (updatedTemplates: EmailTemplate[]) => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Find added, updated, and deleted templates
      const originalIds = emailTemplates.map(t => t.id)
      const updatedIds = updatedTemplates.map(t => t.id)
      
      // New templates to add
      const templatesToAdd = updatedTemplates.filter(t => !t.id || !originalIds.includes(t.id))
      
      // Existing templates to update
      const templatesToUpdate = updatedTemplates.filter(t => t.id && originalIds.includes(t.id))
      
      // Templates to delete
      const templatesToDelete = emailTemplates.filter(t => !updatedIds.includes(t.id))
      
      // Add new templates
      for (const template of templatesToAdd) {
        await supabase.from("email_templates").insert({
          name: template.name,
          subject: template.subject,
          content: template.content,
          is_default: template.isDefault,
          call_result: template.callResult
        })
      }
      
      // Update existing templates
      for (const template of templatesToUpdate) {
        if (template.id) {
          await supabase.from("email_templates").update({
            name: template.name,
            subject: template.subject,
            content: template.content,
            is_default: template.isDefault,
            call_result: template.callResult,
            updated_at: new Date().toISOString()
          }).eq("id", template.id)
        }
      }
      
      // Delete templates
      for (const template of templatesToDelete) {
        if (template.id) {
          await supabase.from("email_templates").delete().eq("id", template.id)
        }
      }
      
      // Refetch data to ensure we have the latest
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      
      if (data) {
        setEmailTemplates(data.map(template => ({
          id: template.id,
          name: template.name,
          subject: template.subject,
          content: template.content,
          isDefault: template.is_default || false,
          callResult: template.call_result,
          createdAt: template.created_at,
          updatedAt: template.updated_at
        })))
      }
      
      toast({
        description: "E-kirja mallid on uuendatud",
      })
    } catch (error) {
      console.error("Error updating email templates:", error)
      toast({
        title: "Viga mallide uuendamisel",
        description: "E-kirja mallide uuendamisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  const handleSignatureChange = async (newSignature: string) => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Update signature in Supabase
      await supabase
        .from("settings")
        .upsert({
          key: "email_signature",
          value: newSignature,
          updated_at: new Date().toISOString()
        })
      
      setEmailSignature(newSignature)
      
      // Save to localStorage as fallback
      localStorage.setItem("emailSignature", newSignature)
      
      toast({
        description: "E-kirja allkiri on uuendatud",
      })
    } catch (error) {
      console.error("Error updating signature:", error)
      
      // Still update localStorage and state even if Supabase fails
      setEmailSignature(newSignature)
      localStorage.setItem("emailSignature", newSignature)
      
      toast({
        title: "Hoiatus",
        description: "E-kirja allkiri on uuendatud lokaalselt, kuid serveriga ühendamisel tekkis viga.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">E-kirja mallid</h1>
          <p className="text-muted-foreground">Halda ja koosta e-kirja malle</p>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Andmete laadimine...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">E-kirja mallid</h1>
        <p className="text-muted-foreground">Halda ja koosta e-kirja malle</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <EmailTemplateManager
            emailTemplates={emailTemplates}
            onEmailTemplatesChange={handleEmailTemplatesChange}
            signature={emailSignature}
            onSignatureChange={handleSignatureChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
