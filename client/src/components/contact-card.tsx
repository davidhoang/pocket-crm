import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { type Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactCardProps {
  contact: Contact;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onRefetch: () => void;
}

export default function ContactCard({ contact, selected, onSelect, onRefetch }: ContactCardProps) {
  const { toast } = useToast();

  const deleteContactMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/contacts/${contact.id}`),
    onSuccess: () => {
      toast({
        title: "Contact deleted",
        description: "Contact has been successfully deleted.",
      });
      onRefetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteContactMutation.mutate();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(!!checked)}
          />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 truncate">
              {contact.firstName} {contact.lastName}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-slate-600 mt-1">{contact.role}</p>
          <p className="text-sm text-slate-500">{contact.company}</p>
          <div className="flex items-center space-x-4 mt-2">
            {contact.linkedin && (
              <a 
                href={contact.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary text-xs hover:underline flex items-center"
              >
                LinkedIn
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
            {contact.portfolio && (
              <a 
                href={contact.portfolio} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary text-xs hover:underline flex items-center"
              >
                Portfolio
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
          {contact.notes && (
            <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded p-2">
              {contact.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
