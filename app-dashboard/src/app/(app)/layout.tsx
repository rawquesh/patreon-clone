

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
import { Toaster } from "@/components/ui/toaster"

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
          <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-muted">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="https://placehold.co/40x40.png"
                alt="Admin"
                data-ai-hint="person avatar"
              />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin User</span>
              <span className="text-xs text-muted-foreground">
                admin@patreon-clone.example.com
              </span>
            </div>
              <Button variant="ghost" size="icon" type="submit" aria-label="Log out" className='ml-auto'>
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
          <div className="flex items-center gap-4">
            {/* Can add other header items here like search or notifications */}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
