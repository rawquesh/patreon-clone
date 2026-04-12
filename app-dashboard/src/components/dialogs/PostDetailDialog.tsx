'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DetailDialog } from './DetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getPostById } from '@/lib/services';
import type { Post, PostDetail, PostStatus } from '@/types';

function StatusBadge({ status }: { status: PostStatus }) {
  const config = {
    published: { label: 'Published', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    draft: { label: 'Draft', class: 'bg-muted text-muted-foreground border-border' },
    archived: { label: 'Archived', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[status] || config.draft;
  return <Badge className={cn('text-xs font-medium border', c.class)}>{c.label}</Badge>;
}

interface PostDetailDialogProps {
  post: Post | null;
  onClose: () => void;
  onRefresh: () => void;
  onViewCreator?: (creator: any) => void;
  onDeleteRequest?: (post: Post) => void;
}

export function PostDetailDialog({ post, onClose, onRefresh, onViewCreator, onDeleteRequest }: PostDetailDialogProps) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const open = !!post;

  useEffect(() => {
    if (open && post) {
      setLoadingDetail(true);
      getPostById(post.id || (post as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load post', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    } else if (!open) {
      setDetail(null);
    }
  }, [open, post, toast]);

  const p = detail || post;

  return (
    <DetailDialog
      open={open}
      onOpenChange={(o) => { if (!o) onClose(); }}
      title="Post Details"
      description="Full post information and engagement stats."
      maxWidth="max-w-2xl"
    >
      {loadingDetail ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : p ? (
        <div className="space-y-5">
          {/* Creator header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={(p as any).creator?.profilePicture || ''} />
              <AvatarFallback className="bg-gradient-primary text-slate-900 dark:text-white font-bold">
                {(p as any).creator?.displayName?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">
                {(p as any).creator?.displayName || (p as any).creator?.creatorUsername || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
              </p>
            </div>
            <StatusBadge status={p.status} />
          </div>

          {p.title && <h3 className="font-bold text-lg">{p.title}</h3>}

          {/* Media */}
          {p.mediaUrls && p.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {p.mediaUrls.slice(0, 4).map((url: string, i: number) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={url} alt={`Media ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div 
            className="text-sm whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: (p as any).textContent || p.description || p.title || 'No content' }}
          />

          {/* Engagement stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Views', value: p.viewCount || 0, color: 'text-primary' },
              { label: 'Likes', value: p.likeCount || 0, color: 'text-rose-500' },
              { label: 'Comments', value: p.commentCount || 0, color: 'text-blue-500' },
              { label: 'Shares', value: p.shareCount || 0, color: 'text-emerald-500' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border p-3.5 text-center">
                <p className={cn('text-xl font-bold', stat.color)}>{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {p.tags && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs rounded-full px-2.5 py-0.5">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-border/50 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { onClose(); if (onViewCreator) onViewCreator((p as any).creator); }} className="rounded-lg">
              <User className="mr-2 h-4 w-4" /> View Creator
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { onClose(); if (onDeleteRequest) onDeleteRequest(p as Post); }} className="rounded-lg">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      ) : null}
    </DetailDialog>
  );
}
