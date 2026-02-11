'use client';

const doctors = [
  {
    id: '#DR-001',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Cardiologist',
    email: 's.mitchell@medicare.com',
    phone: '+1 (555) 111-2222',
    status: 'Active',
    patients: 124,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '#DR-002',
    name: 'Dr. James Wilson',
    specialty: 'General Practitioner',
    email: 'j.wilson@medicare.com',
    phone: '+1 (555) 222-3333',
    status: 'Active',
    patients: 89,
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '#DR-003',
    name: 'Dr. Alex Carter',
    specialty: 'Dermatologist',
    email: 'a.carter@medicare.com',
    phone: '+1 (555) 333-4444',
    status: 'On Leave',
    patients: 56,
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face',
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
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
      On Leave
    </span>
  );
};

export default function DoctorsPage() {
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
            Doctors Directory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and view all medical practitioners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <input
              type="text"
              placeholder="Search doctors..."
              className="pl-10 pr-4 py-2.5 w-64 bg-card border-border rounded-xl text-sm border"
            />
          </div>
          <button className="bg-primary hover:opacity-90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <span className="material-icons-round text-lg">add</span>
            <span>Add Doctor</span>
          </button>
        </div>
      </header>

      {/* Doctors Table */}
      <div className="card-stitch flex flex-col overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 dark:bg-muted/20">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Doctor</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Specialty</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Patients</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rating</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="group hover:bg-muted/30 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">{doctor.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={doctor.avatar} alt={doctor.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{doctor.specialty}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{doctor.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-foreground">{doctor.patients}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="material-icons-round text-amber-500 text-sm">star</span>
                      <span className="text-sm font-bold text-foreground">{doctor.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(doctor.status)}</td>
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
