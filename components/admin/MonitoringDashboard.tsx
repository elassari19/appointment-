'use client';

import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  averagePageLoadTime: number;
  apiResponseTimeP50: number;
  apiResponseTimeP95: number;
  errorRate: number;
  uptimePercentage: number;
  concurrentUsersPeak: number;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivities: number;
  blockedIPs: number;
  securityIncidentsLast30Days: number;
  complianceScore: number;
}

interface UtilizationMetrics {
  averageSlotFillRate: number;
  peakHoursUtilization: { hour: number; rate: number }[];
  dayOfWeekUtilization: { day: string; rate: number }[];
  noShowRate: number;
  averageBookingLeadTime: number;
}

interface SatisfactionMetrics {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
  responseRate: number;
  npsScore: number;
}

interface FinancialMetrics {
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  customerAcquisitionCost: number;
  lifetimeValue: number;
  paymentSuccessRate: number;
  refundRate: number;
}

function MetricCard({ title, value, subtitle, icon, trend, status }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
}) {
  const statusColors = {
    good: 'text-emerald-500',
    warning: 'text-amber-500',
    critical: 'text-red-500',
  };

  const trendIcons = {
    up: 'trending_up',
    down: 'trending_down',
    stable: 'trending_flat',
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${status ? statusColors[status] : ''}`}>{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={`material-icons-round text-sm ${
              trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
            }`}>
              {trendIcons[trend]}
            </span>
          )}
          <span className="material-icons-round text-muted-foreground">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max = 100, color = 'primary' }: { value: number; max?: number; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses: { [key: string]: string } = {
    primary: 'bg-primary',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-full bg-muted rounded-full h-2 mt-2">
      <div
        className={`${colorClasses[color] || colorClasses.primary} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function MonitoringDashboard() {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [security, setSecurity] = useState<SecurityMetrics | null>(null);
  const [utilization, setUtilization] = useState<UtilizationMetrics | null>(null);
  const [satisfaction, setSatisfaction] = useState<SatisfactionMetrics | null>(null);
  const [financial, setFinancial] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [perfRes, secRes, utilRes, satRes, finRes] = await Promise.all([
          fetch('/api/admin/analytics/performance'),
          fetch('/api/admin/analytics/security'),
          fetch('/api/admin/analytics/utilization'),
          fetch('/api/admin/analytics/satisfaction'),
          fetch('/api/admin/analytics/financial'),
        ]);

        if (perfRes.ok) setPerformance(await perfRes.json());
        if (secRes.ok) setSecurity(await secRes.json());
        if (utilRes.ok) setUtilization(await utilRes.json());
        if (satRes.ok) setSatisfaction(await satRes.json());
        if (finRes.ok) setFinancial(await finRes.json());

        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-time Monitoring</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="material-icons-round text-xs animate-pulse">sync</span>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Uptime"
          value={`${performance?.uptimePercentage || 0}%`}
          subtitle="Last 30 days"
          icon="speed"
          trend="stable"
          status={performance && performance.uptimePercentage >= 99 ? 'good' : performance && performance.uptimePercentage >= 95 ? 'warning' : 'critical'}
        />
        <MetricCard
          title="API Response (P95)"
          value={`${performance?.apiResponseTimeP95 || 0}ms`}
          subtitle="95th percentile"
          icon="schedule"
          trend={performance && performance.apiResponseTimeP95 < 500 ? 'stable' : 'up'}
          status={performance && performance.apiResponseTimeP95 < 500 ? 'good' : performance && performance.apiResponseTimeP95 < 1000 ? 'warning' : 'critical'}
        />
        <MetricCard
          title="Error Rate"
          value={`${performance?.errorRate || 0}%`}
          subtitle="Last hour"
          icon="error"
          trend={performance && performance.errorRate < 1 ? 'stable' : 'up'}
          status={performance && performance.errorRate < 1 ? 'good' : performance && performance.errorRate < 5 ? 'warning' : 'critical'}
        />
        <MetricCard
          title="Active Users"
          value={performance?.concurrentUsersPeak || 0}
          subtitle="Peak concurrent"
          icon="people"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-2xl border border-border/60">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons-round text-amber-500">security</span>
            Security Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Compliance Score</span>
              <span className="font-semibold">{security?.complianceScore || 0}%</span>
            </div>
            <ProgressBar value={security?.complianceScore || 0} color="emerald" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Failed Logins</p>
                <p className="text-xl font-bold text-red-500">{security?.failedLoginAttempts || 0}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Blocked IPs</p>
                <p className="text-xl font-bold text-amber-500">{security?.blockedIPs || 0}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Suspicious Activity</p>
                <p className="text-xl font-bold">{security?.suspiciousActivities || 0}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Incidents (30d)</p>
                <p className="text-xl font-bold text-emerald-500">{security?.securityIncidentsLast30Days || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border/60">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons-round text-primary">people</span>
            User Satisfaction
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">{satisfaction?.averageRating || 0}</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`material-icons-round text-sm ${
                      star <= Math.round(satisfaction?.averageRating || 0) ? 'text-amber-400' : 'text-muted'
                    }`}
                  >
                    {star <= Math.round(satisfaction?.averageRating || 0) ? 'star' : 'star_border'}
                  </span>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                ({satisfaction?.totalRatings || 0} reviews)
              </div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = satisfaction?.ratingDistribution?.[rating] || 0;
                const total = satisfaction?.totalRatings || 1;
                const percentage = (count / total) * 100;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-xs w-6">{rating}</span>
                    <span className="material-icons-round text-amber-400 text-xs">star</span>
                    <ProgressBar value={percentage} color="amber" />
                    <span className="text-xs text-muted-foreground w-12">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">NPS Score</p>
                <p className="text-2xl font-bold text-emerald-500">{satisfaction?.npsScore || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{satisfaction?.responseRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Slot Fill Rate"
          value={`${utilization?.averageSlotFillRate || 0}%`}
          subtitle="Average utilization"
          icon="event_seat"
          trend={utilization && utilization.averageSlotFillRate >= 70 ? 'stable' : 'down'}
          status={utilization && utilization.averageSlotFillRate >= 70 ? 'good' : 'warning'}
        />
        <MetricCard
          title="No-Show Rate"
          value={`${utilization?.noShowRate || 0}%`}
          subtitle="Appointment no-shows"
          icon="event_busy"
          trend={utilization && utilization.noShowRate < 10 ? 'stable' : 'up'}
          status={utilization && utilization.noShowRate < 10 ? 'good' : utilization && utilization.noShowRate < 20 ? 'warning' : 'critical'}
        />
        <MetricCard
          title="MRR"
          value={`$${((financial?.monthlyRecurringRevenue || 0) / 1000).toFixed(1)}K`}
          subtitle="Monthly recurring revenue"
          icon="attach_money"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-border/60">
          <h3 className="text-lg font-semibold mb-4">Peak Hours Utilization</h3>
          <div className="flex items-end gap-2 h-32">
            {utilization?.peakHoursUtilization.map((item) => (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${
                    item.rate >= 90 ? 'bg-primary' : item.rate >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ height: `${item.rate}%`, minHeight: '4px' }}
                />
                <span className="text-xs text-muted-foreground">{item.hour}:00</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border/60">
          <h3 className="text-lg font-semibold mb-4">Financial Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Payment Success</p>
              <p className="text-xl font-bold text-emerald-500">{financial?.paymentSuccessRate || 0}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Refund Rate</p>
              <p className="text-xl font-bold">{financial?.refundRate || 0}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">ARPU</p>
              <p className="text-xl font-bold">${financial?.averageRevenuePerUser || 0}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">LTV</p>
              <p className="text-xl font-bold">${financial?.lifetimeValue || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
