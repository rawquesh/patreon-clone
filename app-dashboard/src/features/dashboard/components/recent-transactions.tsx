'use client';

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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TransactionStatusBadge } from '@/components/status-badge';

type Transaction = {
  user: { name: string; email: string };
  type: string;
  status: string;
  date: string;
  amount: string;
};

const recentTransactions: Transaction[] = [
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

export function RecentTransactions() {
  return (
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
                  <TransactionStatusBadge status={transaction.status} />
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell className="text-right">{transaction.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
