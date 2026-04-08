'use client';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { DollarSign, Users, Activity, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const membershipData = [
  { name: 'Jan', members: 400 },
  { name: 'Feb', members: 300 },
  { name: 'Mar', members: 500 },
  { name: 'Apr', members: 780 },
  { name: 'May', members: 600 },
  { name: 'Jun', members: 900 },
];

const earningsData = [
    { name: 'Jan', earnings: 2400 },
    { name: 'Feb', earnings: 1398 },
    { name: 'Mar', earnings: 9800 },
    { name: 'Apr', earnings: 3908 },
    { name: 'May', earnings: 4800 },
    { name: 'Jun', earnings: 3800 },
];

const recentTransactions = [
  {
    user: { name: 'Liam Johnson', email: 'liam@example.com' },
    type: 'Subscription',
    status: 'Success',
    date: '2023-06-23',
    amount: '+$5.00',
  },
  {
    user: { name: 'Olivia Smith', email: 'olivia@example.com' },
    type: 'Payout',
    status: 'Pending',
    date: '2023-06-22',
    amount: '-$1,250.00',
  },
  {
    user: { name: 'Noah Williams', email: 'noah@example.com' },
    type: 'Subscription',
    status: 'Success',
    date: '2023-06-21',
    amount: '+$10.00',
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your Patreon Clone platform."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          description="+20.1% from last month"
        />
        <StatCard
          title="Active Members"
          value="+2,350"
          icon={Users}
          description="+180.1% from last month"
        />
        <StatCard
          title="Active Creators"
          value="+573"
          icon={Users}
          description="+19% from last month"
        />
        <StatCard
          title="Payouts Queued"
          value="$3,482.10"
          icon={Wallet}
          description="5 pending requests"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
            <CardDescription>Monthly new members.</CardDescription>
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
          <CardDescription>
            A list of recent subscriptions and payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://placehold.co/32x32.png?text=${transaction.user.name.charAt(0)}`} data-ai-hint="person avatar" />
                        <AvatarFallback>
                          {transaction.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{transaction.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.status === 'Success' ? 'default' : 'secondary'}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="text-right">{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
