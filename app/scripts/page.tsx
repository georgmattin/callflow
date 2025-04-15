"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import ScriptManager from "@/components/script-manager"
import type { Script } from "@/lib/types"
// import { sampleScripts } from "@/lib/sample-scripts"
// import { netikoduskript } from "@/lib/netikodu-script"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function ScriptsPage() {
  const { toast } = useToast()
  const [scripts, setScripts] = useState<Script[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data from Supabase
  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Fetch scripts
        const { data, error } = await supabase
          .from("scripts")
          .select("*")
          .order("created_at", { ascending: false })
        
        if (error) throw error
        
        if (data) {
          setScripts(data.map(script => ({
            id: script.id,
            name: script.name,
            content: script.content,
            isDefault: script.is_default || false,
            createdAt: script.created_at,
            updatedAt: script.updated_at
          })))
        }
      } catch (error) {
        console.error("Error fetching scripts:", error)
        toast({
          title: "Viga skriptide laadimisel",
          description: "Skriptide laadimisel tekkis viga. Proovige lehte värskendada.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchScripts()
  }, [toast])

  const handleScriptsChange = async (updatedScripts: Script[]) => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Find added, updated, and deleted scripts
      const originalIds = scripts.map(s => s.id)
      const updatedIds = updatedScripts.map(s => s.id)
      
      // New scripts to add
      const scriptsToAdd = updatedScripts.filter(s => !s.id || !originalIds.includes(s.id))
      
      // Existing scripts to update
      const scriptsToUpdate = updatedScripts.filter(s => s.id && originalIds.includes(s.id))
      
      // Scripts to delete
      const scriptsToDelete = scripts.filter(s => !updatedIds.includes(s.id))
      
      // Add new scripts
      for (const script of scriptsToAdd) {
        await supabase.from("scripts").insert({
          name: script.name,
          content: script.content,
          is_default: script.isDefault
        })
      }
      
      // Update existing scripts
      for (const script of scriptsToUpdate) {
        if (script.id) {
          await supabase.from("scripts").update({
            name: script.name,
            content: script.content,
            is_default: script.isDefault,
            updated_at: new Date().toISOString()
          }).eq("id", script.id)
        }
      }
      
      // Delete scripts
      for (const script of scriptsToDelete) {
        if (script.id) {
          await supabase.from("scripts").delete().eq("id", script.id)
        }
      }
      
      // Refetch data to ensure we have the latest
      const { data, error } = await supabase
        .from("scripts")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      
      if (data) {
        setScripts(data.map(script => ({
          id: script.id,
          name: script.name,
          content: script.content,
          isDefault: script.is_default || false,
          createdAt: script.created_at,
          updatedAt: script.updated_at
        })))
      }
      
      toast({
        description: "Müügiskriptid on uuendatud",
      })
    } catch (error) {
      console.error("Error updating scripts:", error)
      toast({
        title: "Viga skriptide uuendamisel",
        description: "Skriptide uuendamisel tekkis viga. Proovige uuesti.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Müügiskriptid</h1>
          <p className="text-muted-foreground">Halda ja koosta müügiskripte</p>
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
        <h1 className="text-3xl font-bold">Müügiskriptid</h1>
        <p className="text-muted-foreground">Halda ja koosta müügiskripte</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <ScriptManager scripts={scripts} onScriptsChange={handleScriptsChange} />
        </CardContent>
      </Card>
    </div>
  )
}
