'use client';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success';
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: {
      card: 'stat-card flex items-center justify-between',
      iconBg: 'bg-amber-50 text-amber-500',
      valueColor: 'text-foreground',
      subtextColor: 'text-muted-foreground',
    },
    primary: {
      card: 'bg-primary p-6 rounded-3xl shadow-md text-primary-foreground cursor-pointer hover:shadow-lg transition-all group overflow-hidden relative',
      iconBg: '',
      valueColor: 'text-primary-foreground',
      subtextColor: 'text-primary-foreground/80',
    },
    secondary: {
      card: 'stat-card flex items-center justify-between bg-[#2D3339] text-white',
      iconBg: 'bg-white/10 text-white',
      valueColor: 'text-white',
      subtextColor: 'text-white/60',
    },
    success: {
      card: 'stat-card flex items-center justify-between',
      iconBg: 'bg-emerald-50 text-emerald-500',
      valueColor: 'text-foreground',
      subtextColor: 'text-emerald-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={styles.card}>
      {variant === 'primary' ? (
        <>
          <div className="relative z-10">
            <p className="text-sm font-semibold opacity-80 mb-1">{label}</p>
            <h3 className="text-xl font-bold mb-2">{value}</h3>
            {subtext && (
              <div className="flex items-center text-xs font-bold gap-1 group-hover:gap-2 transition-all">
                {subtext}
                <span className="material-icons-round text-sm">arrow_forward</span>
              </div>
            )}
          </div>
          <span className="material-icons-round absolute -right-4 -bottom-4 text-7xl opacity-10">
            {icon || 'add_circle'}
          </span>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <h3 className={`text-2xl font-bold ${styles.valueColor}`}>{value}</h3>
            {subtext && (
              <p className={`text-xs font-medium mt-1 ${styles.subtextColor}`}>{subtext}</p>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
              <span className="material-icons-round">{icon}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
