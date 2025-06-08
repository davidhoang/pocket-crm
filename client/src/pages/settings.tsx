import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import logoPath from "@assets/visualelectric-1749342811885_1749342828607.png";

export default function Settings() {
  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <img 
            src={logoPath} 
            alt="App Logo" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Settings</h1>
            <p className="text-xs text-slate-500">Account management</p>
          </div>
        </div>
      </div>

      <main className="pb-20">
        <div className="px-4 py-6">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}