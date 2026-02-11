'use client';

import { useState } from 'react';

const stats = [
  {
    label: 'Monthly Recurring Revenue',
    value: '$42,890',
    change: '+12.5%',
    trend: 'up',
    icon: 'payments',
    color: 'amber',
  },
  {
    label: 'Transaction Volume',
    value: '1,542',
    change: '+8%',
    trend: 'up',
    icon: 'receipt_long',
    color: 'blue',
  },
  {
    label: 'Avg. Ticket Size',
    value: '$124.50',
    change: 'stable this month',
    trend: 'stable',
    icon: 'analytics',
    color: 'emerald',
  },
  {
    label: 'Refund Rate',
    value: '1.2%',
    change: '+0.2%',
    trend: 'up',
    icon: 'history_edu',
    color: 'red',
  },
];

const transactions = [
  {
    id: '#TRX-89012',
    patient: { name: 'Emma Williams', email: 'emma.w@mail.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    amount: '$150.00',
    method: 'Visa ·· 4242',
    methodIcon: 'credit_card',
    date: 'Feb 12, 2026',
    status: 'Success',
  },
  {
    id: '#TRX-89013',
    patient: { name: 'Liam Smith', email: 'liam.s@mail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    amount: '$85.00',
    method: 'Bank ACH',
    methodIcon: 'account_balance',
    date: 'Feb 11, 2026',
    status: 'Pending',
  },
  {
    id: '#TRX-89014',
    patient: { name: 'Ava Johnson', email: 'ava.j@mail.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    amount: '$210.00',
    method: 'Master ·· 8812',
    methodIcon: 'credit_card',
    date: 'Feb 11, 2026',
    status: 'Refunded',
  },
  {
    id: '#TRX-89015',
    patient: { name: 'Noah Kim', email: 'noah.k@mail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    amount: '$340.00',
    method: 'Apple Pay',
    methodIcon: 'wallet',
    date: 'Feb 10, 2026',
    status: 'Success',
  },
];

const paymentMethods = [
  { name: 'Credit Card', percent: 65, color: 'indigo', icon: 'credit_card' },
  { name: 'Bank Transfer', percent: 25, color: 'sky', icon: 'account_balance' },
  { name: 'Digital Wallet', percent: 10, color: 'emerald', icon: 'wallet' },
];

const weekData = [
  { day: 'Mon', height: 'h-32', fillHeight: 'h-1/4' },
  { day: 'Tue', height: 'h-40', fillHeight: 'h-2/4' },
  { day: 'Wed', height: 'h-48', fillHeight: 'h-1/3' },
  { day: 'Thu', height: 'h-56', fillHeight: 'h-3/5' },
  { day: 'Fri', height: 'h-60', fillHeight: 'h-4/5' },
  { day: 'Sat', height: 'h-44', fillHeight: 'h-1/3' },
  { day: 'Sun', height: 'h-36', fillHeight: 'h-1/6' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Success':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Success
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending
        </span>
      );
    case 'Refunded':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Refunded
        </span>
      );
    default:
      return null;
  }
};

const getIconBgColor = (color: string) => {
  switch (color) {
    case 'amber':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'blue':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'emerald':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'red':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <span className="material-icons-outlined">search</span>
          </span>
          <input
            type="text"
            placeholder="Search for transactions, patients, reports..."
            className="w-full pl-10 pr-4 py-2 bg-card border-none rounded-xl focus:ring-2 focus:ring-primary shadow-sm text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
            <span className="material-icons-outlined">notifications</span>
          </button>
          <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
            <span className="material-icons-outlined">dark_mode</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">A</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">Detailed reports and payment analytics for February 2026.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card p-6 rounded-2xl shadow-sm border border-border flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{stat.value}</h3>
                <p className={`text-xs mt-2 flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-500' : 
                  stat.trend === 'stable' ? 'text-muted-foreground' : 'text-red-500'
                }`}>
                  <span className="material-icons-outlined text-xs">trending_up</span>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor(stat.color)}`}>
                <span className="material-icons-outlined">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Growth Chart */}
          <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-foreground">Revenue Growth</h3>
                <p className="text-sm text-muted-foreground">Weekly progression of earnings</p>
              </div>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-muted border-none text-sm rounded-lg focus:ring-primary"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {weekData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className={`w-full bg-muted dark:bg-slate-800 rounded-t-lg ${day.height} relative overflow-hidden`}>
                    <div className={`absolute bottom-0 w-full bg-primary/20 h-1/2`}></div>
                    <div className={`absolute bottom-0 w-full bg-primary ${day.fillHeight} rounded-t-sm transition-all group-hover:opacity-80`}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Payment Methods</h3>
            <div className="space-y-6">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      method.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                      method.color === 'sky' ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' :
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      <span className="material-icons-outlined text-sm">{method.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{method.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 px-4">
                    <div className="w-full h-2 bg-muted dark:bg-slate-800 rounded-full">
                      <div 
                        className={`h-full rounded-full ${
                          method.color === 'indigo' ? 'bg-indigo-500' :
                          method.color === 'sky' ? 'bg-sky-500' :
                          'bg-emerald-500'
                        }`} 
                        style={{ width: `${method.percent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold w-8 text-muted-foreground">{method.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                "Credit card usage has increased by 4% since the integration of Apple Pay last month."
              </p>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-lg font-bold dark:text-white">Payment History</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-icons-outlined text-sm">download</span>
                CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-icons-outlined text-sm">picture_as_pdf</span>
                PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                <span className="material-icons-outlined text-sm">filter_alt</span>
                Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <img src={tx.patient.avatar} alt={tx.patient.name} className="w-full h-full rounded-full" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold dark:text-white">{tx.patient.name}</p>
                          <p className="text-xs text-slate-400">{tx.patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{tx.id}</td>
                    <td className="px-6 py-4 text-sm font-bold dark:text-white">{tx.amount}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <span className="material-icons-outlined text-sm">{tx.methodIcon}</span>
                        {tx.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{tx.date}</td>
                    <td className="px-6 py-4">
                      {tx.status === 'Success' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Success
                        </span>
                      )}
                      {tx.status === 'Pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pending
                        </span>
                      )}
                      {tx.status === 'Refunded' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Refunded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-icons-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing 1-4 of 1,542 transactions</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-primary bg-primary text-slate-900 font-bold">1</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">2</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">3</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto pb-6 text-center text-muted-foreground text-xs">
          © 2026 MediCare Admin Portal. All rights reserved. Precise financial data updated as of 14:32 PM UTC.
        </footer>
      </div>
    </div>
  );
}
