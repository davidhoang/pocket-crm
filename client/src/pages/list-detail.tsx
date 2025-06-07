import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type List, type Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Mail, Trash2, Users } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import ContactDetailModal from "@/components/contact-detail-modal";

export default function ListDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddContactsOpen, setIsAddContactsOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactDetailOpen, setIsContactDetailOpen] = useState(false);

  const listId = parseInt(id as string);

  const { data: list, isLoading: listLoading } = useQuery<List>({
    queryKey: ["/api/lists", listId],
    enabled: !!listId,
  });

  const { data: listContacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: [`/api/lists/${listId}/contacts`],
    enabled: !!listId,
  });

  const { data: allContacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const addContactsToListMutation = useMutation({
    mutationFn: async (contactIds: number[]) => {
      const promises = contactIds.map(contactId =>
        apiRequest("POST", `/api/lists/${listId}/contacts`, { contactId })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/contacts`] });
      setSelectedContactIds([]);
      setIsAddContactsOpen(false);
      toast({
        title: "Contacts added",
        description: "Selected contacts have been added to the list.",
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
        description: "Failed to add contacts to list.",
        variant: "destructive",
      });
    },
  });

  const removeContactMutation = useMutation({
    mutationFn: (contactId: number) =>
      apiRequest("DELETE", `/api/lists/${listId}/contacts/${contactId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/contacts`] });
      toast({
        title: "Contact removed",
        description: "Contact has been removed from the list.",
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
        description: "Failed to remove contact from list.",
        variant: "destructive",
      });
    },
  });

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || '??';
  };

  // Filter out contacts that are already in the list
  const availableContacts = allContacts.filter(
    contact => !listContacts.some(listContact => listContact.id === contact.id)
  );

  const handleContactSelection = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContactIds(prev => [...prev, contactId]);
    } else {
      setSelectedContactIds(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleAddContacts = () => {
    if (selectedContactIds.length === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact to add.",
        variant: "destructive",
      });
      return;
    }
    addContactsToListMutation.mutate(selectedContactIds);
  };

  if (listLoading) {
    return (
      <>
        {/* Mobile Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-800">Design CRM</h1>
                <p className="text-sm text-slate-600">Loading list...</p>
              </div>
            </div>
          </div>
        </div>

        <main className="pb-20 bg-gray-50 min-h-screen">
          <div className="px-4 py-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-48"></div>
              <div className="h-4 bg-slate-200 rounded w-64"></div>
            </div>
          </div>
        </main>
        
        <BottomNavigation />
      </>
    );
  }

  if (!list) {
    return (
      <>
        {/* Mobile Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-800">Design CRM</h1>
                <p className="text-sm text-slate-600">List not found</p>
              </div>
            </div>
          </div>
        </div>

        <main className="pb-20 bg-gray-50 min-h-screen">
          <div className="px-4 py-4 text-center py-12">
            <h2 className="text-xl font-semibold text-slate-600">List not found</h2>
            <Button onClick={() => setLocation("/lists")} className="mt-4">
              Back to Lists
            </Button>
          </div>
        </main>
        
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">Design CRM</h1>
              <p className="text-sm text-slate-600">{list.name}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="pb-20 bg-gray-50 min-h-screen">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/lists")}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">{list.name}</h2>
              {list.description && (
                <p className="text-slate-600 mt-1">{list.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Users className="w-4 h-4" />
            <span>{listContacts.length} contact{listContacts.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex space-x-2">
            <Dialog open={isAddContactsOpen} onOpenChange={setIsAddContactsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contacts
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Contacts to List</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {availableContacts.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">
                      All contacts are already in this list
                    </p>
                  ) : (
                    availableContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-3 p-2 rounded hover:bg-slate-50">
                        <Checkbox
                          checked={selectedContactIds.includes(contact.id)}
                          onCheckedChange={(checked) => 
                            handleContactSelection(contact.id, !!checked)
                          }
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={contact.profilePhoto || undefined} 
                            alt={`${contact.firstName} ${contact.lastName}`}
                          />
                          <AvatarFallback className="bg-primary text-white text-xs">
                            {getInitials(contact.firstName, contact.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {contact.firstName || ''} {contact.lastName || ''}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {contact.role || ''} at {contact.company || ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {availableContacts.length > 0 && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddContactsOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddContacts}
                      disabled={selectedContactIds.length === 0 || addContactsToListMutation.isPending}
                      className="flex-1"
                    >
                      {addContactsToListMutation.isPending ? "Adding..." : `Add ${selectedContactIds.length}`}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button size="sm" disabled={listContacts.length === 0}>
              <Mail className="w-4 h-4 mr-1" />
              Send List
            </Button>
          </div>
        </div>

        {contactsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : listContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No contacts in this list</h3>
            <p className="text-slate-500 mb-4">Add designers to build your curated list</p>
            <Button onClick={() => setIsAddContactsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {listContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={contact.profilePhoto || undefined} 
                        alt={`${contact.firstName} ${contact.lastName}`}
                      />
                      <AvatarFallback className="bg-primary text-white font-medium">
                        {getInitials(contact.firstName, contact.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {contact.firstName || ''} {contact.lastName || ''}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{contact.role || ''}</p>
                      <p className="text-sm text-slate-500">{contact.company || ''}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        {contact.linkedin && (
                          <a 
                            href={contact.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary text-xs hover:underline"
                          >
                            LinkedIn
                          </a>
                        )}
                        {contact.portfolio && (
                          <a 
                            href={contact.portfolio} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary text-xs hover:underline"
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                      {contact.notes && (
                        <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded p-2">
                          {contact.notes}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContactMutation.mutate(contact.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </main>
      
      <BottomNavigation />
    </>
  );
}