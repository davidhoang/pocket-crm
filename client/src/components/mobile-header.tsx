import { Search, MoreVertical, X, CheckCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoPath from "@assets/visualelectric-1749342811885_1749342828607.png";

interface MobileHeaderProps {
  contactCount: number;
  searchVisible: boolean;
  searchQuery: string;
  onSearchToggle: () => void;
  onSearchChange: (query: string) => void;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onComposeEmail: () => void;
}

export default function MobileHeader({
  contactCount,
  searchVisible,
  searchQuery,
  onSearchToggle,
  onSearchChange,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onComposeEmail,
}: MobileHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {selectedCount > 0 ? (
        <div className="bg-primary text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-600 p-1"
                onClick={onClearSelection}
              >
                <X className="w-4 h-4" />
              </Button>
              <span className="font-medium">{selectedCount} selected</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-600 p-1"
                onClick={onSelectAll}
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-primary hover:bg-slate-100"
                onClick={onComposeEmail}
              >
                Email
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={logoPath} 
              alt="App Logo" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Contacts</h1>
              <p className="text-xs text-slate-500">{contactCount} contacts</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"
              onClick={onSearchToggle}
            >
              <Search className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      {searchVisible && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              autoFocus
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
      )}
    </header>
  );
}
