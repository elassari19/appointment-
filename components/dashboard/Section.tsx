import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function Section({ title, actionLabel, onAction, children }: SectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
          <span className="w-1.5 h-6 bg-primary rounded-full"></span>
          {title}
        </h2>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="text-sm font-semibold text-muted-foreground hover:text-primary transition-all"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
