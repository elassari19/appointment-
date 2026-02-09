export default function DietitianDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Dietitian Dashboard</h1>
      <p className="mb-6">Welcome to your dietitian dashboard. Here you can manage your schedule, patients, and appointments.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <div className="bg-card p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Today's Appointments</h2>
          <p>You have 4 appointments scheduled today.</p>
        </div>
        
        <div className="bg-card p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Patient Count</h2>
          <p>You are currently managing 24 active patients.</p>
        </div>
        
        <div className="bg-card p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Pending Requests</h2>
          <p>You have 3 appointment requests awaiting approval.</p>
        </div>
      </div>
    </div>
  )
}