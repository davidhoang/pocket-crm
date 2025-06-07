import { Users, Mail, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200">
      <div className="flex">
        <Button
          variant="ghost"
          className="flex-1 flex-col h-auto py-3 px-2 bg-slate-50 text-primary"
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Contacts</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 flex-col h-auto py-3 px-2 text-slate-400"
        >
          <Mail className="w-5 h-5 mb-1" />
          <span className="text-xs">Email</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 flex-col h-auto py-3 px-2 text-slate-400"
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-xs">Analytics</span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 flex-col h-auto py-3 px-2 text-slate-400"
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </nav>
  );
}
