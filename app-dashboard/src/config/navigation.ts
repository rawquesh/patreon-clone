import {
  LayoutDashboard,
  Users,
  User,
  FileText,
  BadgeDollarSign,
  ShieldAlert,
  Settings,
  BarChart3,
  FileDown,
  ScrollText,
  UserCog,
  Server,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const navigationItems: NavItem[] = [
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
