import { Outlet, NavLink } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CircleUserRound } from "lucide-react";

export default function StaffLayout() {
  return (
    <SidebarProvider>
      <AppSidebar isStuff={true} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1m mr-auto text-emerald-900 hover:bg-emerald-50 cursor-pointer hover:text-emerald-900" />
          <div className="flex items-center gap-2">
            <div className="text-right text-sm">
              <p className="text-emerald-900 font-semibold">Staf</p>
              <p className="text-gray-500">Staf Perusahaan</p>
            </div>
            <div>
              <CircleUserRound className="text-emerald-900" size={36} />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 bg-[#F7F9FB]">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
