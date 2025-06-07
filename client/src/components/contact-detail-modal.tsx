import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type Contact, type InsertContact } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Edit, Mail, Phone, MapPin, Building, Calendar, Trash2 } from "lucide-react";
import EditContactModal from "@/components/edit-contact-modal";

interface ContactDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onRefetch: () => void;
}

export default function ContactDetailModal({ 
  open, 
  onOpenChange, 
  contact, 
  onRefetch 
}: ContactDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      onRefetch();
      onOpenChange(false);
      toast({
        title: "Contact deleted",
        description: "The contact has been deleted successfully.",
      });
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
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (contact && confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      deleteContactMutation.mutate(contact.id);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onRefetch();
  };

  if (!contact) return null;

  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase();
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md w-full h-full max-h-screen p-0 gap-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:h-auto">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="sr-only">Contact Details</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Contact Header */}
            <div className="text-center mb-6">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={contact.profilePhoto || ""} alt={fullName} />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-1">{fullName}</h2>
              
              {contact.role && (
                <p className="text-slate-600 mb-2">{contact.role}</p>
              )}
              
              {contact.company && (
                <div className="flex items-center justify-center text-slate-500 mb-3">
                  <Building className="w-4 h-4 mr-1" />
                  <span className="text-sm">{contact.company}</span>
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Contact Information */}
            <div className="space-y-4">
              {contact.linkedin && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">LinkedIn</p>
                    <p className="text-slate-800 text-sm truncate">{contact.linkedin}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(contact.linkedin?.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`, '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </Button>
                </div>
              )}

              {contact.portfolio && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Portfolio</p>
                    <p className="text-slate-800 text-sm truncate">{contact.portfolio}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(contact.portfolio.startsWith('http') ? contact.portfolio : `https://${contact.portfolio}`, '_blank')}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Button>
                </div>
              )}

              {contact.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Notes</p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-700 text-sm leading-relaxed">{contact.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleteContactMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteContactMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {contact && (
        <EditContactModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          contact={contact}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}