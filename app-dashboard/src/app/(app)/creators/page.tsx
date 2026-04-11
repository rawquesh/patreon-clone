"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getCreators, approveCreator, rejectCreator, suspendCreator, activateCreator } from "@/lib/services";
import { CreatorDetailDialog, RejectCreatorDialog } from "@/components/dialogs";
import type { Creator, CreatorStatus } from "@/types";

function CreatorStatusBadge({ status }: { status: CreatorStatus }) {
  const config = {
    PUBLISHED: {
      label: "Active",
      class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    REQUIRE_APPROVAL: {
      label: "Pending Approval",
      class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    PENDING: { label: "Pending", class: "bg-muted text-muted-foreground border-border" },
    SUSPENDED: {
      label: "Suspended",
      class: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    },
  };
  const normalizedStatus = typeof status === "string" ? status.toUpperCase() : "PENDING";
  const c = config[normalizedStatus as keyof typeof config] || config.PENDING;
  return <Badge className={cn("text-xs font-medium border", c.class)}>{c.label}</Badge>;
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "require_approval", label: "Require Approval" },
  { value: "published", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

function CreatorsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-11 w-80 rounded-xl" />
      </div>
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="glass-card-static rounded-xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border/30 last:border-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreatorsPage() {
  return (
    <Suspense fallback={<CreatorsPageSkeleton />}>
      <CreatorsPageInner />
    </Suspense>
  );
}

function CreatorsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [rejectingCreatorId, setRejectingCreatorId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page") || "1");
  const statusFilter = searchParams.get("status") || "all";

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCreators({
        page,
        limit: 20,
        search: searchParams.get("search") || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setCreators(result.creators);
      setPagination(result.pagination);
    } catch (e: any) {
      setError(e?.message || "Failed to load creators");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateParams({ search: value, page: "1" });
  };

  const handleAction = async (id: string, action: string, payload?: any) => {
    try {
      if (action === "approve") {
        await approveCreator(id);
        toast({ title: "Creator approved successfully" });
      } else if (action === "reject") {
        await rejectCreator(id, payload?.reason);
        toast({ title: "Creator rejected" });
      } else if (action === "suspend") {
        await suspendCreator(id);
        toast({ title: "Creator suspended" });
      } else if (action === "activate") {
        await activateCreator(id);
        toast({ title: "Creator activated" });
      }
      load();
    } catch (e: any) {
      toast({ title: `Action failed: ${e?.message}`, variant: "destructive" });
      throw e;
    }
  };

  const openDetail = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  return (
    <>
      <PageHeader title="Creators" description="Manage all creators on the platform." gradientTitle />

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="glass-input pl-10 h-11 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams({ status: tab.value, page: "1" })}
            className={cn(
              "rounded-full text-xs font-medium h-8 transition-all duration-200",
              statusFilter === tab.value ? "btn-gradient shadow-md" : "btn-gradient-ghost rounded-full",
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card-static rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Creator
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Stripe
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subscribers
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Joined
                </TableHead>
                <TableHead className="pr-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/30 last:border-0">
                    <TableCell className="pl-6">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-destructive">
                    <p className="font-medium mb-3">{error}</p>
                    <Button variant="outline" onClick={load} size="sm" className="btn-gradient-ghost">
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ) : creators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No creators found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                creators.map((creator) => (
                  <TableRow
                    key={creator.id || (creator as any)._id}
                    className="table-row-hover border-b border-border/30 last:border-0 group"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
                          <AvatarImage src={creator.profilePicture || ""} />
                          <AvatarFallback className="bg-gradient-primary text-slate-900 dark:text-white text-sm font-bold">
                            {(creator.displayName || creator.creatorUsername || "C").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {creator.displayName || creator.creatorUsername || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">{creator.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CreatorStatusBadge status={creator.creatorStatus} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-xs font-medium",
                          creator.hasCompletedStripeOnboarding
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-muted text-muted-foreground border border-border",
                        )}
                      >
                        {creator.hasCompletedStripeOnboarding ? "Onboarded" : "Not Onboarded"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold tabular-nums">{creator.subscriberCount ?? "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {creator.createdAt
                          ? new Date(creator.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-menu rounded-xl shadow-xl">
                          <DropdownMenuItem
                            onClick={() => openDetail(creator)}
                            className="rounded-lg cursor-pointer hover:bg-primary/5"
                          >
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {creator.creatorStatus?.toUpperCase() === "REQUIRE_APPROVAL" && (
                            <DropdownMenuItem
                              onClick={() => handleAction(creator.id || (creator as any)._id, "approve")}
                              className="rounded-lg cursor-pointer text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {(creator.creatorStatus?.toUpperCase() === "PENDING" ||
                            creator.creatorStatus?.toUpperCase() === "REQUIRE_APPROVAL") && (
                            <DropdownMenuItem
                              className="rounded-lg cursor-pointer text-destructive hover:bg-destructive/5"
                              onClick={() => setRejectingCreatorId(creator.id || (creator as any)._id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          )}
                          {creator.creatorStatus?.toUpperCase() === "PUBLISHED" && (
                            <DropdownMenuItem
                              className="rounded-lg cursor-pointer text-destructive hover:bg-destructive/5"
                              onClick={() => handleAction(creator.id || (creator as any)._id, "suspend")}
                            >
                              <Ban className="mr-2 h-4 w-4" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {creator.creatorStatus?.toUpperCase() === "SUSPENDED" && (
                            <DropdownMenuItem
                              onClick={() => handleAction(creator.id || (creator as any)._id, "activate")}
                              className="rounded-lg cursor-pointer text-primary hover:bg-primary/5"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" /> Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} creators
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page <= 1}
                className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let p = i + 1;
                  if (pagination.totalPages > 5) {
                    if (page > 3) p = page - 2 + i;
                    if (page > pagination.totalPages - 2) p = pagination.totalPages - 4 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className={cn(
                        "h-8 min-w-[32px] rounded-lg text-xs font-medium transition-all duration-200",
                        page === p
                          ? "bg-gradient-primary text-slate-900 dark:text-white shadow-md"
                          : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page >= pagination.totalPages}
                className="h-8 w-8 p-0 rounded-lg btn-gradient-ghost"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreatorDetailDialog creator={selectedCreator} onClose={() => setSelectedCreator(null)} onRefresh={load} />
      <RejectCreatorDialog
        open={!!rejectingCreatorId}
        onOpenChange={(o) => {
          if (!o) setRejectingCreatorId(null);
        }}
        onConfirm={async (reason) => {
          if (rejectingCreatorId) {
            await handleAction(rejectingCreatorId, "reject", { reason });
            setRejectingCreatorId(null);
          }
        }}
      />
    </>
  );
}
