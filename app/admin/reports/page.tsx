'use client';

const reports = [
  {
    title: 'Monthly Revenue',
    value: '$48,250',
    change: '+12.5%',
    icon: 'payments',
    color: 'emerald',
  },
  {
    title: 'Total Appointments',
    value: '1,482',
    change: '+8.2%',
    icon: 'event_available',
    color: 'blue',
  },
  {
    title: 'New Patients',
    value: '128',
    change: '+15.3%',
    icon: 'person_add',
    color: 'primary',
  },
  {
    title: 'Cancellation Rate',
    value: '3.2%',
    change: '-0.8%',
    icon: 'trending_down',
    color: 'rose',
  },
];

const recentTransactions = [
  {
    id: '#TR-001',
    patient: 'Sarah Jenkins',
    amount: '$150.00',
    status: 'Completed',
    date: 'Feb 11, 2026',
    method: 'Credit Card',
  },
  {
    id: '#TR-002',
    patient: 'Michael Roberts',
    amount: '$200.00',
    status: 'Pending',
    date: 'Feb 10, 2026',
    method: 'Insurance',
  },
  {
    id: '#TR-003',
    patient: 'Emily Davis',
    amount: '$175.00',
    status: 'Completed',
    date: 'Feb 9, 2026',
    method: 'Credit Card',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          Completed
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
          {status}
        </span>
      );
  }
};

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Reports & Payments
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            View financial reports and payment history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <span className="material-icons-round">calendar_today</span>
            <span className="text-sm font-semibold">Last 30 Days</span>
          </button>
          <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <span className="material-icons-round text-lg">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {reports.map((report) => (
          <div key={report.title} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm font-medium">
                {report.title}
              </span>
              <span className={`p-2 ${
                report.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                report.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                report.color === 'primary' ? 'bg-primary/20 text-primary-foreground' :
                'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
              } rounded-xl`}>
                <span className="material-icons-round">{report.icon}</span>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-foreground dark:text-white mb-1">
              {report.value}
            </div>
            <div className={`text-[12px] flex items-center gap-1 font-semibold ${
              report.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              <span className="material-icons-round text-sm">
                {report.change.startsWith('+') ? 'trending_up' : 'trending_down'}
              </span>
              {report.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card-stitch p-6">
          <h2 className="text-lg font-bold text-foreground dark:text-white mb-4">
            Revenue Overview
          </h2>
          <div className="h-64 flex items-center justify-center bg-muted/30 dark:bg-muted/10 rounded-2xl">
            <p className="text-muted-foreground">Revenue Chart Coming Soon</p>
          </div>
        </div>
        <div className="card-stitch p-6">
          <h2 className="text-lg font-bold text-foreground dark:text-white mb-4">
            Appointment Statistics
          </h2>
          <div className="h-64 flex items-center justify-center bg-muted/30 dark:bg-muted/10 rounded-2xl">
            <p className="text-muted-foreground">Statistics Chart Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-stitch flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground dark:text-white">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 dark:bg-muted/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Patient</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Method</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">{tx.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{tx.patient}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{tx.amount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{tx.method}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
