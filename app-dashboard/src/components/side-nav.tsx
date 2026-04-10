'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  User,
  FileText,
  BadgeDollarSign,
  Server,
  ShieldAlert,
  Settings,
  BarChart3,
  FileDown,
  ScrollText,
  UserCog,
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/creators', label: 'Creators', icon: Users },
  { href: '/members', label: 'Members', icon: User },
  { href: '/content', label: 'Content Feed', icon: FileText },
  { href: '/subscriptions', label: 'Subscriptions', icon: BadgeDollarSign },
  { href: '/payouts', label: 'Payouts', icon: BadgeDollarSign },
  { href: '/reports', label: 'Reports & Moderation', icon: ShieldAlert },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/audit-log', label: 'Audit Log', icon: ScrollText },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/admin-users', label: 'Admin Users', icon: UserCog },
  { href: '/export', label: 'Data Export', icon: FileDown },
  { href: '/server-status', label: 'Server Status', icon: Server },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="px-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(
                'relative h-11 px-3 rounded-xl transition-all duration-200',
                'hover:bg-white/60 dark:hover:bg-white/10',
                isActive && [
                  'bg-gradient-to-r from-primary/10 to-transparent',
                  'text-primary font-semibold',
                  'nav-active-glow',
                ],
                !isActive && 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Link href={item.href} className="flex items-center gap-3">
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-gradient-primary animate-glow-pulse" />
                )}
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] transition-all duration-200',
                    isActive ? 'text-primary drop-shadow-sm' : 'group-hover:text-foreground'
                  )}
                />
                <span className={cn('text-sm', isActive && 'font-semibold')}>
                  {item.label}
                </span>
                {/* Active gradient pill background */}
                {isActive && (
                  <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/8 to-transparent pointer-events-none" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
