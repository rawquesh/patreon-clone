'use client';

import * as React from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Preset = { label: string; getValue: () => { from: Date; to: Date } };

const PRESETS: Preset[] = [
  {
    label: 'Last 7 days',
    getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }),
  },
  {
    label: 'Last 30 days',
    getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }),
  },
  {
    label: 'Last 90 days',
    getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }),
  },
  {
    label: 'This month',
    getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }),
  },
  {
    label: 'Last month',
    getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }),
  },
];

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange: (range?: { from?: Date; to?: Date }) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [localRange, setLocalRange] = React.useState<{ from?: Date; to?: Date } | undefined>(value);

  const displayValue = localRange?.from && localRange?.to
    ? `${format(localRange.from, 'MMM d, yyyy')} - ${format(localRange.to, 'MMM d, yyyy')}`
    : 'Select date range';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-9 text-xs font-medium', !localRange?.from && 'text-muted-foreground', className)}
        >
          <CalendarIcon className="h-3.5 w-3.5 mr-2" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b border-border">
          <div className="grid grid-cols-2 gap-1">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="h-8 text-xs justify-start font-normal"
                onClick={() => {
                  const v = preset.getValue();
                  setLocalRange(v);
                  onChange(v);
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <Calendar
          mode="range"
          selected={{ from: localRange?.from, to: localRange?.to }}
          onSelect={(range) => {
            setLocalRange({ from: range?.from, to: range?.to });
            if (range?.from && range?.to) {
              onChange({ from: range.from, to: range.to });
            }
          }}
          numberOfMonths={1}
          className="p-3"
        />
        {localRange?.from && (
          <div className="p-3 border-t border-border flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setLocalRange(undefined);
                onChange(undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
