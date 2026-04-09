import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  gradientTitle?: boolean;
};

export function PageHeader({ title, description, children, gradientTitle = false }: PageHeaderProps) {
  return (
    <div className="mb-8 relative">
      {/* Subtle gradient glow behind the title */}
      <div className="absolute -inset-x-4 -inset-y-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1
            className={cn(
              'text-3xl font-bold tracking-tight',
              gradientTitle && 'text-gradient',
              !gradientTitle && 'text-foreground'
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2 shrink-0">
            {children}
          </div>
        )}
      </div>

      {/* Subtle gradient underline */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
