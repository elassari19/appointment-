import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, TrendingUp, Activity, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DietitianDashboardPage() {
  const stats = [
    {
      title: "Today's Appointments",
      value: "4",
      description: "Scheduled for today",
      icon: Calendar,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Patients",
      value: "24",
      description: "Currently managing",
      icon: Users,
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Pending Requests",
      value: "3",
      description: "Awaiting approval",
      icon: Clock,
      trend: "-2",
      trendUp: false,
    },
    {
      title: "Completion Rate",
      value: "87%",
      description: "This month",
      icon: TrendingUp,
      trend: "+3%",
      trendUp: true,
    },
  ]

  const recentActivity = [
    { patient: "Sarah Johnson", action: "Appointment completed", time: "2 hours ago", type: "completed" },
    { patient: "Michael Chen", action: "New appointment request", time: "4 hours ago", type: "pending" },
    { patient: "Emily Davis", action: "Meal plan updated", time: "6 hours ago", type: "completed" },
    { patient: "James Wilson", action: "Follow-up scheduled", time: "8 hours ago", type: "scheduled" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Activity className="h-4 w-4" />
          View Reports
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

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest updates from your patients</p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    activity.type === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    activity.type === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'completed' ? <Activity className="h-5 w-5" /> :
                     activity.type === 'pending' ? <Clock className="h-5 w-5" /> :
                     <Calendar className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.patient}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Schedule Appointment</h3>
                <p className="text-sm text-muted-foreground">Book a new session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">Add Patient</h3>
                <p className="text-sm text-muted-foreground">Register new client</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Check performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
