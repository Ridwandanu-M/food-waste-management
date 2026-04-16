import * as React from "react";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router";
import {
  BetweenHorizontalEnd,
  ChartColumn,
  ChartNoAxesCombined,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

const data = {
  versions: ["1", "2", "3"],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboard strokeWidth={2} size={24} />,
      isStuff: false,
    },
    {
      title: "Perencanaan",
      url: "/perencanaan",
      icon: <ChartColumn strokeWidth={2} size={24} />,
      isStuff: false,
    },
    {
      title: "Entri Data",
      url: "/entri-data",
      icon: <BetweenHorizontalEnd strokeWidth={2} size={24} />,
      isStuff: true,
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: <ChartNoAxesCombined strokeWidth={2} size={24} />,
      isStuff: true,
    },
    {
      title: "Manajemen",
      url: "/manajemen",
      icon: <Users strokeWidth={2} size={24} />,
      isStuff: false,
    },
    {
      title: "Pengaturan",
      url: "/pengaturan",
      icon: <Settings strokeWidth={2} size={24} />,
      isStuff: false,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isStuff?: boolean;
}

export function AppSidebar({ isStuff = false, ...props }: AppSidebarProps) {
  const filteredNav = isStuff
    ? data.navMain.filter((item) => item.isStuff)
    : data.navMain;
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <p className="text-emerald-800 text-lg font-semibold">
          Food Waste Management
        </p>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        <ul className="flex flex-col gap-2">
          {filteredNav.map((item) => (
            <NavLink
              key={item.title}
              to={isStuff ? `/staff${item.url}` : item.url}
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-2 text-sm p-4 pl-8 bg-emerald-50 cursor-pointer text-emerald-900 border-r-4 border-r-emerald-800"
                  : "flex items-center gap-2 text-sm p-4 pl-8 hover:bg-emerald-50 cursor-pointer hover:text-emerald-900 hover:border-r-4 hover:border-r-emerald-800"
              }
            >
              {item.icon}
              {item.title}
            </NavLink>
          ))}
        </ul>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
