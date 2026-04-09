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
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/creators', label: 'Creators', icon: Users },
  { href: '/members', label: 'Members', icon: User },
  { href: '/content', label: 'Content Feed', icon: FileText },
  { href: '/subscriptions', label: 'Subscriptions', icon: BadgeDollarSign },
  { href: '/payouts', label: 'Payouts', icon: BadgeDollarSign },
  { href: '/server-status', label: 'Server Status', icon: Server },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
          >
            <Link
              href={item.href}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
