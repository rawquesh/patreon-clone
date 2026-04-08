import type { Creator } from '@/types';
import { creators } from '@/lib/data';

// Simulate async API call
export async function getCreators(): Promise<Creator[]> {
  return creators;
}

export async function getCreatorById(id: string): Promise<Creator | undefined> {
  return creators.find((c) => c.id === id);
}
