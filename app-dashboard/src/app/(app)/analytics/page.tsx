'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}
import {
  getAnalyticsOverview,
  getRevenueAnalytics,
  getCreatorAnalytics,
  getSubscriberAnalytics,
  getReportAnalytics,
  getEngagementAnalytics,
} from '@/lib/services';

const COLORS = ['hsl(211 71% 43%)', 'hsl(335 27% 64%)', 'hsl(142 71% 45%)', 'hsl(0 84% 60%)', 'hsl(45 93% 58%)'];

function ChartTooltip({ active, payload, label, formatter }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-static rounded-xl p-3 text-sm shadow-xl border border-white/30">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-semibold">{formatter ? formatter(e.value) : e.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [creators, setCreators] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any>(null);
  const [reports, setReports] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [ov, rev, cr, sb, rp, eng] = await Promise.all([
          getAnalyticsOverview({ months: 6 }),
          getRevenueAnalytics({ months: 6 }),
          getCreatorAnalytics({ months: 6 }),
          getSubscriberAnalytics({ months: 6 }),
          getReportAnalytics({ months: 6 }),
          getEngagementAnalytics({ months: 6 }),
        ]);
        setOverview(ov);
        setRevenue(rev);
        setCreators(cr);
        setSubscribers(sb);
        setReports(rp);
        setEngagement(eng);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Analytics" description="Deep insights into your platform." gradientTitle />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Analytics" description="Deep insights into your platform." gradientTitle />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="rounded-xl">
          {['overview', 'revenue', 'creators', 'subscribers', 'reports', 'engagement'].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg text-xs font-medium capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="glass-card-static">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Monthly Recurring Revenue</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(overview?.mrr || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">MRR</p>
              </CardContent>
            </Card>
            <Card className="glass-card-static">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Total Creators</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(overview?.totalCreators || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{overview?.totalSubscriptions || 0} active subscriptions</p>
              </CardContent>
            </Card>
            <Card className="glass-card-static">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Total Members</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{(overview?.totalMembers || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">MRR by Tier</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={overview?.mrrBreakdown || []} dataKey="revenue" nameKey="tier" cx="50%" cy="50%" outerRadius={100} label={({ tier, revenue }) => `${tier}: ${formatCurrency(revenue)}`}>
                        {(overview?.mrrBreakdown || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={formatCurrency} />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">Churn Trends</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={overview?.churnTrends || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                    <Area type="monotone" dataKey="rate" stroke="hsl(0 84% 60%)" strokeWidth={2} fill="hsl(0 84% 60% / 0.1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle><CardDescription>Revenue from completed payouts</CardDescription></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenue?.monthly || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<ChartTooltip formatter={formatCurrency} />} />
                    <Bar dataKey="amount" fill="hsl(211 71% 43%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">Growth Rate</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <p className="text-5xl font-bold text-emerald-600">{revenue?.growthRate?.toFixed(1) || 0}%</p>
                <p className="text-sm text-muted-foreground mt-2">vs previous period</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="creators">
          <Card className="glass-card-static">
            <CardHeader><CardTitle className="text-base font-semibold">Top Creators by Revenue</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase">#</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Creator</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">Revenue</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">Subscribers</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right pr-6">Posts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(creators?.topByRevenue || []).map((c: any, i: number) => (
                    <TableRow key={c.id} className="border-b border-border/30 last:border-0">
                      <TableCell className="pl-6"><span className="text-xs text-muted-foreground">{i + 1}</span></TableCell>
                      <TableCell><span className="text-sm font-medium">{c.displayName || c.creatorUsername || 'Unknown'}</span></TableCell>
                      <TableCell className="text-right"><span className="text-sm font-semibold text-emerald-600">{formatCurrency(c.revenue)}</span></TableCell>
                      <TableCell className="text-right"><span className="text-sm">{c.subscribers || 0}</span></TableCell>
                      <TableCell className="pr-6 text-right"><span className="text-sm">{c.posts || 0}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">Retention Rate</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {['month1', 'month3', 'month6'].map((period) => (
                  <div key={period} className="flex items-center justify-between">
                    <span className="text-sm">After {period === 'month1' ? '1 month' : period === 'month3' ? '3 months' : '6 months'}</span>
                    <span className="text-sm font-bold">{(subscribers?.retentionRate?.[period] || 0)}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">Trial to Paid Conversion</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <p className="text-5xl font-bold">{(subscribers?.trialToPaidConversion || 0)}%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">Resolution Rate</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <p className="text-5xl font-bold">{(reports?.resolutionRate || 0)}%</p>
                <p className="text-sm text-muted-foreground mt-2">of reports resolved or dismissed</p>
              </CardContent>
            </Card>
            <Card className="glass-card-static">
              <CardHeader><CardTitle className="text-base font-semibold">Report Volume (30 days)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={reports?.volumeOverTime?.slice(-14) || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(45 93% 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <Card className="glass-card-static">
            <CardHeader><CardTitle className="text-base font-semibold">Post Engagement Rate</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={engagement?.postEngagementRate || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                  <Area type="monotone" dataKey="rate" stroke="hsl(142 71% 45%)" strokeWidth={2} fill="hsl(142 71% 45% / 0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full">{children}</table></div>;
}
function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}
function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={className}>{children}</tr>;
}
function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`h-10 px-2 ${className || ''}`}>{children}</th>;
}
function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}
function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-2 ${className || ''}`}>{children}</td>;
}
