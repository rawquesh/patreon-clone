'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSetting } from '@/lib/services';
import type { PlatformSetting } from '@/types/settings';

type SettingCategory = 'financial' | 'features' | 'content';

const CATEGORY_LABELS: Record<SettingCategory, string> = {
  financial: 'Financial',
  features: 'Features',
  content: 'Content',
};

const CATEGORY_ICONS: Record<SettingCategory, string> = {
  financial: 'Platform commission, fees, and revenue settings',
  features: 'Feature toggles and platform capabilities',
  content: 'Content restrictions and upload limits',
};

// Categories that use pending changes + Save button
const BATCH_CATEGORIES: SettingCategory[] = ['financial', 'content'];

interface SettingFieldProps {
  setting: PlatformSetting;
  value: any;
  onChange: (key: string, value: any) => void;
  isUpdating: boolean;
}

function SettingField({ setting, value, onChange, isUpdating }: SettingFieldProps) {
  const key = setting.key as string;

  // Boolean toggle
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
        <div className="flex-1 pr-4">
          <Label className="text-sm font-medium cursor-pointer" htmlFor={`setting-${key}`}>
            {setting.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Label>
          {setting.isPublic && (
            <Badge variant="outline" className="ml-2 text-[10px] font-normal border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">Public</Badge>
          )}
        </div>
        <Switch
          id={`setting-${key}`}
          checked={value}
          onCheckedChange={(v) => onChange(key, v)}
          disabled={isUpdating}
        />
      </div>
    );
  }

  // Numeric input (for rates, amounts, sizes)
  if (typeof value === 'number') {
    const isPercentage = key.includes('rate') || key.includes('percent') || key.includes('fee');
    const isByteSize = key.includes('size') && !key.includes('text_content') && !key.includes('textLength') && !key.includes('TextLength');
    const isTextLength = key.includes('text_content') || key.includes('textLength') || key.includes('TextLength');
    return (
      <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
        <div className="flex-1 pr-4">
          <Label className="text-sm font-medium" htmlFor={`setting-${key}`}>
            {setting.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPercentage
              ? `${(value * 100).toFixed(1)}%`
              : isTextLength
                ? `${value.toLocaleString()} characters`
                : null}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isPercentage && <span className="text-xs text-muted-foreground">%</span>}
          {isByteSize && <span className="text-xs text-muted-foreground">MB</span>}
          {isTextLength && <span className="text-xs text-muted-foreground">chars</span>}
          <Input
            id={`setting-${key}`}
            type="number"
            step={isPercentage ? '0.01' : '1'}
            min={0}
            value={
              isPercentage
                ? value * 100
                : isByteSize
                  ? Math.round(value / 1024 / 1024)
                  : isTextLength
                    ? value
                    : value
            }
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (isNaN(val)) return;
              onChange(
                key,
                isPercentage
                  ? val / 100
                  : isByteSize
                    ? Math.round(val * 1024 * 1024)
                    : val,
              );
            }}
            disabled={isUpdating}
            className="w-28 h-8 text-xs rounded-lg text-center"
          />
        </div>
      </div>
    );
  }

  // String input
  if (typeof value === 'string') {
    // Payout schedule select (handles both snake_case and camelCase)
    if (key === 'payout_schedule' || key === 'payoutSchedule') {
      return (
        <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
          <div className="flex-1 pr-4">
            <Label className="text-sm font-medium">
              {setting.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Label>
          </div>
          <Select value={value || 'monthly'} onValueChange={(v) => onChange(key, v)} disabled={isUpdating}>
            <SelectTrigger className="w-36 h-8 text-xs rounded-lg">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Content visibility (handles both snake_case and camelCase)
    if (key === 'default_content_visibility' || key === 'defaultContentVisibility') {
      return (
        <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
          <div className="flex-1 pr-4">
            <Label className="text-sm font-medium">
              {setting.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Label>
          </div>
          <Select value={value || 'public'} onValueChange={(v) => onChange(key, v)} disabled={isUpdating}>
            <SelectTrigger className="w-36 h-8 text-xs rounded-lg">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="followers">Followers Only</SelectItem>
              <SelectItem value="subscribers">Subscribers Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Generic text input
    return (
      <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
        <div className="flex-1 pr-4">
          <Label className="text-sm font-medium" htmlFor={`setting-${key}`}>
            {setting.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Label>
        </div>
        <Input
          id={`setting-${key}`}
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          disabled={isUpdating}
          className="w-40 h-8 text-xs rounded-lg"
          placeholder="Enter value"
        />
      </div>
    );
  }

  return null;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('features');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      setPendingChanges({});
    } catch (e: any) {
      toast({ title: `Failed to load settings: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleChange = (key: string, value: any) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleInstantUpdate = async (key: string, value: any) => {
    const setting = settings.find((s) => s.key === key);
    const label = setting?.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    if (value === '' || value === null || value === undefined) {
      toast({ title: `Cannot save empty value for "${label}"`, variant: 'destructive' });
      return;
    }
    if (typeof value === 'number' && isNaN(value)) {
      toast({ title: `Invalid number for "${label}"`, variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateSetting(key, { value });
      setSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
      toast({ title: 'Setting updated successfully' });
    } catch (e: any) {
      toast({ title: `Failed to update setting: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    const entries = Object.entries(pendingChanges);
    if (entries.length === 0) return;

    // Validate: check for empty values
    for (const [key, value] of entries) {
      const setting = settings.find((s) => s.key === key);
      const label = setting?.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      if (value === '' || value === null || value === undefined) {
        toast({ title: `Cannot save empty value for "${label}"`, variant: 'destructive' });
        return;
      }

      if (key === 'platformCommissionRate' && (typeof value !== 'number' || value < 0 || value > 0.9)) {
        toast({ title: 'Commission rate must be between 0% and 90%', variant: 'destructive' });
        return;
      }
    }

    setIsSaving(true);
    try {
      for (const [key, value] of entries) {
        const updated = await updateSetting(key, { value });
        setSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
      }
      setPendingChanges({});
      toast({ title: 'Settings saved successfully' });
    } catch (e: any) {
      toast({ title: `Failed to save settings: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const categories: SettingCategory[] = ['features', 'financial', 'content'];

  const getCategorySettings = (cat: SettingCategory) =>
    settings.filter(
      (s) =>
        s.category === cat &&
        s.key !== 'payoutSchedule' &&
        s.key !== 'minimumPayoutAmount' &&
        s.key !== 'defaultContentVisibility',
    );

  const getFieldValue = (setting: PlatformSetting) => {
    if (setting.key in pendingChanges) return pendingChanges[setting.key];
    return setting.value;
  };

  const pendingCount = Object.keys(pendingChanges).length;

  if (isLoading) {
    return (
      <>
        <PageHeader title="Platform Settings" description="Configure platform-wide settings and preferences." gradientTitle />
        <Tabs defaultValue="features" className="space-y-6">
          <Skeleton className="h-10 w-96 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </Tabs>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Configure platform-wide settings and preferences. Changes apply immediately."
        gradientTitle
      />

      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as SettingCategory)} className="space-y-6">
        <div className="flex items-center gap-4">
          <TabsList className="rounded-xl">
            {categories.map((cat) => {
              const count = getCategorySettings(cat).length;
              return (
                <TabsTrigger key={cat} value={cat} className="rounded-lg text-xs font-medium capitalize gap-1.5">
                  {cat}
                  {count > 0 && (
                    <span className="ml-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{count}</span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {BATCH_CATEGORIES.includes(activeCategory) && pendingCount > 0 && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-gradient h-8 text-xs gap-1.5"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Save Changes {pendingCount > 1 ? `(${pendingCount})` : ''}
            </Button>
          )}
        </div>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-4">
            <Card className="glass-card-static">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold capitalize">{CATEGORY_LABELS[cat]}</CardTitle>
                <CardDescription className="text-xs">{CATEGORY_ICONS[cat]}</CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                {getCategorySettings(cat).map((setting) => (
                  <SettingField
                    key={setting.key}
                    setting={setting}
                    value={getFieldValue(setting)}
                    onChange={BATCH_CATEGORIES.includes(cat) ? handleChange : handleInstantUpdate}
                    isUpdating={isSaving}
                  />
                ))}
                {getCategorySettings(cat).length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No settings in this category</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
