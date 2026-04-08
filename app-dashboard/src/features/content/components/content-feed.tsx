'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { PostStatusBadge } from '@/components/status-badge';
import type { Post, Creator } from '@/types';

type Props = {
  posts: Post[];
  creators: Creator[];
};

export function ContentFeed({ posts, creators }: Props) {
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const creatorName = (post: Post) =>
    post.creator?.displayName || post.creator?.creatorUsername || 'Unknown';

  const filtered = posts.filter((post) => {
    if (creatorFilter !== 'all' && creatorName(post) !== creatorFilter) return false;
    if (typeFilter !== 'all' && post.type !== typeFilter) return false;
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={creatorFilter} onValueChange={setCreatorFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <Card key={post.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold">{creatorName(post)}</p>
                <p className="text-sm text-muted-foreground">{post.createdAt}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Post</DropdownMenuItem>
                  <DropdownMenuItem>View Creator</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1">
              {(post.image || post.mediaUrls?.[0]) && (
                <div className="relative mb-4 aspect-video w-full">
                  <Image
                    src={post.image || post.mediaUrls?.[0] || ''}
                    alt="Post content"
                    fill
                    className="rounded-md object-cover"
                    data-ai-hint="gallery abstract"
                  />
                </div>
              )}
              <p className="text-muted-foreground">
                {post.content || post.textContent || post.description || post.title || ''}
              </p>
            </CardContent>
            <CardFooter>
              <PostStatusBadge status={post.status} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
