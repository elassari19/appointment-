'use client';

interface QuickActionCardProps {
  title: string;
  subtitle?: string;
  actionLabel: string;
  icon?: string;
  onClick?: () => void;
}

export function QuickActionCard({
  title,
  subtitle,
  actionLabel,
  icon = 'add_circle',
  onClick,
}: QuickActionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-primary p-6 rounded-3xl shadow-md text-primary-foreground cursor-pointer hover:shadow-lg transition-all group overflow-hidden relative"
    >
      <div className="relative z-10">
        {subtitle && <p className="text-sm font-semibold opacity-80 mb-1">{subtitle}</p>}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-center text-xs font-bold gap-1 group-hover:gap-2 transition-all">
          {actionLabel}
          <span className="material-icons-round text-sm">arrow_forward</span>
        </div>
      </div>
      <span className="material-icons-round absolute -right-4 -bottom-4 text-7xl opacity-10">
        {icon}
      </span>
    </div>
  );
}
