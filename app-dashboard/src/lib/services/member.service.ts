import type { Member } from '@/types';
import { members } from '@/lib/data';

export async function getMembers(): Promise<Member[]> {
  return members;
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  return members.find((m) => m.id === id);
}
