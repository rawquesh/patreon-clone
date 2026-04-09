import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: 'primary' | 'accent' | 'emerald' | 'amber' | 'rose';
};

const accentConfig = {
  primary: {
    gradient: 'bg-gradient-primary',
    glow: 'rgba(74, 159, 229, 0.2)',
    icon: 'text-white',
  },
  accent: {
    gradient: 'bg-gradient-to-br from-[#C47AA5] to-[#9B6B8A]',
    glow: 'rgba(196, 122, 165, 0.2)',
    icon: 'text-white',
  },
  emerald: {
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    glow: 'rgba(16, 185, 129, 0.2)',
    icon: 'text-white',
  },
  amber: {
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.2)',
    icon: 'text-white',
  },
  rose: {
    gradient: 'bg-gradient-to-br from-rose-500 to-pink-500',
    glow: 'rgba(244, 63, 94, 0.2)',
    icon: 'text-white',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  accentColor = 'primary',
}: StatCardProps) {
  const accent = accentConfig[accentColor];

  return (
    <div className="glass-card rounded-xl p-5 hover-lift group relative overflow-hidden animate-fade-in-up">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Background glow on hover */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl pointer-events-none"
        style={{ background: accent.glow }}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>

          {/* Value */}
          <div className="text-2xl font-bold tracking-tight text-foreground mb-1.5 animate-counter-up">
            {value}
          </div>

          {/* Description + Trend */}
          <div className="flex items-center gap-2 flex-wrap">
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
            {trend && trendValue && (
              <div
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                  trend === 'up' && 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
                  trend === 'down' && 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
                  trend === 'neutral' && 'text-muted-foreground bg-muted/50'
                )}
              >
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
        </div>

        {/* Icon with gradient circle */}
        <div className="relative shrink-0">
          {/* Glow behind icon */}
          <div
            className="absolute inset-0 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300"
            style={{ background: accent.glow }}
          />
          {/* Icon container */}
          <div
            className={cn(
              'relative flex items-center justify-center h-12 w-12 rounded-2xl',
              accent.gradient
            )}
          >
            <Icon className={cn('h-5 w-5', accent.icon)} />
          </div>
        </div>
      </div>
    </div>
  );
}
