import { Users, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Users, label: "Contacts" },
    { path: "/lists", icon: List, label: "Lists" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`flex-1 flex-col h-auto py-3 px-2 ${
                isActive 
                  ? "bg-slate-50 text-primary" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => setLocation(item.path)}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className={`text-xs ${isActive ? "font-medium" : ""}`}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
