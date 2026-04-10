'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSetting, bulkUpdateSettings } from '@/lib/services';
import type { PlatformSetting } from '@/types/settings';

type SettingCategory = 'financial' | 'features' | 'content' | 'payouts' | 'security';

const CATEGORY_LABELS: Record<SettingCategory, string> = {
  financial: 'Financial',
  features: 'Features',
  content: 'Content',
  payouts: 'Payouts',
  security: 'Security',
};

const CATEGORY_ICONS: Record<SettingCategory, string> = {
  financial: 'Platform commission, fees, and revenue settings',
  features: 'Feature toggles and platform capabilities',
  content: 'Content restrictions and upload limits',
  payouts: 'Payout schedule and minimum amounts',
  security: 'Security, registrations, and access controls',
};

interface SettingFieldProps {
  setting: PlatformSetting;
  onUpdate: (key: string, value: any) => void;
  isUpdating: boolean;
}

function SettingField({ setting, onUpdate, isUpdating }: SettingFieldProps) {
  const key = setting.key as string;

  // Boolean toggle
  if (typeof setting.value === 'boolean') {
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
          checked={setting.value}
          onCheckedChange={(v) => onUpdate(key, v)}
          disabled={isUpdating}
        />
      </div>
    );
  }

  // Numeric input (for rates, amounts, sizes)
  if (typeof setting.value === 'number') {
    const isPercentage = key.includes('rate') || key.includes('percent') || key.includes('fee');
    const isSize = key.includes('size') || key.includes('length');
    return (
      <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
        <div className="flex-1 pr-4">
          <Label className="text-sm font-medium" htmlFor={`setting-${key}`}>
            {setting.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPercentage ? `${(setting.value * 100).toFixed(1)}%` : isSize ? `${(setting.value / 1024 / 1024).toFixed(1)} MB` : `$${setting.value}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isPercentage && <span className="text-xs text-muted-foreground">%</span>}
          {isSize && <span className="text-xs text-muted-foreground">MB</span>}
          <Input
            id={`setting-${key}`}
            type="number"
            step={isPercentage ? '0.01' : isSize ? '1048576' : '1'}
            min={0}
            value={isPercentage ? setting.value * 100 : setting.value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdate(key, isPercentage ? val / 100 : val);
            }}
            disabled={isUpdating}
            className="w-28 h-8 text-xs rounded-lg text-center"
          />
        </div>
      </div>
    );
  }

  // String input
  if (typeof setting.value === 'string') {
    // Payout schedule select (handles both snake_case and camelCase)
    if (key === 'payout_schedule' || key === 'payoutSchedule') {
      return (
        <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
          <div className="flex-1 pr-4">
            <Label className="text-sm font-medium">
              {setting.description || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Label>
          </div>
          <Select value={setting.value} onValueChange={(v) => onUpdate(key, v)} disabled={isUpdating}>
            <SelectTrigger className="w-36 h-8 text-xs rounded-lg">
              <SelectValue />
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
          <Select value={setting.value} onValueChange={(v) => onUpdate(key, v)} disabled={isUpdating}>
            <SelectTrigger className="w-36 h-8 text-xs rounded-lg">
              <SelectValue />
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
          value={setting.value}
          onChange={(e) => onUpdate(key, e.target.value)}
          disabled={isUpdating}
          className="w-40 h-8 text-xs rounded-lg"
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
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('financial');
  const [isUpdating, setIsUpdating] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (e: any) {
      toast({ title: `Failed to load settings: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (key: string, value: any) => {
    setIsUpdating(true);
    try {
      const updated = await updateSetting(key, { value });
      setSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
      toast({ title: 'Setting updated successfully' });
    } catch (e: any) {
      toast({ title: `Failed to update setting: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const categories: SettingCategory[] = ['financial', 'features', 'content', 'payouts', 'security'];

  const getCategorySettings = (cat: SettingCategory) =>
    settings.filter((s) => s.category === cat);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Platform Settings" description="Configure platform-wide settings and preferences." gradientTitle />
        <Tabs defaultValue="financial" className="space-y-6">
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
                    onUpdate={handleUpdate}
                    isUpdating={isUpdating}
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
