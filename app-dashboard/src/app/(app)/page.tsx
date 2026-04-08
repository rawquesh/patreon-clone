'use client';

import { useEffect, useState } from 'react';
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
  Line,
  LineChart,
} from 'recharts';
import { DollarSign, Users, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardStats } from '@/lib/services';
import type { DashboardStats } from '@/types';

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

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'Success' || status === 'active' || status === 'completed'
      ? 'default'
      : status === 'failed' || status === 'cancelled'
        ? 'destructive'
        : 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats(6);
        setStats(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="An overview of your Patreon Clone platform."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" description="An overview of your Patreon Clone platform." />
        <Card className="mt-4">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error}</p>
            <button
              className="mt-4 text-primary underline"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
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

  const earningsData = stats.earningsData.map((e) => ({
    name: e.month.slice(5),
    earnings: e.amount,
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your Patreon Clone platform."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          description={`${stats.newCreatorsThisMonth} new creators this month`}
        />
        <StatCard
          title="Active Members"
          value={stats.totalMembers.toLocaleString()}
          icon={Users}
          description={`${stats.newMembersThisMonth} new this month`}
        />
        <StatCard
          title="Active Creators"
          value={stats.activeCreators.toLocaleString()}
          icon={Users}
          description={`${stats.totalCreators} total registered`}
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(stats.pendingPayoutsAmount)}
          icon={Wallet}
          description={`${stats.pendingPayoutsCount} pending requests`}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
            <CardDescription>Monthly active members over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={membershipData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="members"
                  stroke="hsl(var(--primary))"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Monthly earnings from subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Earnings']}
                />
                <Legend />
                <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of recent subscriptions and payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No recent transactions.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {tx.memberName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[150px] truncate">
                          <div className="truncate">{tx.memberName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[120px] truncate">
                      {tx.creatorName}
                    </TableCell>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === 'payout' ? 'text-destructive' : 'text-emerald-600'
                      }`}
                    >
                      {tx.type === 'payout' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
