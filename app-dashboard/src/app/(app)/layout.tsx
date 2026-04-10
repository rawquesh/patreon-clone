'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import { branding } from '@/config/branding';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SideNav } from '@/components/side-nav';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

function AppSidebarHeader() {
  return (
    <div className="relative">
      {/* Gradient accent bar at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-primary rounded-t-xl" />
      <SidebarHeader className="pt-4">
        <div className="flex items-center gap-2.5 px-2">
          {/* Logo */}
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl overflow-hidden">
            <Image src="/logo.png" alt={branding.appName} fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gradient">{branding.appName}</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Admin Panel
            </p>
          </div>
        </div>
      </SidebarHeader>
    </div>
  );
}

function AppSidebarFooter({ adminUser, onLogout }: { adminUser: AdminUser | null; onLogout: () => void }) {
  const displayName =
    adminUser?.displayName ||
    `${adminUser?.firstName || ''} ${adminUser?.lastName || ''}`.trim() ||
    'Admin User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarFooter className="border-t border-border/50">
      <div className="flex items-center gap-3 p-3 mx-1 my-1 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors duration-200 group">
        {/* Avatar with gradient ring on hover */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-40 blur-sm transition-opacity duration-200" />
          <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-200">
            <AvatarImage
              src={adminUser?.profilePicture || 'https://placehold.co/40x40.png'}
              alt="Admin"
              data-ai-hint="person avatar"
            />
            <AvatarFallback className="bg-gradient-primary text-slate-900 dark:text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors duration-200">
            {displayName}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {adminUser?.email || branding.support.email}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          type="submit"
          aria-label="Log out"
          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </SidebarFooter>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_user');
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <SidebarProvider>
      {/* Glass Sidebar — z-[60] keeps it above dialog overlay (z-50) */}
      <Sidebar className="glass-card-static border-r border-white/20 dark:border-white/10 z-[60]">
        {/* Gradient top decoration */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        {/* Subtle inner gradient */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{ background: 'var(--gradient-sidebar)' }}
        />

        <AppSidebarHeader />
        <SidebarContent className="relative">
          <SideNav />
        </SidebarContent>
        <AppSidebarFooter adminUser={adminUser} onLogout={handleLogout} />
      </Sidebar>

      <SidebarInset>
        {/* Premium Glass Header */}
        <header className="sticky top-0 z-[55] flex h-16 items-center justify-between glass-card px-4 sm:px-6 lg:px-8 gap-4 border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle bottom gradient border & top glow wash */}
          <div className="absolute pointer-events-none inset-0 bg-gradient-to-b from-primary/5 to-transparent z-0" />
          <div className="absolute pointer-events-none bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0" />
          
          {/* Mobile Trigger */}
          <div className="md:hidden relative z-10 flex items-center">
            <SidebarTrigger className="hover-lift h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
          </div>

          {/* Breadcrumb / Brand Title Area */}
          <div className="hidden md:flex items-center gap-2.5 text-sm font-semibold text-foreground relative z-10">
            <div className="relative w-5 h-5 drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]">
              <Image src="/logo.png" alt={branding.appName} fill className="object-contain" />
            </div>
            <span className="text-gradient tracking-wide">{branding.appName} Console</span>
          </div>

          {/* Right side actions slot */}
          <div className="flex items-center gap-3 ml-auto relative z-10">
            {/* Enhanced Live Indicator Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-xs font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-md transition-all duration-300 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover-lift cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              System Live
            </div>
          </div>
        </header>

        {/* Content area with gradient mesh background */}
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-mesh">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
