'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  DashboardHeader,
  StatCard,
  QuickActionCard,
  AppointmentCard,
  MedicationSchedule,
  WeeklyProgress,
  DataTable,
  Section,
} from '@/components/dashboard';

interface NextAppointment {
  id: string;
  specialty: string;
  date: string;
  formattedDate: string;
  formattedTime: string;
  doctorName: string;
  doctorInitials: string;
  description: string;
  type: string;
  duration: string;
}

interface DashboardData {
  nextAppointment: NextAppointment | null;
  upcomingAppointments: Array<{
    id: string;
    date: string;
    formattedDate: string;
    formattedTime: string;
    doctorName: string;
    specialty: string;
    status: string;
    type: string;
  }>;
  medicalHistory: MedicalHistoryRow[];
  stats: {
    upcomingCount: number;
    completedCount: number;
    cancelledCount: number;
    totalReports: number;
  };
}

interface MedicalHistoryRow {
  id: string;
  date: string;
  formattedDate: string;
  formattedTime: string;
  doctor: string;
  specialty: string;
  type: string;
  status: string;
  hasReport: boolean;
  hasLab: boolean;
  initials: string;
  [key: string]: unknown;
}

const weeklyProgressData = [
  { day: 'M', height: '65%' },
  { day: 'T', height: '45%' },
  { day: 'W', height: '80%' },
  { day: 'T', height: '90%', isToday: true },
  { day: 'F', height: '30%' },
  { day: 'S', height: '15%' },
  { day: 'S', height: '40%' },
];

const weeklyStatsData = [
  { label: 'Steps Avg.', value: '8,432' },
  { label: 'Active Min.', value: '42m' },
];

const medicationsData = [
  { name: 'Vitamin D3', dosage: 'After breakfast • 1 Tablet', time: '08:00 AM', taken: true },
  { name: 'Omega-3 Fish Oil', dosage: 'With lunch • 2 Softgels', time: '01:00 PM', taken: true },
  { name: 'Metformin', dosage: 'After dinner • 1 Tablet', time: '08:00 PM', taken: false },
];

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/patient/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleJoinMeeting = () => {
    console.log('Joining meeting...');
  };

  const handleReschedule = () => {
    console.log('Rescheduling appointment...');
  };

  const handleBookNewVisit = () => {
    router.push('/patient/book');
  };

  const handleViewAllHistory = () => {
    console.log('Viewing all history...');
  };

  const handleViewFullSchedule = () => {
    console.log('Viewing full schedule...');
  };

  const handleRowClick = (row: MedicalHistoryRow) => {
    console.log('Clicked row:', row);
  };

  const getWelcomeMessage = () => {
    if (!user) return { title: t('dashboard.welcome'), subtitle: '' };
    return {
      title: `${t('dashboard.welcomeBack')}, ${user.firstName}`,
      subtitle: t('dashboard.todaySummary'),
    };
  };

  const messages = getWelcomeMessage();

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  const statsData = [
    {
      label: 'patient.upcoming',
      value: data?.stats.upcomingCount ? `${data.stats.upcomingCount} Visit${data.stats.upcomingCount !== 1 ? 's' : ''}` : '0 Visits',
      subtext: data?.nextAppointment 
        ? `${data.nextAppointment.formattedDate} at ${data.nextAppointment.formattedTime}`
        : 'No upcoming visits',
      icon: 'calendar_month',
      variant: 'default' as const,
    },
    {
      label: 'patient.totalReports',
      value: data?.stats.totalReports.toString() || '0',
      subtext: `+${data?.stats.completedCount || 0} completed`,
      icon: 'folder_open',
      variant: 'default' as const,
    },
    {
      label: 'patient.healthScore',
      value: '92%',
      subtext: '+3% vs last month',
      icon: 'favorite',
      variant: 'success' as const,
    },
  ];

  const medicalHistoryColumns = [
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (row: MedicalHistoryRow) => (
        <>
          <p className="font-semibold text-foreground">{row.formattedDate}</p>
          <p className="text-xs text-muted-foreground">{row.formattedTime}</p>
        </>
      ),
    },
    {
      key: 'doctor',
      title: 'Doctor',
      sortable: true,
      render: (row: MedicalHistoryRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {row.initials}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.doctor}</p>
            <p className="text-xs text-muted-foreground">{row.specialty}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (row: MedicalHistoryRow) => (
        <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
          {row.type}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row: MedicalHistoryRow) => (
        <div className="flex items-center gap-1.5 text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold">{row.status}</span>
        </div>
      ),
    },
    {
      key: 'documents',
      title: 'Documents',
      align: 'right' as const,
      render: (row: MedicalHistoryRow) => (
        <div className="flex justify-end gap-2">
          {row.hasReport && (
            <button
              className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
              title="View Prescription"
            >
              <span className="material-icons-round text-lg">description</span>
            </button>
          )}
          {row.hasLab && (
            <button
              className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-all"
              title="View Lab Report"
            >
              <span className="material-icons-round text-lg">biotech</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <DashboardHeader
        title={messages.title}
        subtitle={messages.subtitle}
        notificationCount={0}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            subtext={stat.subtext}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
        <QuickActionCard
          title={t('patient.bookNewVisit')}
          subtitle={t('patient.quickAction')}
          actionLabel={t('patient.bookNow')}
          icon="add_circle"
          onClick={handleBookNewVisit}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Next Appointment */}
          {data?.nextAppointment && (
            <Section title={t('patient.nextAppointment')}>
              <AppointmentCard
                specialty={data.nextAppointment.specialty}
                date={`${data.nextAppointment.formattedDate} at ${data.nextAppointment.formattedTime}`}
                doctorName={data.nextAppointment.doctorName}
                doctorInitials={data.nextAppointment.doctorInitials}
                description={data.nextAppointment.description}
                type={data.nextAppointment.type}
                duration={data.nextAppointment.duration}
                onJoin={handleJoinMeeting}
                onReschedule={handleReschedule}
              />
            </Section>
          )}

          {/* Medical History */}
          <Section title={t('patient.medicalHistory')} actionLabel={t('patient.viewAll')} onAction={handleViewAllHistory}>
            <DataTable
              columns={medicalHistoryColumns}
              data={data?.medicalHistory || []}
              onRowClick={handleRowClick}
              sortable={true}
            />
          </Section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Medication Schedule */}
          <Section title={t('patient.medicationSchedule')}>
            <MedicationSchedule
              date="Today, Oct 25"
              completedCount={3}
              totalCount={5}
              medications={medicationsData}
              onViewAll={handleViewFullSchedule}
            />
          </Section>

          {/* Weekly Progress */}
          <Section title={t('patient.weeklyProgress')}>
            <WeeklyProgress days={weeklyProgressData} stats={weeklyStatsData} />
          </Section>
        </div>
      </div>
    </div>
  );
}
