import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Contact } from "@shared/schema";
import MobileHeader from "@/components/mobile-header";
import ContactCard from "@/components/contact-card";
import AddContactModal from "@/components/add-contact-modal";
import EmailComposerModal from "@/components/email-composer-modal";
import ContactDetailModal from "@/components/contact-detail-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedContactForDetail, setSelectedContactForDetail] = useState<Contact | null>(null);
  const [showContactDetail, setShowContactDetail] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  // Fetch contacts or search results
  const { data: contacts = [], isLoading, refetch } = useQuery<Contact[]>({
    queryKey: searchQuery ? ["/api/contacts/search", { q: searchQuery }] : ["/api/contacts"],
    enabled: isAuthenticated,
  });

  const handleContactSelect = (contactId: number, selected: boolean) => {
    if (selected) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedContacts([]);
  };

  const handleComposeEmail = () => {
    if (selectedContacts.length > 0) {
      setShowEmailModal(true);
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContactForDetail(contact);
    setShowContactDetail(true);
  };

  const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
      <MobileHeader
        contactCount={contacts.length}
        searchVisible={searchVisible}
        searchQuery={searchQuery}
        onSearchToggle={() => setSearchVisible(!searchVisible)}
        onSearchChange={setSearchQuery}
        selectedCount={selectedContacts.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onComposeEmail={handleComposeEmail}
      />

      <main className="pb-20">
        <div className="px-4 py-2 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-500 mb-4">
                {searchQuery ? "No contacts found" : "No contacts yet"}
              </div>
              {!searchQuery && (
                <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
              )}
            </div>
          ) : (
            contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                selected={selectedContacts.includes(contact.id)}
                onSelect={(selected) => handleContactSelect(contact.id, selected)}
                onRefetch={refetch}
                onContactClick={handleContactClick}
              />
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-20 right-4">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-primary hover:bg-blue-700 shadow-lg"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <BottomNavigation />

      <AddContactModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={refetch}
      />

      <EmailComposerModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        selectedContacts={selectedContactsData}
        onSuccess={() => {
          setSelectedContacts([]);
          setShowEmailModal(false);
        }}
      />
    </div>
  );
}
