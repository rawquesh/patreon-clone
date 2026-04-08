import { HomeIcon } from "@/icons/home";
import { NavItem } from "./types";
import { LibraryIcon } from "@/icons/library";
import { UsersIcon } from "@/icons/users";
import { StatsIcon } from "@/icons/stats";
import { MoneyIcon } from "@/icons/money";
import { AnnouncementIcon } from "@/icons/announcement";
import { MessagesIcon } from "@/icons/messages";
import { NotificationsIcon } from "@/icons/notifications";
import { SettingsIcon } from "@/icons/settings";
import { SearchIcon } from "@/icons/search";

export const navItems: Record<"creator" | "user", NavItem[]> = {
  creator: [
    {
      icon: "typcn:home",
      title: "My Page",
      link: "/profile",
      iconComponent: <HomeIcon />,
    },
    {
      icon: "solar:library-bold-duotone",
      title: "Library",
      link: "/profile/library",
      iconComponent: <LibraryIcon />,
    },
    {
      icon: "mdi:users",
      title: "Audience",
      link: "/profile/audience",
      iconComponent: <UsersIcon />,
    },
    {
      icon: "ion:stats-chart",
      title: "Insights",
      link: "/profile/insights",
      iconComponent: <StatsIcon />,
    },
    {
      icon: "tdesign:money-filled",
      title: "Payouts",
      link: "/profile/payouts",
      iconComponent: <MoneyIcon />,
    },
    {
      icon: "mingcute:announcement-fill",
      title: "Promotions",
      link: "/profile/promotions",
      iconComponent: <AnnouncementIcon />,
    },
    {
      icon: "jam:messages-alt-f",
      title: "Messages",
      link: "/profile/community",
      iconComponent: <MessagesIcon />,
    },
    {
      icon: "ic:round-notifications",
      title: "Notifications",
      link: "/profile/notifications",
      iconComponent: <NotificationsIcon />,
    },
    {
      icon: "material-symbols:settings-rounded",
      title: "Settings",
      link: "/profile/settings",
      iconComponent: <SettingsIcon />,
    },
  ],
  user: [
    {
      icon: "typcn:home",
      title: "Home",
      link: "/home",
      iconComponent: <HomeIcon />,
    },
    {
      icon: "ic:round-search",
      title: "Explore",
      link: "/explore",
      iconComponent: <SearchIcon />,
    },
    {
      icon: "jam:messages-alt-f",
      title: "Messages",
      link: "/user/messages",
      iconComponent: <MessagesIcon />,
    },
    {
      icon: "ic:round-notifications",
      title: "Notifications",
      link: "/notifications",
      iconComponent: <NotificationsIcon />,
    },
    {
      icon: "material-symbols:settings-rounded",
      title: "Settings",
      link: "/settings",
      iconComponent: <SettingsIcon />,
    },
  ],
};
