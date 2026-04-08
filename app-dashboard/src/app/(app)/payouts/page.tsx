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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { payouts, type Payout } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusVariant: Record<
  Payout['status'],
  'default' | 'secondary' | 'destructive'
> = {
  approved: 'default',
  pending: 'secondary',
  rejected: 'destructive',
};

const PayoutsTable = ({ status }: { status: Payout['status'] }) => {
  const filteredPayouts = payouts.filter((p) => p.status === status);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Request Date</TableHead>
          {status !== 'pending' && <TableHead>Processed Date</TableHead>}
          <TableHead className="text-right">Amount</TableHead>
          {status === 'pending' && (
            <TableHead className="text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPayouts.map((payout) => (
          <TableRow key={payout.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={payout.creator.avatar}
                    data-ai-hint="person avatar"
                  />
                  <AvatarFallback>
                    {payout.creator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>{payout.creator.name}</div>
              </div>
            </TableCell>
            <TableCell>{payout.requestDate}</TableCell>
            {status !== 'pending' && (
              <TableCell>{payout.processedDate}</TableCell>
            )}
            <TableCell className="text-right">
              ${payout.amount.toFixed(2)}
            </TableCell>
            {status === 'pending' && (
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="mr-2">
                  Approve
                </Button>
                <Button variant="destructive" size="sm">
                  Reject
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function PayoutsPage() {
  return (
    <>
      <PageHeader
        title="Payout Manager"
        description="Process, track, and manage creator payouts."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Payouts"
          value="$4,650.50"
          icon={Clock}
          description="2 open requests"
        />
        <StatCard
          title="Paid This Month"
          value="$19,350.75"
          icon={CheckCircle}
          description="+15% from last month"
        />
        <StatCard
          title="Total Paid"
          value="$284,981.00"
          icon={Wallet}
          description="All-time payouts"
        />
        <StatCard
          title="Rejected Payouts"
          value="$250.00"
          icon={XCircle}
          description="1 this month"
        />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>
            Review and process creator payout requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <PayoutsTable status="pending" />
            </TabsContent>
            <TabsContent value="approved">
              <PayoutsTable status="approved" />
            </TabsContent>
            <TabsContent value="rejected">
              <PayoutsTable status="rejected" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
