'use client';

interface DayData {
  day: string;
  height: string;
  isToday?: boolean;
}

interface Stat {
  label: string;
  value: string;
}

interface WeeklyProgressProps {
  days: DayData[];
  stats: Stat[];
}

export function WeeklyProgress({ days, stats }: WeeklyProgressProps) {
  return (
    <div className="bg-card p-6 rounded-3xl border border-border">
      {/* Progress Bars */}
      <div className="flex items-end justify-between gap-2 h-32 mb-6">
        {days.map((item, idx) => (
          <div key={idx} className="w-full bg-muted rounded-full relative group cursor-pointer">
            <div
              className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ${
                item.isToday ? 'bg-[#2D3339]' : 'bg-primary'
              }`}
              style={{ height: item.height }}
            ></div>
            <span
              className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold transition-opacity ${
                item.isToday
                  ? 'text-foreground opacity-100'
                  : 'text-muted-foreground opacity-0 group-hover:opacity-100'
              }`}
            >
              {item.day}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="space-y-3 pt-4 border-t border-border">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
