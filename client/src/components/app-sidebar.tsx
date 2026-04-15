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
      icon: <LayoutDashboard strokeWidth={2} size={28} />,
    },
    {
      title: "Perencanaan",
      url: "/",
      icon: <ChartColumn strokeWidth={2} size={28} />,
    },
    {
      title: "Entri Data",
      url: "/",
      icon: <BetweenHorizontalEnd strokeWidth={2} size={28} />,
    },
    {
      title: "Laporan",
      url: "/",
      icon: <ChartNoAxesCombined strokeWidth={2} size={28} />,
    },
    {
      title: "Manajemen",
      url: "/",
      icon: <Users strokeWidth={2} size={28} />,
    },
    {
      title: "Pengaturan",
      url: "/",
      icon: <Settings strokeWidth={2} size={28} />,
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
            <li
              key={item.title}
              className="p-4 hover:bg-emerald-50 cursor-pointer hover:text-emerald-900 hover:border-r-4 hover:border-r-emerald-800"
            >
              <NavLink
                to={item.url}
                className="flex items-center gap-2 text-sm"
              >
                {item.icon}
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
