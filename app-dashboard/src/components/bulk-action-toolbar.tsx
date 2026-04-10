'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BulkAction {
  label: string;
  value: string;
  variant?: 'default' | 'destructive';
}

interface BulkActionToolbarProps {
  selectedCount: number;
  availableActions: BulkAction[];
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  availableActions,
  onBulkAction,
  onClearSelection,
  isLoading,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3 mb-4 flex items-center gap-3 shadow-lg">
      <span className="text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-border" />
      {availableActions.map((action) => (
        <Button
          key={action.value}
          variant={action.variant === 'destructive' ? 'destructive' : 'default'}
          size="sm"
          onClick={() => onBulkAction(action.value)}
          disabled={isLoading}
          className="h-8 text-xs font-medium"
        >
          {action.label}
        </Button>
      ))}
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="h-8 text-xs text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3 mr-1" />
        Clear
      </Button>
    </div>
  );
}
