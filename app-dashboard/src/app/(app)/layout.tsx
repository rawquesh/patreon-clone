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
import { LogOut, LayoutTemplate, Menu } from 'lucide-react';
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
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="text-primary size-8" />
            <h1 className="text-2xl font-semibold text-primary">Patreon Clone</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SideNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 rounded-md">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={adminUser?.profilePicture || 'https://placehold.co/40x40.png'}
                alt="Admin"
                data-ai-hint="person avatar"
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-sm truncate">{displayName}</span>
              <span className="text-xs text-muted-foreground truncate">
                {adminUser?.email || 'admin@patreon-clone.example.com'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              aria-label="Log out"
              className="ml-auto shrink-0"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8 md:justify-end">
          <div className="md:hidden">
            <SidebarTrigger>
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </div>
          <div className="flex items-center gap-4" />
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
