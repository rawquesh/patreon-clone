'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

// Singleton portal root — created once, reused across all dialog instances
let portalRoot: HTMLElement | null = null;
function getPortalRoot(): HTMLElement {
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'dialog-portal-root';
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
}

export function DetailDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-lg',
}: DetailDialogProps) {
  // Phase: 'closed' = fully hidden, 'open' = visible, 'closing' = animating out
  const [phase, setPhase] = React.useState<'closed' | 'open' | 'closing'>('closed');

  React.useEffect(() => {
    if (open) {
      setPhase('open');
    } else if (phase !== 'closed') {
      // Start exit animation
      setPhase('closing');
    }
  }, [open]);

  // Fully unmount after exit animation (200ms)
  React.useEffect(() => {
    if (phase === 'closing') {
      const timer = setTimeout(() => setPhase('closed'), 200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Close on Escape
  React.useEffect(() => {
    if (phase === 'closed') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onOpenChange]);

  // Only render into the DOM when visible or animating out
  if (phase === 'closed') return null;

  const root = getPortalRoot();

  return createPortal(
    <>
      {/* Overlay — purely visual, darkens entire viewport */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm',
          phase === 'open' ? 'animate-in fade-in-0 duration-200' : 'animate-out fade-out-0 duration-200'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-[60] w-full max-h-[90vh] overflow-y-auto',
          `translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border/50 bg-background shadow-2xl`,
          maxWidth,
          className,
          phase === 'open'
            ? 'animate-in zoom-in-95 fade-in-0 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-200'
            : 'animate-out zoom-out-95 fade-out-0 slide-out-to-left-1/2 slide-out-to-top-[48%] duration-200'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Gradient accent */}
        <div className="h-1 bg-gradient-primary" />
        <div className="p-6 pt-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 id="dialog-title" className="text-lg font-bold leading-none tracking-tight">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Dynamic content */}
          {children}

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              'absolute right-4 top-4 rounded-lg opacity-60',
              'ring-offset-background transition-all duration-200',
              'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'hover:bg-primary/10 hover:text-primary',
              'text-muted-foreground p-1'
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>,
    root
  );
}
