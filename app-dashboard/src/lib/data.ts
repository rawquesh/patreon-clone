import { format, subDays, subMonths, subWeeks } from 'date-fns';

export type Creator = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'approved' | 'pending' | 'suspended';
  joinedDate: string;
  stripeOnboarded: boolean;
};

export const creators: Creator[] = [
  { id: '1', name: 'Alina Starr', email: 'alina@example.com', avatar: 'https://placehold.co/40x40.png', status: 'approved', joinedDate: format(subDays(new Date(), 3), 'PPP'), stripeOnboarded: true },
  { id: '2', name: 'Ben Carter', email: 'ben@example.com', avatar: 'https://placehold.co/40x40.png', status: 'approved', joinedDate: format(subDays(new Date(), 10), 'PPP'), stripeOnboarded: true },
  { id: '3', name: 'Clara Danes', email: 'clara@example.com', avatar: 'https://placehold.co/40x40.png', status: 'pending', joinedDate: format(subDays(new Date(), 1), 'PPP'), stripeOnboarded: false },
  { id: '4', name: 'David York', email: 'david@example.com', avatar: 'https://placehold.co/40x40.png', status: 'suspended', joinedDate: format(subMonths(new Date(), 2), 'PPP'), stripeOnboarded: true },
  { id: '5', name: 'Eva Green', email: 'eva@example.com', avatar: 'https://placehold.co/40x40.png', status: 'approved', joinedDate: format(subWeeks(new Date(), 3), 'PPP'), stripeOnboarded: false },
];

export type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  subscription: {
    plan: string;
    status: 'active' | 'canceled' | 'past_due';
  };
};

export const members: Member[] = [
  { id: 'm1', name: 'Frank Miller', email: 'frank@example.com', avatar: 'https://placehold.co/40x40.png', status: 'active', joinedDate: format(subDays(new Date(), 20), 'PPP'), subscription: { plan: 'Tier 1', status: 'active' } },
  { id: 'm2', name: 'Grace Hopper', email: 'grace@example.com', avatar: 'https://placehold.co/40x40.png', status: 'active', joinedDate: format(subMonths(new Date(), 3), 'PPP'), subscription: { plan: 'Tier 2', status: 'active' } },
  { id: 'm3', name: 'Henry Ford', email: 'henry@example.com', avatar: 'https://placehold.co/40x40.png', status: 'inactive', joinedDate: format(subWeeks(new Date(), 5), 'PPP'), subscription: { plan: 'Tier 1', status: 'canceled' } },
  { id: 'm4', name: 'Ivy League', email: 'ivy@example.com', avatar: 'https://placehold.co/40x40.png', status: 'active', joinedDate: format(subDays(new Date(), 5), 'PPP'), subscription: { plan: 'Tier 3', status: 'past_due' } },
  { id: 'm5', name: 'Jack Daniels', email: 'jack@example.com', avatar: 'https://placehold.co/40x40.png', status: 'active', joinedDate: format(subMonths(new Date(), 1), 'PPP'), subscription: { plan: 'Tier 2', status: 'active' } },
];

export type Post = {
  id: string;
  creator: Pick<Creator, 'name' | 'avatar'>;
  type: 'text' | 'image' | 'video';
  status: 'published' | 'draft' | 'archived';
  content: string;
  image?: string;
  createdAt: string;
};

export const posts: Post[] = [
  { id: 'p1', creator: { name: 'Alina Starr', avatar: 'https://placehold.co/40x40.png' }, type: 'image', status: 'published', content: 'Just released a new photo set!', image: 'https://placehold.co/600x400.png', createdAt: format(subDays(new Date(), 1), 'PPP') },
  { id: 'p2', creator: { name: 'Ben Carter', avatar: 'https://placehold.co/40x40.png' }, type: 'video', status: 'published', content: 'Weekly vlog is now live. Check it out!', createdAt: format(subDays(new Date(), 2), 'PPP') },
  { id: 'p3', creator: { name: 'Alina Starr', avatar: 'https://placehold.co/40x40.png' }, type: 'text', status: 'published', content: 'Hey everyone, just a quick update on my upcoming projects. I\'m so excited to share what I\'ve been working on. Stay tuned for more details next week!', createdAt: format(subDays(new Date(), 3), 'PPP') },
  { id: 'p4', creator: { name: 'David York', avatar: 'https://placehold.co/40x40.png' }, type: 'text', status: 'archived', content: 'This is an old post.', createdAt: format(subMonths(new Date(), 5), 'PPP') },
  { id: 'p5', creator: { name: 'Eva Green', avatar: 'https://placehold.co/40x40.png' }, type: 'image', status: 'draft', content: 'Working on a new digital painting.', image: 'https://placehold.co/600x400.png', createdAt: format(subDays(new Date(), 4), 'PPP') },
];

export type Subscription = {
  id: string;
  member: Pick<Member, 'name' | 'email' | 'avatar'>;
  creator: Pick<Creator, 'name'>;
  plan: string;
  status: 'active' | 'canceled' | 'past_due';
  amount: number;
  startDate: string;
  nextBilling: string;
}

export const subscriptions: Subscription[] = [
  { id: 's1', member: members[0], creator: creators[0], plan: 'Tier 1', status: 'active', amount: 5, startDate: format(subMonths(new Date(), 2), 'PPP'), nextBilling: format(subDays(new Date(), -10), 'PPP') },
  { id: 's2', member: members[1], creator: creators[1], plan: 'Tier 2', status: 'active', amount: 10, startDate: format(subMonths(new Date(), 3), 'PPP'), nextBilling: format(subDays(new Date(), -15), 'PPP') },
  { id: 's3', member: members[2], creator: creators[0], plan: 'Tier 1', status: 'canceled', amount: 5, startDate: format(subMonths(new Date(), 5), 'PPP'), nextBilling: '-' },
  { id: 's4', member: members[3], creator: creators[2], plan: 'Tier 3', status: 'past_due', amount: 20, startDate: format(subMonths(new Date(), 1), 'PPP'), nextBilling: format(subDays(new Date(), 2), 'PPP') },
  { id: 's5', member: members[4], creator: creators[1], plan: 'Tier 2', status: 'active', amount: 10, startDate: format(subMonths(new Date(), 1), 'PPP'), nextBilling: format(subDays(new Date(), -20), 'PPP') },
];

export type Payout = {
    id: string;
    creator: Pick<Creator, 'name' | 'avatar'>;
    amount: number;
    requestDate: string;
    status: 'pending' | 'approved' | 'rejected';
    processedDate?: string;
}

export const payouts: Payout[] = [
    { id: 'po1', creator: creators[0], amount: 1250.50, requestDate: format(subDays(new Date(), 2), 'PPP'), status: 'pending' },
    { id: 'po2', creator: creators[1], amount: 3400.00, requestDate: format(subDays(new Date(), 4), 'PPP'), status: 'pending' },
    { id: 'po3', creator: creators[3], amount: 850.75, requestDate: format(subWeeks(new Date(), 1), 'PPP'), status: 'approved', processedDate: format(subDays(new Date(), 5), 'PPP') },
    { id: 'po4', creator: creators[0], amount: 1100.00, requestDate: format(subWeeks(new Date(), 2), 'PPP'), status: 'approved', processedDate: format(subDays(new Date(), 12), 'PPP') },
    { id: 'po5', creator: creators[4], amount: 250.00, requestDate: format(subWeeks(new Date(), 1), 'PPP'), status: 'rejected', processedDate: format(subDays(new Date(), 6), 'PPP') },
];
