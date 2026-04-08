'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SubscriptionStatusBadge } from '@/components/status-badge';
import type { Subscription, Creator, Member } from '@/types';

type Props = {
  subscriptions: Subscription[];
  creators: Creator[];
  members: Member[];
};

export function SubscriptionsTable({ subscriptions, creators, members }: Props) {
  const [search, setSearch] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = subscriptions.filter((sub) => {
    if (
      search &&
      !sub.member.name.toLowerCase().includes(search.toLowerCase()) &&
      !sub.member.email.toLowerCase().includes(search.toLowerCase()) &&
      !sub.creator.name.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (creatorFilter !== 'all' && sub.creator.name !== creatorFilter) return false;
    if (memberFilter !== 'all' && sub.member.name !== memberFilter) return false;
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
        <div className="max-w-sm">
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={creatorFilter} onValueChange={setCreatorFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by creator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Creators</SelectItem>
            {creators.map((creator) => (
              <SelectItem key={creator.id} value={creator.name}>
                {creator.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={memberFilter} onValueChange={setMemberFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.name}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          {filtered.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={sub.member.avatar} data-ai-hint="person avatar" />
                    <AvatarFallback>{sub.member.name.charAt(0)}</AvatarFallback>
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
                <SubscriptionStatusBadge status={sub.status} />
              </TableCell>
              <TableCell>{sub.nextBilling}</TableCell>
              <TableCell className="text-right">
                ${sub.amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
