import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type List, type Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Mail, Trash2 } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import EmailComposerModal from "@/components/email-composer-modal";

export default function Lists() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedListForEmail, setSelectedListForEmail] = useState<List | null>(null);

  const { data: lists = [], isLoading } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });

  // Query to get contact counts for all lists
  const { data: listContactCounts = {} } = useQuery({
    queryKey: ["/api/lists/contact-counts"],
    queryFn: async () => {
      if (!lists.length) return {};
      const counts: Record<number, number> = {};
      await Promise.all(
        lists.map(async (list) => {
          try {
            const response = await fetch(`/api/lists/${list.id}/contacts`);
            if (response.ok) {
              const contacts = await response.json();
              counts[list.id] = contacts.length;
            } else {
              counts[list.id] = 0;
            }
          } catch {
            counts[list.id] = 0;
          }
        })
      );
      return counts;
    },
    enabled: lists.length > 0,
  });

  const { data: selectedListContacts = [] } = useQuery<Contact[]>({
    queryKey: [`/api/lists/${selectedListForEmail?.id}/contacts`],
    enabled: !!selectedListForEmail?.id,
  });

  const createListMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      apiRequest("POST", "/api/lists", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setNewListName("");
      setNewListDescription("");
      setIsCreateDialogOpen(false);
      toast({
        title: "List created",
        description: "Your new designer list has been created.",
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
        description: "Failed to create list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/lists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      toast({
        title: "List deleted",
        description: "The list has been deleted successfully.",
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
        description: "Failed to delete list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendList = (list: List) => {
    setSelectedListForEmail(list);
    setIsEmailModalOpen(true);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your list.",
        variant: "destructive",
      });
      return;
    }

    createListMutation.mutate({
      name: newListName.trim(),
      description: newListDescription.trim() || undefined,
    });
  };

  const handleDeleteList = (id: number) => {
    if (confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      deleteListMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
        {/* Mobile Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-800">Design CRM</h1>
                <p className="text-sm text-slate-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>

        <main className="pb-20">
          <div className="px-4 py-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-48"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">Design CRM</h1>
              <p className="text-sm text-slate-600">{(lists as List[]).length} lists</p>
            </div>
          </div>
        </div>
      </div>

      <main className="pb-20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-800">Designer Lists</h2>
              <p className="text-slate-600 text-sm">Organize and manage curated lists of design talent</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 shrink-0 ml-3">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New List</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New List</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">List Name</label>
                      <Input
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="e.g., Senior UX Designers"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description (Optional)</label>
                      <Textarea
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        placeholder="Brief description of this list..."
                        rows={3}
                        className="mt-1 resize-none"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={() => setIsCreateDialogOpen(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateList}
                        disabled={createListMutation.isPending}
                        className="flex-1"
                      >
                        {createListMutation.isPending ? "Creating..." : "Create List"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {(lists as List[]).length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No lists yet</h3>
                <p className="text-slate-500 mb-4">Create your first curated list of designers</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First List
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {(lists as List[]).map((list: List) => (
                  <Card key={list.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight pr-2">{list.name}</CardTitle>
                          {list.description && (
                            <CardDescription className="mt-1 text-sm line-clamp-2">
                              {list.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteList(list.id)}
                          className="text-slate-400 hover:text-red-600 p-1 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Users className="w-4 h-4" />
                          <span>{listContactCounts[list.id] || 0} contacts</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setLocation(`/lists/${list.id}`)}
                            className="text-xs px-3"
                          >
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleSendList(list)}
                            className="text-xs px-3"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>
      </main>
      
      <BottomNavigation />
      
      {selectedListForEmail && (
        <EmailComposerModal
          open={isEmailModalOpen}
          onOpenChange={setIsEmailModalOpen}
          selectedContacts={selectedListContacts}
          listId={selectedListForEmail.id}
          listName={selectedListForEmail.name}
          onSuccess={() => {
            setIsEmailModalOpen(false);
            setSelectedListForEmail(null);
          }}
        />
      )}
    </div>
  );
}