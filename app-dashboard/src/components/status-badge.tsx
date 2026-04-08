import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

type StatusEntry<T> = {
  value: T;
  label: string;
  variant: BadgeVariant;
  icon?: LucideIcon;
};

// --- Status configs ---

type CreatorStatus = 'approved' | 'pending' | 'suspended';
type MemberStatus = 'active' | 'inactive';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due';
type PayoutStatus = 'pending' | 'approved' | 'rejected';
type PostStatus = 'published' | 'draft' | 'archived';

const CREATOR_STATUS_CONFIG: StatusEntry<CreatorStatus>[] = [
  { value: 'approved', label: 'Approved', variant: 'default' },
  { value: 'pending', label: 'Pending', variant: 'secondary' },
  { value: 'suspended', label: 'Suspended', variant: 'destructive' },
];

const MEMBER_STATUS_CONFIG: StatusEntry<MemberStatus>[] = [
  { value: 'active', label: 'Active', variant: 'default' },
  { value: 'inactive', label: 'Inactive', variant: 'secondary' },
];

const SUBSCRIPTION_STATUS_CONFIG: StatusEntry<SubscriptionStatus>[] = [
  { value: 'active', label: 'Active', variant: 'default' },
  { value: 'canceled', label: 'Canceled', variant: 'secondary' },
  { value: 'past_due', label: 'Past Due', variant: 'destructive' },
];

const PAYOUT_STATUS_CONFIG: StatusEntry<PayoutStatus>[] = [
  { value: 'pending', label: 'Pending', variant: 'secondary' },
  { value: 'approved', label: 'Approved', variant: 'default' },
  { value: 'rejected', label: 'Rejected', variant: 'destructive' },
];

const POST_STATUS_CONFIG: StatusEntry<PostStatus>[] = [
  { value: 'published', label: 'Published', variant: 'default' },
  { value: 'draft', label: 'Draft', variant: 'secondary' },
  { value: 'archived', label: 'Archived', variant: 'outline' },
];

const STRIPE_STATUS_CONFIG: StatusEntry<boolean>[] = [
  { value: true, label: 'Onboarded', variant: 'default' },
  { value: false, label: 'Not Onboarded', variant: 'secondary' },
];

const TRANSACTION_STATUS_CONFIG: StatusEntry<string>[] = [
  { value: 'Success', label: 'Success', variant: 'default' },
  { value: 'Pending', label: 'Pending', variant: 'secondary' },
];

function resolveVariant<T>(entries: StatusEntry<T>[], value: T): BadgeVariant {
  return entries.find((e) => e.value === value)?.variant ?? 'secondary';
}

function resolveLabel<T>(entries: StatusEntry<T>[], value: T): string {
  return entries.find((e) => e.value === value)?.label ?? String(value);
}

// --- Public components ---

function StatusBadge<T>({ value, config }: { value: T; config: StatusEntry<T>[] }) {
  return (
    <Badge variant={resolveVariant(config, value)}>
      {resolveLabel(config, value)}
    </Badge>
  );
}

export function CreatorStatusBadge({ status }: { status: CreatorStatus }) {
  return <StatusBadge value={status} config={CREATOR_STATUS_CONFIG} />;
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return <StatusBadge value={status} config={MEMBER_STATUS_CONFIG} />;
}

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <StatusBadge value={status} config={SUBSCRIPTION_STATUS_CONFIG} />;
}

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  return <StatusBadge value={status} config={PAYOUT_STATUS_CONFIG} />;
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return <StatusBadge value={status} config={POST_STATUS_CONFIG} />;
}

export function StripeStatusBadge({ onboarded }: { onboarded: boolean }) {
  return <StatusBadge value={onboarded} config={STRIPE_STATUS_CONFIG} />;
}

export function TransactionStatusBadge({ status }: { status: string }) {
  return <StatusBadge value={status} config={TRANSACTION_STATUS_CONFIG} />;
}
