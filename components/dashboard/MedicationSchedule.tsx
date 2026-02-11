'use client';

interface Medication {
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

interface MedicationScheduleProps {
  date: string;
  completedCount: number;
  totalCount: number;
  medications: Medication[];
  onViewAll?: () => void;
}

export function MedicationSchedule({
  date,
  completedCount,
  totalCount,
  medications,
  onViewAll,
}: MedicationScheduleProps) {
  return (
    <div className="bg-[#2D3339] p-6 rounded-3xl shadow-xl text-white">
      <div className="flex items-center justify-between mb-6">
        <span className="text-white/60 text-sm">{date}</span>
        <span className="bg-primary/20 text-primary px-2 py-1 rounded-lg text-xs font-bold">
          {completedCount}/{totalCount} Completed
        </span>
      </div>
      <div className="space-y-4">
        {medications.map((med, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 p-3 bg-white/5 rounded-2xl border ${
              med.taken ? 'border-white/5' : 'border-white/10 ring-1 ring-primary/30'
            }`}
          >
            <div className="mt-1 flex-shrink-0">
              {med.taken ? (
                <span className="material-icons-round text-emerald-500">check_circle</span>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-primary"></div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{med.name}</p>
              <p className="text-xs text-white/40">{med.dosage}</p>
            </div>
            <span className="text-[10px] text-white/30 font-bold">{med.time}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onViewAll}
        className="w-full mt-6 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-semibold transition-all"
      >
        Full Schedule
      </button>
    </div>
  );
}
