import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText, Apple, Activity, MoreHorizontal, TrendingUp, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PatientDashboardPage() {
  const stats = [
    {
      title: "Upcoming Appointments",
      value: "2",
      description: "This week",
      icon: Calendar,
      trend: "Scheduled",
      trendUp: true,
    },
    {
      title: "Health Score",
      value: "85",
      description: "Out of 100",
      icon: Activity,
      trend: "+5",
      trendUp: true,
    },
    {
      title: "Meal Plans",
      value: "3",
      description: "Active plans",
      icon: Apple,
      trend: "Updated",
      trendUp: true,
    },
    {
      title: "Progress",
      value: "12%",
      description: "Goal achieved",
      icon: TrendingUp,
      trend: "On track",
      trendUp: true,
    },
  ]

  const upcomingAppointments = [
    { 
      dietitian: "Dr. Sarah Johnson", 
      date: "Tomorrow, 2:00 PM", 
      type: "Follow-up",
      status: "Confirmed"
    },
    { 
      dietitian: "Dr. Michael Chen", 
      date: "Friday, 10:00 AM", 
      type: "Initial Consultation",
      status: "Pending"
    },
  ]

  const recentUpdates = [
    { title: "New meal plan available", time: "2 hours ago", type: "plan" },
    { title: "Lab results uploaded", time: "1 day ago", type: "document" },
    { title: "Reminder: Take supplements", time: "2 days ago", type: "reminder" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your health journey and appointments</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
              <p className="text-sm text-muted-foreground">Your scheduled sessions</p>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((apt, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{apt.dietitian}</p>
                      <p className="text-xs text-muted-foreground">{apt.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{apt.date}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      apt.status === 'Confirmed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Updates</CardTitle>
              <p className="text-sm text-muted-foreground">Latest from your care team</p>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update, index) => (
                <div key={index} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    update.type === 'plan' ? 'bg-emerald-100 text-emerald-600' :
                    update.type === 'document' ? 'bg-blue-100 text-blue-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {update.type === 'plan' ? <Apple className="h-5 w-5" /> :
                     update.type === 'document' ? <FileText className="h-5 w-5" /> :
                     <Bell className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{update.title}</p>
                    <p className="text-xs text-muted-foreground">{update.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Book Appointment</h3>
                <p className="text-sm text-muted-foreground">Schedule a new session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">View Records</h3>
                <p className="text-sm text-muted-foreground">Access your health data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Apple className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Meal Plans</h3>
                <p className="text-sm text-muted-foreground">View nutrition plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
