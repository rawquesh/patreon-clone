import type { Subscription } from '@/types';
import { subscriptions } from '@/lib/data';

export async function getSubscriptions(): Promise<Subscription[]> {
  return subscriptions;
}

export async function getSubscriptionById(id: string): Promise<Subscription | undefined> {
  return subscriptions.find((s) => s.id === id);
}
