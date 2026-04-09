'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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

export function DetailDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-lg',
}: DetailDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay: purely visual, never blocks clicks */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ pointerEvents: 'none' }}
        />

        {/* Content: mounts at same z-index as overlay, centered */}
        <DialogPrimitive.Content
          className={cn(
            `fixed left-[50%] top-[50%] z-[60] w-full ${maxWidth} translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border/50 bg-background shadow-2xl`,
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200 p-0 overflow-hidden max-h-[90vh] overflow-y-auto',
            className
          )}
        >
          {/* Gradient top accent */}
          <div className="h-1 bg-gradient-primary" />
          <div className="p-6 pt-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <DialogPrimitive.Title className="text-lg font-bold leading-none tracking-tight">
                  {title}
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
            </div>

            {/* Content */}
            {children}

            {/* Close button */}
            <DialogPrimitive.Close
              className="absolute right-4 top-4 rounded-lg opacity-60 ring-offset-background transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/10 hover:text-primary data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
