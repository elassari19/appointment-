'use client';

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

// Mock data
const statsData = [
  {
    label: 'patient.upcoming',
    value: '1 Visit',
    subtext: 'Tomorrow, 10:00 AM',
    icon: 'calendar_month',
    variant: 'default' as const,
  },
  {
    label: 'patient.totalReports',
    value: '12',
    subtext: '+2 new this month',
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

const medicalHistoryData = [
  {
    date: 'Oct 24, 2023',
    time: '09:30 AM',
    doctor: 'Dr. James Anderson',
    specialty: 'General Physician',
    type: 'In-Person',
    status: 'Completed',
    hasReport: true,
    hasLab: true,
    initials: 'JA',
  },
  {
    date: 'Sep 12, 2023',
    time: '02:15 PM',
    doctor: 'Dr. Emily White',
    specialty: 'Dermatologist',
    type: 'Video Call',
    status: 'Completed',
    hasReport: true,
    hasLab: false,
    initials: 'EW',
  },
];

const medicationsData = [
  { name: 'Vitamin D3', dosage: 'After breakfast • 1 Tablet', time: '08:00 AM', taken: true },
  { name: 'Omega-3 Fish Oil', dosage: 'With lunch • 2 Softgels', time: '01:00 PM', taken: true },
  { name: 'Metformin', dosage: 'After dinner • 1 Tablet', time: '08:00 PM', taken: false },
];

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

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();

  // Medical History Table Columns
  const medicalHistoryColumns = [
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (row: typeof medicalHistoryData[0]) => (
        <>
          <p className="font-semibold text-foreground">{row.date}</p>
          <p className="text-xs text-muted-foreground">{row.time}</p>
        </>
      ),
    },
    {
      key: 'doctor',
      title: 'Doctor',
      sortable: true,
      render: (row: typeof medicalHistoryData[0]) => (
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
      render: (row: typeof medicalHistoryData[0]) => (
        <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
          {row.type}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row: typeof medicalHistoryData[0]) => (
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
      render: (row: typeof medicalHistoryData[0]) => (
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

  const handleJoinMeeting = () => {
    console.log('Joining meeting...');
  };

  const handleReschedule = () => {
    console.log('Rescheduling appointment...');
  };

  const handleBookNewVisit = () => {
    console.log('Booking new visit...');
  };

  const handleViewAllHistory = () => {
    console.log('Viewing all history...');
  };

  const handleViewFullSchedule = () => {
    console.log('Viewing full schedule...');
  };

  const handleRowClick = (row: typeof medicalHistoryData[0]) => {
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <DashboardHeader
        title={messages.title}
        subtitle={messages.subtitle}
        notificationCount={1}
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
          <Section title={t('patient.nextAppointment')}>
            <AppointmentCard
              specialty="Cardiologist"
              date="Tomorrow at 10:00 AM"
              doctorName="Dr. Sarah Mitchell"
              doctorInitials="SM"
              description="Routine check-up to review your cardiovascular health and discuss recent laboratory results."
              type="Video Call"
              duration="30 Minutes"
              onJoin={handleJoinMeeting}
              onReschedule={handleReschedule}
            />
          </Section>

          {/* Medical History */}
          <Section title={t('patient.medicalHistory')} actionLabel={t('patient.viewAll')} onAction={handleViewAllHistory}>
            <DataTable
              columns={medicalHistoryColumns}
              data={medicalHistoryData}
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
