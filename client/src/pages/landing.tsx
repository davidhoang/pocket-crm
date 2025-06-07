import { Button } from "@/components/ui/button";
import { Users, Shield, Smartphone } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-6">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Design CRM</h1>
          <p className="text-slate-600 text-lg">
            Your private platform for tracking and managing design talent
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Private & Secure</h3>
                <p className="text-sm text-slate-600">Your contact data stays protected</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Mobile Optimized</h3>
                <p className="text-sm text-slate-600">Access anywhere, anytime</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Curated Lists</h3>
                <p className="text-sm text-slate-600">Send talent lists to recruiters</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/api/login'}
            >
              Sign In to Continue
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Secure authentication powered by Replit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}