export default function PatientDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Patient Dashboard</h1>
      <p className="mb-6">Welcome to your patient dashboard. Here you can manage your appointments, view health records, and communicate with your dietitian.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <div className="bg-card p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Upcoming Appointments</h2>
          <p>You have 2 upcoming appointments this week.</p>
        </div>
        
        <div className="bg-card p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Health Records</h2>
          <p>Your health records are securely stored and accessible.</p>
        </div>
        
        <div className="bg-card p-4 md:p-6 rounded-lg shadow">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Nutrition Plan</h2>
          <p>Your latest nutrition plan is available for review.</p>
        </div>
      </div>
    </div>
  )
}