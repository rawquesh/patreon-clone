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

type Props = {
  payouts: Payout[];
};

export function ProcessedPayoutsTable({ payouts }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Request Date</TableHead>
          <TableHead>Processed Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
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
            <TableCell>{payout.processedDate ?? '—'}</TableCell>
            <TableCell className="text-right">
              ${payout.amount.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
