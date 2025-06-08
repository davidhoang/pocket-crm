import { LogOut, User, Shield, Bell, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
            <p className="text-xs text-slate-500">Manage your preferences</p>
          </div>
        </div>
      </div>

      <main className="pb-20">
        <div className="px-4 py-6 space-y-6">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account</span>
              </CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Profile Information</p>
                  <p className="text-sm text-slate-500">Update your personal details</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <span className="sr-only">Edit profile</span>
                  →
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Email Preferences</p>
                  <p className="text-sm text-slate-500">Manage notification settings</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <span className="sr-only">Edit email preferences</span>
                  →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>
                Control your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Data Export</p>
                  <p className="text-sm text-slate-500">Download your contact data</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <span className="sr-only">Export data</span>
                  →
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Privacy Policy</p>
                  <p className="text-sm text-slate-500">Review our privacy practices</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <span className="sr-only">View privacy policy</span>
                  →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Email Notifications</p>
                  <p className="text-sm text-slate-500">Get notified via email</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <span className="sr-only">Configure email notifications</span>
                  →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">Theme</p>
                  <p className="text-sm text-slate-500">Light mode</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <span className="sr-only">Change theme</span>
                  →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}