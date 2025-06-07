import { Button } from "@/components/ui/button";
import { Users, Shield, Smartphone } from "lucide-react";
import cityImage from "@assets/visualelectric-1748444163530_1749336891397.png";

export default function Landing() {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-6">
      {/* Hero Image */}
      <div className="w-full mb-6">
        <img 
          src={cityImage} 
          alt="San Francisco skyline" 
          className="w-full h-32 object-cover rounded-lg shadow-lg"
        />
      </div>
      
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Pocket CRM</h1>
          <p className="text-slate-800 text-lg">
            Tracking design talent on your mobile device.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  Private & Secure
                </h3>
                <p className="text-sm text-slate-600">
                  Your contact data stays protected
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  Mobile Optimized
                </h3>
                <p className="text-sm text-slate-600">
                  Access anywhere, anytime
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Curated Lists</h3>
                <p className="text-sm text-slate-600">
                  Send talent lists to recruiters
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-blue-700 text-white"
              onClick={() => (window.location.href = "/api/login")}
            >
              Sign In to Continue
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Secure authentication powered by Replit
            </p>
            <p className="text-xs text-slate-500 text-center">
              <a href="http://www.proofofconcept.pub" target="_blank">
                Proof of Concept experiment
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
