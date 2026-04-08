'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  getPosts,
  getPostById,
  withholdPost,
  restorePost,
  deletePost,
} from '@/lib/services';
import type { Post, PostDetail, PostStatus } from '@/types';

function PostTypeIcon({ type }: { type: string }) {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'image': return <ImageIcon className={iconClass} />;
    case 'video': return <Video className={iconClass} />;
    case 'link': return <Link className={iconClass} />;
    default: return <FileText className={iconClass} />;
  }
}

function StatusBadge({ status }: { status: PostStatus }) {
  const variant =
    status === 'published' ? 'default'
    : status === 'draft' ? 'secondary'
    : 'outline';
  return <Badge variant={variant}>{status}</Badge>;
}

function PostDetailDialog({
  post,
  open,
  onClose,
  onAction,
}: {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onAction: (id: string, action: string) => Promise<void>;
}) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && post) {
      setLoadingDetail(true);
      getPostById(post.id || (post as any)._id)
        .then(setDetail)
        .catch(() => toast({ title: 'Failed to load post', variant: 'destructive' }))
        .finally(() => setLoadingDetail(false));
    }
  }, [open, post]);

  const handleAction = async (action: string) => {
    if (!detail) return;
    const id = detail.id || (detail as any)._id;
    setLoading(true);
    try {
      await onAction(id, action);
      onClose();
    } catch {
      toast({ title: `${action} failed`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const p = detail || post;
  if (!p) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
          <DialogDescription>Full post information and engagement stats.</DialogDescription>
        </DialogHeader>
        {loadingDetail ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={(p as any).creator?.profilePicture || ''} />
                <AvatarFallback>{(p as any).creator?.displayName?.charAt(0) || 'C'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{(p as any).creator?.displayName || (p as any).creator?.creatorUsername || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </div>

            {p.title && <h3 className="font-semibold text-lg">{p.title}</h3>}

            {p.mediaUrls && p.mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {p.mediaUrls.slice(0, 4).map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-md overflow-hidden">
                    <Image src={url} alt={`Media ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {(p as any).textContent && (
              <p className="text-sm whitespace-pre-wrap">{(p as any).textContent}</p>
            )}
            {p.description && (
              <p className="text-sm whitespace-pre-wrap">{p.description}</p>
            )}

            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-md border p-3 text-center">
                <p className="text-2xl font-bold">{p.viewCount || 0}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="rounded-md border p-3 text-center">
                <p className="text-2xl font-bold">{p.likeCount || 0}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div className="rounded-md border p-3 text-center">
                <p className="text-2xl font-bold">{p.commentCount || 0}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="rounded-md border p-3 text-center">
                <p className="text-2xl font-bold">{p.shareCount || 0}</p>
                <p className="text-xs text-muted-foreground">Shares</p>
              </div>
            </div>

            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {p.status === 'published' ? (
                <Button size="sm" variant="destructive" onClick={() => handleAction('withhold')} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  Withhold
                </Button>
              ) : (
                <Button size="sm" onClick={() => handleAction('restore')} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  Restore
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => handleAction('delete')} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ContentFeedPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    }>
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

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
      if (action === 'withhold') {
        await withholdPost(id);
        toast({ title: 'Post withheld' });
      } else if (action === 'restore') {
        await restorePost(id);
        toast({ title: 'Post restored' });
      } else if (action === 'delete') {
        await deletePost(id);
        toast({ title: 'Post deleted' });
      }
      load();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: 'destructive' });
      throw e;
    }
  };

  return (
    <>
      <PageHeader
        title="Content Feed"
        description="A global feed of all posts on the platform."
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); updateParams({ type: v, page: '1' }); }}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); updateParams({ status: v, page: '1' }); }}>
            <SelectTrigger className="w-full sm:w-[160px]">
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
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-3">{error}</p>
            <Button variant="outline" onClick={load}>Retry</Button>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No posts found matching your filters.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id || (post as any)._id} className="flex flex-col">
                <CardContent className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={(post as any).creator?.profilePicture || ''} />
                      <AvatarFallback>{(post as any).creator?.displayName?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {(post as any).creator?.displayName || (post as any).creator?.creatorUsername || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <PostTypeIcon type={post.type} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedPost(post); setDialogOpen(true); }}>
                            <Eye className="mr-2 h-4 w-4" /> View Post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(post.id || (post as any)._id, 'withhold')}>
                            <Ban className="mr-2 h-4 w-4" /> Withhold
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(post.id || (post as any)._id, 'restore')}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Restore
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleAction(post.id || (post as any)._id, 'delete')}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="relative mb-3 aspect-video w-full rounded-md overflow-hidden">
                      <Image
                        src={post.mediaUrls[0]}
                        alt="Post media"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                    {post.content || (post as any).textContent || post.description || post.title || 'No content'}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <StatusBadge status={post.status} />
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{post.viewCount || 0} views</span>
                      <span>{post.likeCount || 0} likes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page - 1) })} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => updateParams({ page: String(page + 1) })} disabled={page >= pagination.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <PostDetailDialog
        post={selectedPost}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAction={handleAction}
      />
    </>
  );
}
