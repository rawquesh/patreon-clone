import type { Post } from '@/types';
import { posts } from '@/lib/data';

export async function getPosts(): Promise<Post[]> {
  return posts;
}

export async function getPostById(id: string): Promise<Post | undefined> {
  return posts.find((p) => p.id === id);
}
