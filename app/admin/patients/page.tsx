'use client';

const patients = [
  {
    id: '#PT-001',
    name: 'Sarah Jenkins',
    email: 'sarahj@example.com',
    phone: '+1 (555) 123-4567',
    age: 32,
    gender: 'Female',
    status: 'Active',
    lastVisit: 'Feb 10, 2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '#PT-002',
    name: 'Michael Roberts',
    email: 'm.roberts@email.com',
    phone: '+1 (555) 234-5678',
    age: 45,
    gender: 'Male',
    status: 'Active',
    lastVisit: 'Feb 8, 2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '#PT-003',
    name: 'Emily Davis',
    email: 'emily.d@test.com',
    phone: '+1 (555) 345-6789',
    age: 28,
    gender: 'Female',
    status: 'Inactive',
    lastVisit: 'Jan 15, 2026',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

const getStatusBadge = (status: string) => {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2"></span>
      Inactive
    </span>
  );
};

export default function PatientsPage() {
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Patients Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and view all patient records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 pr-4 py-2.5 w-64 bg-card border-border rounded-xl text-sm border"
            />
          </div>
          <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <span className="material-icons-round text-lg">add</span>
            <span>Add Patient</span>
          </button>
        </div>
      </header>

      {/* Patients Table */}
      <div className="card-stitch flex flex-col overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 dark:bg-muted/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Patient</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Age/Gender</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Last Visit</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.map((patient) => (
                <tr key={patient.id} className="group hover:bg-muted/30 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">{patient.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={patient.avatar} alt={patient.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{patient.age} / {patient.gender}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(patient.status)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{patient.lastVisit}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-icons-round text-lg">visibility</span>
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-icons-round text-lg">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
