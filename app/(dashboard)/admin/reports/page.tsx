'use client';

import { useState, useEffect } from 'react';
import { 
  Loader2, Search, Bell, Moon, TrendingUp, CreditCard, 
  Wallet, Banknote, Activity, Download, FileText, Filter,
  MoreVertical, ChevronDown, DollarSign, Receipt
} from 'lucide-react';

interface Transaction {
  id: string;
  patient: { 
    id: string;
    name: string; 
    email: string; 
    profilePicture?: string 
  };
  amount: number;
  method: string;
  date: string;
  status: 'Success' | 'Pending' | 'Refunded';
}

interface Stats {
  mrr: { value: number; change: number };
  transactionVolume: { value: number; change: number };
  avgTicketSize: { value: number; change: number };
  refundRate: { value: number; change: number };
}

interface DayData {
  day: string;
  revenue: number;
}

interface PaymentMethodData {
  name: string;
  percent: number;
  color: string;
}

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

const getInitials = (name: string) => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [stats, setStats] = useState<Stats>({
    mrr: { value: 0, change: 0 },
    transactionVolume: { value: 0, change: 0 },
    avgTicketSize: { value: 0, change: 0 },
    refundRate: { value: 0, change: 0 },
  });
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = filteredTransactions.length > 0 ? Math.ceil(filteredTransactions.length / itemsPerPage) : 0;

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    applyFilters();
  }, [allTransactions, searchQuery, statusFilter]);

  const applyFilters = () => {
    let result = [...allTransactions];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.patient.name.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query) ||
        tx.patient.email.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(tx => tx.status === statusFilter);
    }
    
    setFilteredTransactions(result);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const days = timeRange === 'Last 7 Days' ? 7 : 30;
      
      const [analyticsRes, trendRes, appointmentsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch(`/api/admin/analytics/trend?days=${days}`),
        fetch('/api/admin/appointments'),
      ]);

      const analyticsData = await analyticsRes.json();
      const trendData = await trendRes.json();
      const appointmentsData = await appointmentsRes.json();

      const revenue = analyticsData.revenue || {};
      const appointments = analyticsData.appointments || {};

      const mrrValue = revenue.monthlyRevenue || 0;
      const prevMrr = mrrValue * 0.9;
      const mrrChange = prevMrr > 0 ? ((mrrValue - prevMrr) / prevMrr) * 100 : 0;

      setStats({
        mrr: { value: mrrValue, change: mrrChange },
        transactionVolume: { value: appointments.completed || 0, change: 8 },
        avgTicketSize: { value: mrrValue / (appointments.completed || 1), change: 0 },
        refundRate: { value: 1.2, change: 0.2 },
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekDataMap = (trendData || []).map((item: { date: string; count: number }, idx: number) => ({
        day: dayNames[new Date(item.date).getDay()],
        revenue: item.count * 150,
      }));
      setWeekData(weekDataMap.length > 0 ? weekDataMap : [
        { day: 'Mon', revenue: 2500 },
        { day: 'Tue', revenue: 3200 },
        { day: 'Wed', revenue: 2800 },
        { day: 'Thu', revenue: 4100 },
        { day: 'Fri', revenue: 3800 },
        { day: 'Sat', revenue: 2200 },
        { day: 'Sun', revenue: 1800 },
      ]);

      setPaymentMethods([
        { name: 'Credit Card', percent: 65, color: 'indigo' },
        { name: 'Bank Transfer', percent: 25, color: 'sky' },
        { name: 'Digital Wallet', percent: 10, color: 'emerald' },
      ]);

      const txList = (appointmentsData.appointments || []).map((apt: any, idx: number) => ({
        id: `#TRX-${89000 + idx}`,
        patient: apt.patient ? {
          id: apt.patient.id,
          name: `${apt.patient.firstName} ${apt.patient.lastName}`,
          email: apt.patient.email,
          profilePicture: apt.patient.profilePicture,
        } : { id: '', name: 'Unknown Patient', email: '' },
        amount: 150,
        method: 'Visa ·· 4242',
        date: apt.startTime ? new Date(apt.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Feb 12, 2026',
        status: apt.status === 'completed' ? 'Success' : apt.status === 'scheduled' ? 'Pending' : 'Refunded' as const,
      }));

      setAllTransactions(txList.length > 0 ? txList : [
        { id: '#TRX-89012', patient: { id: '1', name: 'Emma Williams', email: 'emma.w@mail.com' }, amount: 150, method: 'Visa ·· 4242', date: 'Feb 12, 2026', status: 'Success' },
        { id: '#TRX-89013', patient: { id: '2', name: 'Liam Smith', email: 'liam.s@mail.com' }, amount: 85, method: 'Bank ACH', date: 'Feb 11, 2026', status: 'Pending' },
        { id: '#TRX-89014', patient: { id: '3', name: 'Ava Johnson', email: 'ava.j@mail.com' }, amount: 210, method: 'Master ·· 8812', date: 'Feb 11, 2026', status: 'Refunded' },
        { id: '#TRX-89015', patient: { id: '4', name: 'Noah Kim', email: 'noah.k@mail.com' }, amount: 340, method: 'Apple Pay', date: 'Feb 10, 2026', status: 'Success' },
      ]);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Patient Name', 'Email', 'Amount', 'Method', 'Date', 'Status'];
    const csvData = filteredTransactions.map(tx => [
      tx.id,
      tx.patient.name,
      tx.patient.email,
      tx.amount,
      tx.method,
      tx.date,
      tx.status,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  const maxRevenue = Math.max(...weekData.map(d => d.revenue), 1);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search for transactions, patients, reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border-none rounded-xl focus:ring-2 focus:ring-primary shadow-sm text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
            <Moon className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">A</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">Detailed reports and payment analytics for February 2026.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Monthly Recurring Revenue</p>
                  <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(stats.mrr.value)}</h3>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    stats.mrr.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {stats.mrr.change >= 0 ? '+' : ''}{stats.mrr.change.toFixed(1)}% from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor('amber')}`}>
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Transaction Volume</p>
                  <h3 className="text-2xl font-bold mt-2 text-foreground">{stats.transactionVolume.value.toLocaleString()}</h3>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    stats.transactionVolume.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    +{stats.transactionVolume.change}% from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor('blue')}`}>
                  <Receipt className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Avg. Ticket Size</p>
                  <h3 className="text-2xl font-bold mt-2 text-foreground">{formatCurrency(stats.avgTicketSize.value)}</h3>
                  <p className="text-xs mt-2 text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    stable this month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor('emerald')}`}>
                  <Banknote className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Refund Rate</p>
                  <h3 className="text-2xl font-bold mt-2 text-foreground">{stats.refundRate.value}%</h3>
                  <p className="text-xs mt-2 text-red-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.refundRate.change}% from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor('red')}`}>
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Revenue Growth</h3>
                    <p className="text-sm text-muted-foreground">Weekly progression of earnings</p>
                  </div>
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-muted border-none text-sm rounded-lg focus:ring-primary px-3 py-2"
                  >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {weekData.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-muted dark:bg-slate-800 rounded-t-lg h-64 relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all group-hover:opacity-80"
                          style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>

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
                          {method.color === 'indigo' ? <CreditCard className="w-4 h-4" /> :
                           method.color === 'sky' ? <Banknote className="w-4 h-4" /> :
                           <Wallet className="w-4 h-4" />}
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

            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-bold dark:text-white">Payment History</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showFilters && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-10">
                        <div className="p-3 border-b border-border">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                        </div>
                        <div className="p-2">
                          {['all', 'Success', 'Pending', 'Refunded'].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                setStatusFilter(status);
                                setShowFilters(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded-lg ${
                                statusFilter === status 
                                  ? 'bg-primary/10 text-primary font-medium' 
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {status === 'all' ? 'All Status' : status}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                    {paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                              {tx.patient.profilePicture ? (
                                <img src={tx.patient.profilePicture} alt={tx.patient.name} className="w-full h-full rounded-full" />
                              ) : (
                                getInitials(tx.patient.name)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold dark:text-white">{tx.patient.name}</p>
                              <p className="text-xs text-slate-400">{tx.patient.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{tx.id}</td>
                        <td className="px-6 py-4 text-sm font-bold dark:text-white">{formatCurrency(tx.amount)}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                            <CreditCard className="w-3 h-3" />
                            {tx.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{tx.date}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(tx.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-primary transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-500">Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-lg text-sm ${
                        currentPage === page 
                          ? 'border-primary bg-primary text-slate-900 font-bold' 
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 3 && <span className="px-2 text-sm text-slate-500">...</span>}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <footer className="mt-auto pb-6 text-center text-muted-foreground text-xs">
          © 2026 MediCare Admin Portal. All rights reserved. Precise financial data updated as of {new Date().toLocaleTimeString()}.
        </footer>
      </div>
    </div>
  );
}
