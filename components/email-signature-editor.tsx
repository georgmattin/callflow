"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"
import { useToast } from "@/components/ui/use-toast"

interface EmailSignatureEditorProps {
  initialSignature?: string
  onSave: (signature: string) => void
}

export default function EmailSignatureEditor({ initialSignature = "", onSave }: EmailSignatureEditorProps) {
  const { toast } = useToast()
  const [signature, setSignature] = useState(
    initialSignature ||
      `
    <p>Parimate soovidega,</p>
    <p><strong>Georg-Marttin Toim</strong><br>
    Digiturunduse projektijuht<br>
    <a href="tel:+3725627798">+372 5627 2798</a></p>
    <p><a href="https://www.netikodu.ee" target="_blank"><img src="http://netikodu.ee/wp-content/uploads/2025/04/Netikodu-logo@2x.png" alt="Netikodu" width="150" style="border: 0; margin-top: 10px;"></a></p>
    <p><strong>Georg-Marttin</strong></p>
    <p>DigiAgentuur OÜ</p>
  `,
  )
  const [activeTab, setActiveTab] = useState("edit")

  const handleSaveSignature = () => {
    onSave(signature)
    toast({
      title: "Allkiri salvestatud",
      description: "Teie e-kirja allkiri on edukalt salvestatud.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>E-kirja allkiri</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="edit">Muuda</TabsTrigger>
            <TabsTrigger value="preview">Eelvaade</TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <RichTextEditor content={signature} onChange={setSignature} className="min-h-[200px]" />
          </TabsContent>

          <TabsContent value="preview">
            <div className="border rounded-md p-4 min-h-[200px]">
              <div
                className="prose dark:prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: signature }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSignature}>
          <Save className="h-4 w-4 mr-2" />
          Salvesta allkiri
        </Button>
      </CardFooter>
    </Card>
  )
}
