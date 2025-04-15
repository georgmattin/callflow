"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Phone, Calendar, Clock, Users, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { CallStatistics } from "@/components/dashboard/call-statistics"
import { RecentCalls } from "@/components/dashboard/recent-calls"
import { UpcomingCallbacks } from "@/components/dashboard/upcoming-callbacks"
import { ContactsOverview } from "@/components/dashboard/contacts-overview"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dailyGoal, setDailyGoal] = useState(30)
  const [dailyProgress, setDailyProgress] = useState(0)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [userName, setUserName] = useState("kasutaja")

  useEffect(() => {
    // Fetch actual dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        setDashboardData(data)
        
        // Calculate daily progress from todayStats
        if (data.todayStats) {
          const totalCallsToday = data.todayStats.reduce((sum: number, item: any) => 
            sum + parseInt(item.count), 0)
          setDailyProgress(totalCallsToday)
        }

        // Get user name from local storage or set a default
        const storedUserName = localStorage.getItem('userName') || "kasutaja"
        setUserName(storedUserName)
        
        // Fetch user settings to get daily call target
        try {
          const settingsResponse = await fetch('/api/settings/user')
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json()
            if (settingsData.daily_call_target) {
              setDailyGoal(settingsData.daily_call_target)
            }
          }
        } catch (settingsError) {
          console.error("Error fetching user settings:", settingsError)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setIsLoading(false)
        toast({
          title: "Viga",
          description: "Andmete laadimine ebaõnnestus",
          variant: "destructive",
        })
      }
    }

    fetchDashboardData()
  }, [toast])

  const handleStartCalling = () => {
    toast({
      title: "Helistamine alustatud",
      description: "Suunatakse helistamise vaatesse...",
    })

    // In a real app, this would navigate to the calling page
    setTimeout(() => {
      router.push("/calling")
    }, 1000)
  }

  // Calculate statistics for different time periods
  const calculateStats = (period: 'today' | 'week' | 'month') => {
    // Base empty stats structure
    const emptyStats = {
      totalCalls: 0,
      meetings: 0,
      callbacks: 0,
      noAnswers: 0,
      notInterested: 0,
    }
    
    // Select data based on period
    let periodData
    
    if (period === 'today' && dashboardData?.todayStats) {
      periodData = dashboardData.todayStats
    } else if (period === 'week' && dashboardData?.weekStats) {
      periodData = dashboardData.weekStats
    } else if (period === 'month' && dashboardData?.monthStats) {
      periodData = dashboardData.monthStats
    } else {
      return emptyStats
    }
    
    // Process the selected period's data
    return periodData.reduce((stats: any, item: any) => {
      const count = parseInt(item.count)
      stats.totalCalls += count

      // Map the result to the appropriate category
      switch (item.result) {
        case 'Kohtumine':
          stats.meetings += count
          break
        case 'Helista hiljem':
          stats.callbacks += count
          break
        case 'Ei vastanud':
          stats.noAnswers += count
          break
        case 'Pole huvitatud':
          stats.notInterested += count
          break
      }

      return stats
    }, {
      totalCalls: 0,
      meetings: 0,
      callbacks: 0,
      noAnswers: 0,
      notInterested: 0,
    })
  }

  // Create stats for different time periods
  const todayStats = calculateStats('today')
  const weekStats = calculateStats('week')
  const monthStats = calculateStats('month')

  // Get next callback time
  const getNextCallbackTime = () => {
    if (!dashboardData?.upcomingCallbacks || dashboardData.upcomingCallbacks.length === 0) {
      return "puudub"
    }
    
    const nextCallback = dashboardData.upcomingCallbacks[0]
    const today = new Date().toISOString().split('T')[0]
    
    if (nextCallback.callbackDate === today) {
      return `täna ${nextCallback.callbackTime || ''}`
    } else if (new Date(nextCallback.callbackDate) > new Date()) {
      return `${nextCallback.callbackDate} ${nextCallback.callbackTime || ''}`
    }
    
    return "puudub"
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Töölaud</h1>
          <p className="text-muted-foreground">Tere tulemast tagasi, {userName}!</p>
        </div>
        <Button onClick={handleStartCalling} className="bg-primary hover:bg-primary/90">
          <Phone className="mr-2 h-4 w-4" />
          Alusta helistamist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tänane eesmärk</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {dailyProgress} / {dailyGoal}
                  </div>
                  <Badge variant={dailyProgress >= dailyGoal ? "success" : "default"} className="ml-auto">
                    {Math.round((dailyProgress / dailyGoal) * 100)}%
                  </Badge>
                </div>
                <Progress value={(dailyProgress / dailyGoal) * 100} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {dailyGoal - dailyProgress > 0
                    ? `Veel ${dailyGoal - dailyProgress} kõnet tänase eesmärgi saavutamiseks`
                    : "Tänane eesmärk on saavutatud!"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Planeeritud tagasihelistamised</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-8 ml-auto" />
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {dashboardData?.upcomingCallbacks?.length || 0}
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => router.push("/contacts")}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Järgmine: {getNextCallbackTime()}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kontaktid</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-muted-foreground mr-2" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-8 ml-auto" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {dashboardData?.contactsStats?.total || 0}
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => router.push("/contacts")}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-muted-foreground">
                    {`${dashboardData?.contactsStats?.listsCount || 0} nimekirja`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {`${dashboardData?.contactsStats?.newThisWeek || 0} uut sel nädalal`}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="mb-8">
        <TabsList>
          <TabsTrigger value="today">Täna</TabsTrigger>
          <TabsTrigger value="week">Sel nädalal</TabsTrigger>
          <TabsTrigger value="month">Sel kuul</TabsTrigger>
        </TabsList>
        {isLoading ? (
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-24 mb-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <TabsContent value="today" className="pt-4">
              <CallStatistics stats={todayStats} />
            </TabsContent>
            <TabsContent value="week" className="pt-4">
              <CallStatistics stats={weekStats} />
            </TabsContent>
            <TabsContent value="month" className="pt-4">
              <CallStatistics stats={monthStats} />
            </TabsContent>
          </>
        )}
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Hiljutised kõned</CardTitle>
                <CardDescription>Viimased tehtud kõned</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentCalls
                  calls={dashboardData?.recentCalls || []}
                  isLoading={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planeeritud tagasihelistamised</CardTitle>
                <CardDescription>Järgmised planeeritud tagasihelistamised</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingCallbacks
                  callbacks={dashboardData?.upcomingCallbacks || []}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Kontaktide ülevaade</CardTitle>
            <CardDescription>Kontaktide jaotus staatuse järgi</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactsOverview statusCountsData={dashboardData?.statusCounts} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
