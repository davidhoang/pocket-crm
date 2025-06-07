import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertContactSchema, type Contact, type InsertContact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Camera, Upload, X } from "lucide-react";

interface EditContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onSuccess: () => void;
}

export default function EditContactModal({ open, onOpenChange, contact, onSuccess }: EditContactModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [profilePhoto, setProfilePhoto] = useState<string>(contact.profilePhoto || "");

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      role: contact.role,
      company: contact.company,
      linkedin: contact.linkedin || "",
      portfolio: contact.portfolio || "",
      notes: contact.notes || "",
      profilePhoto: contact.profilePhoto || "",
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: (data: InsertContact) => apiRequest("PUT", `/api/contacts/${contact.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contact updated",
        description: "Contact has been successfully updated.",
      });
      onSuccess();
      onOpenChange(false);
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
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 400;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      try {
        const compressedImage = await compressImage(file);
        setProfilePhoto(compressedImage);
        form.setValue('profilePhoto', compressedImage);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = (data: InsertContact) => {
    updateContactMutation.mutate({
      ...data,
      profilePhoto: profilePhoto || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-lg font-semibold">Edit Contact</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs pointer-events-none h-7 px-2"
                asChild
              >
                <span>
                  <Upload className="w-3 h-3 mr-1" />
                  {profilePhoto ? 'Change Photo' : 'Add Photo'}
                </span>
              </Button>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="First name"
              />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              {...form.register("role")}
              placeholder="e.g., Senior Product Designer"
            />
            {form.formState.errors.role && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.role.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              {...form.register("company")}
              placeholder="e.g., Apple, Google, Figma"
            />
            {form.formState.errors.company && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.company.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              {...form.register("linkedin")}
              placeholder="https://linkedin.com/in/username"
            />
            {form.formState.errors.linkedin && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.linkedin.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input
              id="portfolio"
              {...form.register("portfolio")}
              placeholder="https://portfolio.com"
            />
            {form.formState.errors.portfolio && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.portfolio.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Add any notes about this contact..."
              rows={2}
              className="text-sm"
            />
            {form.formState.errors.notes && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateContactMutation.isPending}
              className="flex-1"
            >
              {updateContactMutation.isPending ? "Updating..." : "Update Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}