import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { type Contact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";

interface EmailComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContacts: Contact[];
  onSuccess: () => void;
}

export default function EmailComposerModal({ 
  open, 
  onOpenChange, 
  selectedContacts, 
  onSuccess 
}: EmailComposerModalProps) {
  const { toast } = useToast();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Curated Design Talent List");
  const [message, setMessage] = useState("Hi [Name],\n\nI've curated a list of exceptional design talent that might be a great fit for your team...");

  const sendEmailMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/send-email", data),
    onSuccess: () => {
      toast({
        title: "Email sent successfully!",
        description: "Your curated talent list has been sent.",
      });
      setTo("");
      setSubject("Curated Design Talent List");
      setMessage("Hi [Name],\n\nI've curated a list of exceptional design talent that might be a great fit for your team...");
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to send email",
        description: "Please check your SendGrid configuration and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!to || !subject || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      to,
      subject,
      message,
      contactIds: selectedContacts.map(c => c.id),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto h-5/6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <p className="text-sm text-slate-500">
            Sending to {selectedContacts.length} selected contacts
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <div>
            <Label htmlFor="to">To (Recipient Email)</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recruiter@company.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <Label>Selected Contacts</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto bg-slate-50 rounded-lg p-3">
              {selectedContacts.map((contact) => {
                const getInitials = (firstName: string, lastName: string) => {
                  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
                };
                
                return (
                  <div key={contact.id} className="flex items-center space-x-3 text-sm">
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={contact.profilePhoto || undefined} 
                        alt={`${contact.firstName} ${contact.lastName}`}
                      />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {getInitials(contact.firstName, contact.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <span>{contact.firstName} {contact.lastName} - {contact.role} at {contact.company}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Email"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
