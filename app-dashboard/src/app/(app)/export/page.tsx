'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Users,
  BadgeDollarSign,
  FileText,
  ShieldAlert,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { exportUsers, exportSubscriptions, exportPayouts, exportReports } from '@/lib/services';
import type { ExportParams } from '@/lib/services/export.service';

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onExport: (params: ExportParams) => Promise<void>;
  accentColor: string;
  filterType?: 'users' | 'subscriptions' | 'payouts' | 'reports';
}

function ExportCard({ title, description, icon, onExport, accentColor, filterType }: ExportCardProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params: ExportParams = {
        startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
        endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: filterType === 'users' ? (userTypeFilter === 'all' ? undefined : userTypeFilter) : undefined,
      };
      await onExport(params);
      toast({ title: `${title} exported successfully` });
    } catch (e: any) {
      toast({ title: `Export failed: ${e?.message}`, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const colorMap: Record<string, string> = {
    primary: 'border-blue-200 dark:border-blue-800 bg-blue-500/5',
    emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-500/5',
    amber: 'border-amber-200 dark:border-amber-800 bg-amber-500/5',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-500/5',
  };

  const iconColorMap: Record<string, string> = {
    primary: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <Card className={`glass-card-static border ${colorMap[accentColor] || colorMap.primary}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${colorMap[accentColor] || colorMap.primary}`}>
            <div className={`h-6 w-6 ${iconColorMap[accentColor] || iconColorMap.primary}`}>
              {icon}
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            CSV
          </span>
        </div>
        <CardTitle className="text-base font-semibold mt-3">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date Range (optional)</Label>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </div>

        {filterType === 'users' && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">User Type</Label>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="creator">Creators only</SelectItem>
                <SelectItem value="member">Members only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {title.includes('Subscription') && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status (optional)</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {title.includes('Report') && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status (optional)</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {filterType === 'payouts' && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status (optional)</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full rounded-xl gap-2 mt-1"
          variant={accentColor === 'amber' ? 'outline' : 'default'}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ExportPage() {
  const { toast } = useToast();
  const [exportingAll, setExportingAll] = useState(false);

  const handleExportAll = async () => {
    setExportingAll(true);
    const results = { success: 0, failed: 0 };
    const exportFns = [
      { name: 'Users', fn: exportUsers },
      { name: 'Subscriptions', fn: exportSubscriptions },
      { name: 'Payouts', fn: exportPayouts },
      { name: 'Reports', fn: exportReports },
    ];
    for (const { name, fn } of exportFns) {
      try {
        await fn();
        results.success++;
      } catch (e: any) {
        results.failed++;
        toast({ title: `${name} export failed: ${e?.message}`, variant: 'destructive' });
      }
    }
    if (results.failed === 0) {
      toast({ title: 'All exports completed successfully' });
    }
    setExportingAll(false);
  };

  return (
    <>
      <PageHeader
        title="Data Export"
        description="Export platform data in CSV format for analysis and reporting."
        gradientTitle
      />

      {/* Export All */}
      <Card className="glass-card-static mb-6 border-dashed">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary/10 rounded-xl">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Bulk Export All Data</p>
              <p className="text-xs text-muted-foreground">Download all 4 data types at once</p>
            </div>
          </div>
          <Button
            onClick={handleExportAll}
            disabled={exportingAll}
            className="rounded-xl gap-2"
          >
            {exportingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export All
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ExportCard
          title="Users"
          description="All registered users including creators and members with profile data."
          icon={<Users className="h-6 w-6" />}
          onExport={exportUsers}
          accentColor="primary"
          filterType="users"
        />
        <ExportCard
          title="Subscriptions"
          description="All subscription records with status, tier, and billing info."
          icon={<BadgeDollarSign className="h-6 w-6" />}
          onExport={exportSubscriptions}
          accentColor="emerald"
          filterType="subscriptions"
        />
        <ExportCard
          title="Payouts"
          description="Creator payout history including amounts, status, and dates."
          icon={<FileText className="h-6 w-6" />}
          onExport={exportPayouts}
          accentColor="amber"
          filterType="payouts"
        />
        <ExportCard
          title="Reports"
          description="All content and user reports with status and resolution info."
          icon={<ShieldAlert className="h-6 w-6" />}
          onExport={exportReports}
          accentColor="purple"
          filterType="reports"
        />
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        All exports are generated on-demand. For large datasets, exports may take a few moments to process.
      </p>
    </>
  );
}
