export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p>Welcome to the admin dashboard. Here you can manage the entire platform, users, and system settings.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Total Patients</h2>
          <p>There are 1,248 registered patients.</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Total Dietitians</h2>
          <p>There are 32 registered dietitians.</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Active Appointments</h2>
          <p>There are 156 active appointments this month.</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">System Status</h2>
          <p>All systems operational.</p>
        </div>
      </div>
    </div>
  )
}