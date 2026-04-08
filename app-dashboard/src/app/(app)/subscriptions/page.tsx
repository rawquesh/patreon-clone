import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { subscriptions, type Subscription, creators, members } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusVariant: Record<
  Subscription['status'],
  'default' | 'secondary' | 'destructive'
> = {
  active: 'default',
  canceled: 'secondary',
  past_due: 'destructive',
};

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Monitor all subscriptions and revenue."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="MRR"
          value="$12,450"
          icon={DollarSign}
          description="+5.2% from last month"
        />
        <StatCard
          title="Active Subscriptions"
          value="4,821"
          icon={Users}
          description="+150 new this month"
        />
        <StatCard
          title="Avg. Revenue/User"
          value="$2.58"
          icon={TrendingUp}
          description="Up from $2.45"
        />
        <StatCard
          title="Churn Rate"
          value="2.1%"
          icon={TrendingDown}
          description="Down from 2.5% last month"
        />
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">All Subscriptions</h2>
              <p className="text-muted-foreground">
                View and manage all user subscriptions.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
              <div className="max-w-sm">
                <Input placeholder="Search subscriptions..." />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by creator" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Creators</SelectItem>
                    {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by member" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={sub.member.avatar}
                            data-ai-hint="person avatar"
                          />
                          <AvatarFallback>
                            {sub.member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{sub.member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sub.member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.creator.name}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[sub.status]}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{sub.nextBilling}</TableCell>
                    <TableCell className="text-right">
                      ${sub.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
