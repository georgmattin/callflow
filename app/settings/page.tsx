"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { Textarea } from "@/components/ui/textarea"
import type { UserSettings } from "@/lib/types"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // General settings
  const [companyName, setCompanyName] = useState("DigiAgentuur OÜ")
  const [dailyCallGoal, setDailyCallGoal] = useState("30")
  const [language, setLanguage] = useState("et")
  const [timeZone, setTimeZone] = useState("Europe/Tallinn")

  // Appearance settings
  const { theme, setTheme } = useTheme()
  const [colorScheme, setColorScheme] = useState("blue")
  const [compactMode, setCompactMode] = useState(false)

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [callReminders, setCallReminders] = useState(true)
  const [dailySummary, setDailySummary] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(true)

  // Calendar settings
  const [defaultTitle, setDefaultTitle] = useState("Kohtumine: [Kontakti ettevõte]")
  const [defaultDuration, setDefaultDuration] = useState("60")
  const [defaultLocation, setDefaultLocation] = useState("Google Meet")
  const [defaultDescription, setDefaultDescription] = useState(`Kohtumine ettevõttega [Kontakti ettevõte].\n\nOsalejad:\n- [Ettevõtte nimi]\n- [Kontaktisiku nimi] ([Kontakti ettevõte])`)
  const [defaultReminderTime, setDefaultReminderTime] = useState("15")
  const [sendInvite, setSendInvite] = useState(true)
  const [addReminder, setAddReminder] = useState(true)

  // Fetch user settings
  useEffect(() => {
    async function fetchUserSettings() {
      setIsFetching(true)
      try {
        const response = await fetch('/api/settings/user')
        if (response.ok) {
          const data = await response.json()
          
          // Update general settings
          if (data.daily_call_target) {
            setDailyCallGoal(data.daily_call_target.toString())
          }
          
          if (data.language) {
            setLanguage(data.language)
          }

          if (data.company_name) {
            setCompanyName(data.company_name)
          }
          
          // Update theme
          if (data.theme) {
            setTheme(data.theme)
          }
          
          // Update notification settings
          if (data.notifications_enabled !== undefined) {
            setEmailNotifications(data.notifications_enabled)
          }
          
          if (data.notification_details) {
            const details = data.notification_details
            if (details.call_reminders !== undefined) setCallReminders(details.call_reminders)
            if (details.daily_summary !== undefined) setDailySummary(details.daily_summary)
            if (details.desktop_notifications !== undefined) setDesktopNotifications(details.desktop_notifications)
            if (details.sound_alerts !== undefined) setSoundAlerts(details.sound_alerts)
          }

          // Update calendar settings
          if (data.calendar_settings) {
            const calendar = data.calendar_settings
            if (calendar.defaultTitle) setDefaultTitle(calendar.defaultTitle)
            if (calendar.defaultDuration) setDefaultDuration(calendar.defaultDuration)
            if (calendar.defaultLocation) setDefaultLocation(calendar.defaultLocation)
            if (calendar.defaultDescription) setDefaultDescription(calendar.defaultDescription)
            if (calendar.defaultReminderTime) setDefaultReminderTime(calendar.defaultReminderTime)
            if (calendar.sendInvite !== undefined) setSendInvite(calendar.sendInvite)
            if (calendar.addReminder !== undefined) setAddReminder(calendar.addReminder)
          }
        }
      } catch (error) {
        console.error("Error fetching user settings:", error)
        toast({
          title: "Viga",
          description: "Kasutaja seadeid ei õnnestunud laadida",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchUserSettings()
  }, [toast, setTheme])

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true)

    try {
      if (section === "Üldised") {
        const response = await fetch('/api/settings/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            daily_call_target: parseInt(dailyCallGoal),
            language: language,
            company_name: companyName,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save settings')
        }
      } 
      else if (section === "Välimuse") {
        const response = await fetch('/api/settings/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            theme: theme,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save settings')
        }
      }
      else if (section === "Teavituste") {
        const response = await fetch('/api/settings/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notifications_enabled: emailNotifications,
            notification_details: {
              call_reminders: callReminders,
              daily_summary: dailySummary,
              desktop_notifications: desktopNotifications,
              sound_alerts: soundAlerts,
            },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save settings')
        }
      }
      else if (section === "Kalendri") {
        const response = await fetch('/api/settings/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            calendar_settings: {
              defaultTitle,
              defaultDuration,
              defaultLocation,
              defaultDescription,
              defaultReminderTime,
              sendInvite,
              addReminder,
            },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save settings')
        }
      }

      toast({
        title: "Seaded salvestatud",
        description: `${section} seaded on edukalt uuendatud.`,
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Viga",
        description: "Seadeid ei õnnestunud salvestada",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="container mx-auto p-6 max-w-7xl flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Seadete laadimine...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Seaded</h1>
        <p className="text-muted-foreground">Halda rakenduse seadeid ja eelistusi</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Üldised seaded</TabsTrigger>
          <TabsTrigger value="appearance">Välimus</TabsTrigger>
          <TabsTrigger value="notifications">Teavitused</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="integrations">Integratsioonid</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Üldised seaded</CardTitle>
              <CardDescription>Halda rakenduse üldiseid seadeid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">Ettevõtte nimi</Label>
                <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  See nimi kuvatakse skriptides ja e-kirjades [Ettevõtte nimi] välja asemel
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-goal">Päevane kõnede eesmärk</Label>
                <Input
                  id="daily-goal"
                  type="number"
                  value={dailyCallGoal}
                  onChange={(e) => setDailyCallGoal(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Määra, mitu kõnet päevas soovid teha</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Keel</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Vali keel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="et">Eesti keel</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Ajavöönd</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Vali ajavöönd" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Tallinn">Tallinn (GMT+3)</SelectItem>
                      <SelectItem value="Europe/Helsinki">Helsinki (GMT+3)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Üldised")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvestamine...
                  </>
                ) : (
                  "Salvesta seaded"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Välimus</CardTitle>
              <CardDescription>Kohandage rakenduse välimust</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Teema</Label>
                <Select value={theme || "light"} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Vali teema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Hele</SelectItem>
                    <SelectItem value="dark">Tume</SelectItem>
                    <SelectItem value="system">Süsteemi teema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-scheme">Värvipalett</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger id="color-scheme">
                    <SelectValue placeholder="Vali värvipalett" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Sinine</SelectItem>
                    <SelectItem value="green">Roheline</SelectItem>
                    <SelectItem value="purple">Lilla</SelectItem>
                    <SelectItem value="orange">Oranž</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Kompaktne režiim</p>
                  <p className="text-sm text-muted-foreground">
                    Vähendab elementide vahesid ja suurust, et mahutada rohkem sisu ekraanile
                  </p>
                </div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Välimuse")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvestamine...
                  </>
                ) : (
                  "Salvesta seaded"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Teavituste seaded</CardTitle>
              <CardDescription>Määrake, milliseid teavitusi soovite saada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">E-posti teavitused</p>
                  <p className="text-sm text-muted-foreground">
                    Saada teavitusi e-kirjaga, kui on planeeritud tagasihelistamisi
                  </p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tagasihelistamise meeldetuletused</p>
                  <p className="text-sm text-muted-foreground">
                    Saada meeldetuletusi planeeritud tagasihelistamiste kohta
                  </p>
                </div>
                <Switch checked={callReminders} onCheckedChange={setCallReminders} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Päeva kokkuvõte</p>
                  <p className="text-sm text-muted-foreground">Saada iga päeva lõpus kokkuvõte tehtud kõnedest</p>
                </div>
                <Switch checked={dailySummary} onCheckedChange={setDailySummary} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Töölaua teavitused</p>
                  <p className="text-sm text-muted-foreground">
                    Näita teavitusi töölaua ekraanil, kui rakendus on avatud
                  </p>
                </div>
                <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Helisignaalid</p>
                  <p className="text-sm text-muted-foreground">Mängi helisignaale teavituste ja sündmuste korral</p>
                </div>
                <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Teavituste")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvestamine...
                  </>
                ) : (
                  "Salvesta seaded"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Kalendri seaded</CardTitle>
              <CardDescription>Määra vaikimisi seaded kalendri kohtumiste jaoks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-title">Vaikimisi pealkiri</Label>
                <Input
                  id="default-title"
                  value={defaultTitle}
                  onChange={(e) => setDefaultTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Võid kasutada muutujaid: [Kontakti ettevõte], [Kontaktisiku nimi], [Ettevõtte nimi]
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-duration">Vaikimisi kestus (minutites)</Label>
                  <Select value={defaultDuration} onValueChange={setDefaultDuration}>
                    <SelectTrigger id="default-duration">
                      <SelectValue placeholder="Vali kestus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutit</SelectItem>
                      <SelectItem value="30">30 minutit</SelectItem>
                      <SelectItem value="45">45 minutit</SelectItem>
                      <SelectItem value="60">1 tund</SelectItem>
                      <SelectItem value="90">1.5 tundi</SelectItem>
                      <SelectItem value="120">2 tundi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-location">Vaikimisi asukoht</Label>
                  <Select value={defaultLocation} onValueChange={setDefaultLocation}>
                    <SelectTrigger id="default-location">
                      <SelectValue placeholder="Vali asukoht" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Kontor">Kontor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-description">Vaikimisi kirjeldus</Label>
                <Textarea
                  id="default-description"
                  value={defaultDescription}
                  onChange={(e) => setDefaultDescription(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Võid kasutada muutujaid: [Kontakti ettevõte], [Kontaktisiku nimi], [Ettevõtte nimi]
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-reminder">Vaikimisi meeldetuletus (minutites)</Label>
                <Select value={defaultReminderTime} onValueChange={setDefaultReminderTime}>
                  <SelectTrigger id="default-reminder">
                    <SelectValue placeholder="Vali meeldetuletuse aeg" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Kohe</SelectItem>
                    <SelectItem value="5">5 minutit enne</SelectItem>
                    <SelectItem value="10">10 minutit enne</SelectItem>
                    <SelectItem value="15">15 minutit enne</SelectItem>
                    <SelectItem value="30">30 minutit enne</SelectItem>
                    <SelectItem value="60">1 tund enne</SelectItem>
                    <SelectItem value="1440">1 päev enne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Saada kutse</p>
                  <p className="text-sm text-muted-foreground">
                    Saada automaatselt kalendrikutse kontaktile
                  </p>
                </div>
                <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lisa meeldetuletus</p>
                  <p className="text-sm text-muted-foreground">
                    Lisa automaatselt meeldetuletus kalendrisse
                  </p>
                </div>
                <Switch checked={addReminder} onCheckedChange={setAddReminder} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings("Kalendri")} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvestamine...
                  </>
                ) : (
                  "Salvesta seaded"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integratsioonid</CardTitle>
              <CardDescription>Ühenda rakendus teiste teenustega</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <h3 className="text-lg font-medium mb-2">CRM integratsioon</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Ühenda oma CRM süsteem, et sünkroniseerida kontakte ja tegevusi
                    </p>
                    <Button variant="outline">Ühenda CRM</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <h3 className="text-lg font-medium mb-2">Kalendri integratsioon</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Ühenda oma kalender, et hallata kohtumisi ja tagasihelistamisi
                    </p>
                    <Button variant="outline">Ühenda kalender</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <h3 className="text-lg font-medium mb-2">E-posti integratsioon</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Ühenda oma e-posti konto, et saata ja jälgida e-kirju otse rakendusest
                    </p>
                    <Button variant="outline">Ühenda e-post</Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <h3 className="text-lg font-medium mb-2">VoIP integratsioon</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Ühenda VoIP teenus, et teha kõnesid otse rakendusest
                    </p>
                    <Button variant="outline">Ühenda VoIP</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
