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
    },
    {
      title: "Perencanaan",
      url: "/perencanaan",
      icon: <ChartColumn strokeWidth={2} size={24} />,
    },
    {
      title: "Entri Data",
      url: "/entri-data",
      icon: <BetweenHorizontalEnd strokeWidth={2} size={24} />,
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: <ChartNoAxesCombined strokeWidth={2} size={24} />,
    },
    {
      title: "Manajemen",
      url: "/manajemen",
      icon: <Users strokeWidth={2} size={24} />,
    },
    {
      title: "Pengaturan",
      url: "/pengaturan",
      icon: <Settings strokeWidth={2} size={24} />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
          {data.navMain.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
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
