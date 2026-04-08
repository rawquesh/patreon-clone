import type { Payout } from '@/types';
import { payouts } from '@/lib/data';

export async function getPayouts(): Promise<Payout[]> {
  return payouts;
}

export async function getPayoutById(id: string): Promise<Payout | undefined> {
  return payouts.find((p) => p.id === id);
}
