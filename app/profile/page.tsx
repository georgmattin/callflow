"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "Georg-Marttin",
    email: "georg@digiagentuur.ee",
    phone: "+372 5123 4567",
    company: "DigiAgentuur OÜ",
    position: "Müügijuht",
    bio: "Kogenud müügispetsialist digitaalturunduse valdkonnas. Spetsialiseerunud veebilehtede ja digitaalsete turundusstrateegiate müügile.",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Profiil uuendatud",
        description: "Teie profiili andmed on edukalt salvestatud.",
      })
    }, 1000)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Minu profiil</h1>
        <p className="text-muted-foreground">Halda oma isiklikke andmeid ja seadeid</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="/placeholder.svg?height=128&width=128" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-semibold">{formData.name}</h2>
              <p className="text-muted-foreground">{formData.position}</p>
              <p className="text-muted-foreground">{formData.company}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Isiklikud andmed</CardTitle>
              <CardDescription>Uuenda oma profiili andmeid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nimi</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posti aadress</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Ettevõte</Label>
                  <Input id="company" ame="company" value={formData.company} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Ametinimetus</Label>
                <Input id="position" name="position" value={formData.position} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Lühikirjeldus</Label>
                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvestamine...
                  </>
                ) : (
                  "Salvesta muudatused"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Konto turvalisus</CardTitle>
            <CardDescription>Halda oma parooli ja turvaseadeid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Praegune parool</Label>
                <Input id="current-password" type="password" />
              </div>
              <div></div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Uus parool</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Kinnita uus parool</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="ml-auto">
              Muuda parooli
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
