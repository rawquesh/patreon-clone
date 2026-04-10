'use client';

import { useEffect, useState } from 'react';
import { branding } from '@/config/branding';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { DollarSign, Users, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, ShieldAlert, BarChart3, Settings, Ban, FileDown, ScrollText, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getDashboardStats, getAuditLogs } from '@/lib/services';
import type { DashboardStats } from '@/types';
import { cn } from '@/lib/utils';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TransactionBadge({ status }: { status: string }) {
  const variant =
    status === 'Success' || status === 'active' || status === 'completed'
      ? 'default'
      : status === 'failed' || status === 'cancelled'
        ? 'destructive'
        : 'secondary';
  return <Badge variant={variant} className="text-xs font-medium">{status}</Badge>;
}

function ChartTooltip({ active, payload, label, formatter }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-static rounded-xl p-3 text-sm shadow-xl border border-white/30">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function WelcomeBanner({ stats }: { stats: DashboardStats }) {
  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-6 mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-accent/8" />
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-accent/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gradient mb-1">
            Platform Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome back. Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick stats row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" />
                {formatCurrency(stats.mrr)}
              </div>
              <div className="text-xs text-muted-foreground">MRR</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-lg font-bold flex items-center gap-1"
                style={{ color: stats.churnRate > 5 ? 'hsl(0 84% 60%)' : 'inherit' }}
              >
                {stats.churnRate > 5 ? <ArrowDownRight className="h-4 w-4" /> : null}
                {stats.churnRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Churn</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      setIsLoadingActivity(true);
      try {
        const data = await getDashboardStats(6);
        setStats(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard stats');
      }
      try {
        const activityData = await getAuditLogs({ limit: 10, sortOrder: 'desc' });
        setRecentActivity(activityData.logs || []);
      } catch (e: any) {
        console.warn('Failed to load activity:', e);
      } finally {
        setIsLoading(false);
        setIsLoadingActivity(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description={`An overview of your ${branding.appName} platform.`}
        />
        <div className="mb-8">
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 stagger-children">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="glass-card-static">
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="glass-card-static">
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
          <Card className="glass-card-static">
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6 glass-card-static">
          <CardHeader>
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" description={`An overview of your ${branding.appName} platform.`} />
        <Card className="mt-4 glass-card-static">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <Wallet className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-destructive font-medium mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="btn-gradient-ghost">
              Retry
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!stats) return null;

  const membershipData = stats.membershipGrowth.map((m) => ({
    name: m.month.slice(5),
    members: m.count,
  }));

  const earningsChartData = stats.earningsData.map((e) => ({
    name: e.month.slice(5),
    earnings: e.amount,
  }));

  // Compute current month's earnings for the Lifetime Revenue trend
  const currentMonthEarnings = stats.earningsData.length > 0
    ? stats.earningsData[stats.earningsData.length - 1]?.amount || 0
    : 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`An overview of your ${branding.appName} platform.`}
        gradientTitle
      />

      <WelcomeBanner stats={stats} />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 stagger-children">
        <StatCard
          title="Lifetime Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          description={`${stats.newCreatorsThisMonth} new creators this month`}
          trend="up"
          trendValue={currentMonthEarnings > 0 ? `+${formatCurrency(currentMonthEarnings)} this month` : 'No payouts yet'}
          accentColor="emerald"
        />
        <StatCard
          title="Active Members"
          value={stats.totalMembers.toLocaleString()}
          icon={Users}
          description={`${stats.newMembersThisMonth} new this month`}
          trend="up"
          trendValue="+ growth"
          accentColor="primary"
        />
        <StatCard
          title="Active Creators"
          value={stats.activeCreators.toLocaleString()}
          icon={TrendingUp}
          description={`${stats.totalCreators} total registered`}
          accentColor="accent"
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(stats.pendingPayoutsAmount)}
          icon={Wallet}
          description={`${stats.pendingPayoutsCount} pending requests`}
          accentColor="amber"
        />
        <StatCard
          title="ARPU"
          value={formatCurrency(stats.totalSubscriptions > 0 ? stats.mrr / stats.totalSubscriptions : 0)}
          icon={TrendingUp}
          description="Avg revenue per subscriber"
          accentColor="primary"
        />
        <StatCard
          title="MRR"
          value={formatCurrency(stats.mrr)}
          icon={DollarSign}
          description="Monthly recurring revenue"
          accentColor="emerald"
        />
        <StatCard
          title="Churn Rate"
          value={`${stats.churnRate.toFixed(1)}%`}
          icon={ArrowDownRight}
          description="Monthly churn rate"
          accentColor={stats.churnRate > 5 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="New Subscriptions"
          value={`+${stats.newSubscriptionsThisMonth}`}
          icon={ArrowUpRight}
          description={`${stats.newMembersThisMonth} new members this month`}
          trend="up"
          accentColor="emerald"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mt-6">
        <span className="text-xs text-muted-foreground font-medium">Quick Actions:</span>
        <a href="/reports" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors font-medium">
          <ShieldAlert className="h-3.5 w-3.5" /> Reports
        </a>
        <a href="/analytics" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors font-medium">
          <BarChart3 className="h-3.5 w-3.5" /> Analytics
        </a>
        <a href="/settings" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors font-medium">
          <Settings className="h-3.5 w-3.5" /> Settings
        </a>
        <a href="/bans" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors font-medium">
          <Ban className="h-3.5 w-3.5" /> Bans
        </a>
        <a href="/audit-log" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 transition-colors font-medium">
          <ScrollText className="h-3.5 w-3.5" /> Audit Log
        </a>
        <a href="/export" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium">
          <FileDown className="h-3.5 w-3.5" /> Export
        </a>
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Membership Growth Chart */}
        <Card className="glass-card-static overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Membership Growth</CardTitle>
                <CardDescription className="text-xs">Monthly active members over time</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-card text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                Live
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={membershipData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(211 71% 43%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(211 71% 43%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => `${v.toLocaleString()} members`} />}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="hsl(211 71% 43%)"
                  strokeWidth={2.5}
                  fill="url(#memberGradient)"
                  dot={{ fill: 'hsl(211 71% 43%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Earnings Chart */}
        <Card className="glass-card-static overflow-hidden">
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Earnings Overview</CardTitle>
              <CardDescription className="text-xs">Monthly subscription revenue</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(211 71% 43%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(335 27% 64%)" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={<ChartTooltip formatter={formatCurrency} />}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar
                  dataKey="earnings"
                  name="Earnings"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Activity */}
      <Card className="mt-6 glass-card-static overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="transactions" className="w-auto">
              <TabsList className="rounded-xl h-9">
                <TabsTrigger value="transactions" className="rounded-lg text-xs font-medium">Recent Transactions</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-lg text-xs font-medium">Admin Activity</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsContent value="transactions" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6">User</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creator</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                              <DollarSign className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium">No recent transactions</p>
                            <p className="text-xs text-muted-foreground/70">
                              Transactions will appear here once members start subscribing
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.recentTransactions.map((tx, i) => (
                        <TableRow
                          key={tx.id}
                          className="table-row-hover border-b border-border/30 last:border-0"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200">
                                <AvatarFallback className="text-xs bg-gradient-primary text-slate-900 dark:text-white">
                                  {tx.memberName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="max-w-[140px] truncate">
                                <div className="text-sm font-medium truncate">{tx.memberName}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground max-w-[100px] truncate block">
                              {tx.creatorName}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              'text-xs font-medium px-2 py-1 rounded-full capitalize',
                              tx.type === 'payout'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            )}>
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <TransactionBadge status={tx.status} />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(tx.date)}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <span
                              className={cn(
                                'text-sm font-bold',
                                tx.type === 'payout'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              )}
                            >
                              {tx.type === 'payout' ? '-' : '+'}{formatCurrency(tx.amount)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-6">Action</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performed By</TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-6">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingActivity ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-b border-border/30">
                          <TableCell className="pl-6"><Skeleton className="h-5 w-32 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : recentActivity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                              <ScrollText className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium">No recent activity</p>
                            <p className="text-xs text-muted-foreground/70">
                              Admin actions will appear here as they happen
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentActivity.map((log: any, i: number) => (
                        <TableRow key={log.id} className="border-b border-border/30 last:border-0">
                          <TableCell className="pl-6">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                              {log.action?.replace('.', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {log.targetType} <span className="font-mono">#{log.targetId?.slice(-6)}</span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
                              {log.details?.reason || log.details?.role || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{log.performedBy || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {recentActivity.length > 0 && (
                <div className="px-6 py-3 border-t border-border/50">
                  <a href="/audit-log" className="text-xs text-primary hover:underline font-medium">
                    View full audit log →
                  </a>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
