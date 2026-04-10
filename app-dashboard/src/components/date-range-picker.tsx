"use client";

import * as React from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, X, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Preset = { label: string; getValue: () => { from: Date; to: Date } };

const PRESETS: Preset[] = [
  { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Last 90 days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: "This month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  {
    label: "Last month",
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

  React.useEffect(() => {
    setLocalRange(value);
  }, [value]);

  const displayValue = localRange?.from
    ? localRange.to
      ? `${format(localRange.from, "MMM d")} – ${format(localRange.to, "MMM d, yyyy")}`
      : format(localRange.from, "MMM d")
    : null;

  const handlePreset = (preset: Preset) => {
    const v = preset.getValue();
    setLocalRange(v);
    onChange(v);
    setOpen(false);
  };

  const handleCalendarSelect = (range: { from?: Date; to?: Date } | undefined) => {
    setLocalRange(range);
    if (range?.from && range?.to) {
      onChange(range);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalRange(undefined);
    onChange(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 h-9 text-xs font-medium",
            "ring-offset-background transition-colors",
            "hover:border-ring hover:ring-1 hover:ring-ring",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            localRange?.from ? "text-foreground" : "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{displayValue ?? "Date range"}</span>
          {localRange?.from && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => { if (e.key === 'Enter') handleClear(e as unknown as React.MouseEvent); }}
              className="flex-shrink-0 rounded-sm p-0.5 hover:bg-muted transition-colors cursor-pointer"
              aria-label="Clear date range"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 flex-shrink-0 transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-36 border-b sm:border-b-0 sm:border-r border-border p-3 sm:p-2 space-y-0.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-md text-xs",
                  "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="p-3">
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{ from: localRange?.from, to: localRange?.to }}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
