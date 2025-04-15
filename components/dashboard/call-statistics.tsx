"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Phone, Calendar, Clock, X } from "lucide-react"

interface CallStatisticsProps {
  stats: {
    totalCalls: number
    meetings: number
    callbacks: number
    noAnswers: number
    notInterested: number
  }
}

export function CallStatistics({ stats }: CallStatisticsProps) {
  const { totalCalls, meetings, callbacks, noAnswers, notInterested } = stats

  // Calculate percentages
  const meetingsPercentage = totalCalls > 0 ? Math.round((meetings / totalCalls) * 100) : 0
  const callbacksPercentage = totalCalls > 0 ? Math.round((callbacks / totalCalls) * 100) : 0
  const noAnswersPercentage = totalCalls > 0 ? Math.round((noAnswers / totalCalls) * 100) : 0
  const notInterestedPercentage = totalCalls > 0 ? Math.round((notInterested / totalCalls) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-sm text-muted-foreground">Kõnesid kokku</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">{meetings}</div>
            <p className="text-sm text-green-700">Kohtumisi</p>
            <p className="text-xs text-green-600">{meetingsPercentage}% kõnedest</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-blue-100 p-3 mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{callbacks}</div>
            <p className="text-sm text-blue-700">Tagasihelistamisi</p>
            <p className="text-xs text-blue-600">{callbacksPercentage}% kõnedest</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-amber-100 p-3 mb-3">
              <X className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{noAnswers}</div>
            <p className="text-sm text-amber-700">Ei vastanud</p>
            <p className="text-xs text-amber-600">{noAnswersPercentage}% kõnedest</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-100 p-3 mb-3">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">{notInterested}</div>
            <p className="text-sm text-red-700">Pole huvitatud</p>
            <p className="text-xs text-red-600">{notInterestedPercentage}% kõnedest</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
