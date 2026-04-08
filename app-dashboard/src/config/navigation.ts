import {
  LayoutDashboard,
  Users,
  User,
  FileText,
  BadgeDollarSign,
  Banknote,
  Bot,
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
  { href: '/payouts', label: 'Payouts', icon: Banknote },
  { href: '/anomaly-detection', label: 'Anomaly Detection', icon: Bot },
];
