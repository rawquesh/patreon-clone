'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Search,
  Eye,
  Ban,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  ImageIcon,
  Video,
  Link,
  Eye as EyeIcon,
  Bell,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getPosts,
  withholdPost,
  restorePost,
  deletePost,
  notifyCreator,
} from '@/lib/services';
import { PostDetailDialog, CreatorDetailDialog } from '@/components/dialogs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Post, PostStatus } from '@/types';

function PostTypeIcon({ type }: { type: string }) {
  const configs: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    image: { icon: <ImageIcon className="h-4 w-4" />, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', label: 'Image' },
    video: { icon: <Video className="h-4 w-4" />, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', label: 'Video' },
    link: { icon: <Link className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', label: 'Link' },
    audio: { icon: <FileText className="h-4 w-4" />, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Audio' },
    text: { icon: <FileText className="h-4 w-4" />, color: 'bg-muted text-muted-foreground', label: 'Text' },
  };
  const c = configs[type] || configs.text;
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', c.color)}>
      {c.icon}
      {c.label}
    </div>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const config = {
    published: { label: 'Published', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    draft: { label: 'Draft', class: 'bg-muted text-muted-foreground border-border' },
    archived: { label: 'Archived', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  };
  const c = config[status] || config.draft;
  return <Badge className={cn('text-xs font-medium border', c.class)}>{c.label}</Badge>;
}


function ContentPageSkeleton() {
  return (
    <div className="space-y-4">
      <PageHeader title="Content Feed" description="A global feed of all posts on the platform." />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glass-card-static overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ContentFeedPage() {
  return (
    <Suspense fallback={<ContentPageSkeleton />}>
      <ContentFeedPageInner />
    </Suspense>
  );
}

function ContentFeedPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [notifyPost, setNotifyPost] = useState<Post | null>(null);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'published');
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [deletePostObj, setDeletePostObj] = useState<Post | null>(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const page = Number(searchParams.get('page') || '1');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPosts({
        page,
        limit: 20,
        search: searchParams.get('search') || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setPosts(result.posts);
      setPagination(result.pagination);
    } catch (e: any) {
      setError(e?.message || 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchParams, typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateParams({ search: value, page: '1' });
  };

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === 'withhold') { await withholdPost(id); toast({ title: 'Post withheld' }); }
      else if (action === 'restore') { await restorePost(id); toast({ title: 'Post restored' }); }
      else if (action === 'delete') { await deletePost(id); toast({ title: 'Post deleted' }); }
      load();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: 'destructive' });
      throw e;
    }
  };

  const handleNotify = async () => {
    if (!notifyPost || notifyMessage.trim().length < 10) return;
    const id = notifyPost.id || (notifyPost as any)._id;
    setNotifyLoading(true);
    try {
      await notifyCreator(id, notifyMessage.trim());
      toast({ title: 'Creator notified successfully' });
      setNotifyPost(null);
      setNotifyMessage('');
    } catch (e: any) {
      toast({ title: `Failed to notify: ${e?.message}`, variant: 'destructive' });
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleDeleteWithReason = async () => {
    if (!deletePostObj || deleteMessage.trim().length < 10) return;
    const id = deletePostObj.id || (deletePostObj as any)._id;
    setDeleteLoading(true);
    try {
      await deletePost(id);
      await notifyCreator(id, `Your post was deleted. Reason: ${deleteMessage.trim()}`);
      toast({ title: 'Post deleted and creator notified' });
      setDeletePostObj(null);
      setDeleteMessage('');
      load();
    } catch (e: any) {
      toast({ title: `Failed to delete/notify: ${e?.message}`, variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Content Feed" description="A global feed of all posts on the platform." gradientTitle>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="glass-input pl-10 h-10 rounded-xl text-sm w-44"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); updateParams({ type: v, page: '1' }); }}>
            <SelectTrigger className="h-10 rounded-xl text-xs w-[140px] btn-gradient-ghost">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); updateParams({ status: v, page: '1' }); }}>
            <SelectTrigger className="h-10 rounded-xl text-xs w-[140px] btn-gradient-ghost">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card-static overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="glass-card-static">
          <CardContent className="py-12 text-center">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <Button variant="outline" onClick={load} className="btn-gradient-ghost rounded-xl">Retry</Button>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="glass-card-static">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                <FileText className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="font-medium text-muted-foreground">No posts found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
            {posts.map((post) => (
              <Card key={post.id || (post as any)._id} className="glass-card hover-lift overflow-hidden group">
                <CardContent className="p-4 flex flex-col flex-1">
                  {/* Creator info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
                      <AvatarImage src={(post as any).creator?.profilePicture || ''} />
                      <AvatarFallback className="bg-gradient-primary text-slate-900 dark:text-white text-sm font-bold">
                        {(post as any).creator?.displayName?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {(post as any).creator?.displayName || (post as any).creator?.creatorUsername || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-menu rounded-xl shadow-xl">
                        <DropdownMenuItem onClick={() => setSelectedPost(post)} className="rounded-lg cursor-pointer hover:bg-primary/5">
                          <EyeIcon className="mr-2 h-4 w-4 text-muted-foreground" /> View Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedCreator((post as any).creator)} className="rounded-lg cursor-pointer hover:bg-primary/5">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" /> View Creator
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive hover:bg-destructive/5" onClick={() => { setDeletePostObj(post); setDeleteMessage(''); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Media */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="relative mb-3 aspect-video w-full rounded-xl overflow-hidden">
                      <Image src={post.mediaUrls[0]} alt="Post media" fill className="object-cover" />
                      {post.mediaUrls.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                          +{post.mediaUrls.length - 1}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div 
                    className="text-sm text-muted-foreground flex-1 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content || (post as any).textContent || post.description || post.title || 'No content' }}
                  />

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                       <PostTypeIcon type={post.type} />
                       <StatusBadge status={post.status || (post as any).postStatus} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="h-3.5 w-3.5" />
                        {(post.viewCount || 0).toLocaleString()}
                      </span>
                      <span>{post.likeCount || 0} likes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 px-2">
              <p className="text-xs text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page - 1) })} disabled={page <= 1} className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page + 1) })} disabled={page >= pagination.totalPages} className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <PostDetailDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onRefresh={load}
        onViewCreator={(c) => setSelectedCreator(c)}
        onDeleteRequest={(p) => { setDeletePostObj(p); setDeleteMessage(''); }}
      />

      <CreatorDetailDialog
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
        onRefresh={load}
      />

      <Dialog open={!!deletePostObj} onOpenChange={(o) => { if (!o) setDeletePostObj(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Provide a reason for deleting this post. This reason will be sent to the creator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="delete-msg" className="text-xs text-muted-foreground">
                Reason for deletion (min. 10 characters)
              </Label>
              <Textarea
                id="delete-msg"
                value={deleteMessage}
                onChange={(e) => setDeleteMessage(e.target.value)}
                placeholder="Enter deletion reason..."
                className="mt-1.5"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePostObj(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWithReason}
              disabled={deleteLoading || deleteMessage.trim().length < 10}
              className="rounded-xl"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
