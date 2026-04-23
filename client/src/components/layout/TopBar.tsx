import { Bell, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TopBar() {
  return (
    <header className="h-14 border-b bg-background flex items-center px-6 gap-4 sticky top-0 z-10">
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Cari data..." className="pl-8 h-8 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="p-1.5 text-muted-foreground hover:text-foreground">
          <Bell size={18} />
        </button>
        <button className="p-1.5 text-muted-foreground hover:text-foreground">
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
