'use client';

import type { Payout } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type Props = {
  payouts: Payout[];
};

export function PayoutsTable({ payouts }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Request Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((payout) => (
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
            <TableCell className="text-right">
              ${payout.amount.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" className="mr-2">
                Approve
              </Button>
              <Button variant="destructive" size="sm">
                Reject
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
