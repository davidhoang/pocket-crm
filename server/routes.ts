import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertListSchema, insertListContactSchema, type Contact } from "@shared/schema";
import { sendEmail } from "./sendgrid";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all contacts (protected)
  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Search contacts (protected)
  app.get("/api/contacts/search", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const contacts = await storage.searchContacts(query);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to search contacts" });
    }
  });

  // Get single contact (protected)
  app.get("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  // Create contact (protected)
  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid contact data", details: error });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  // Update contact (protected)
  app.put("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, validatedData);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid contact data", details: error });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Delete contact (protected)
  app.delete("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContact(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // List routes
  app.get("/api/lists", isAuthenticated, async (req, res) => {
    try {
      const lists = await storage.getLists();
      res.json(lists);
    } catch (error) {
      console.error("Error fetching lists:", error);
      res.status(500).json({ message: "Failed to fetch lists" });
    }
  });

  app.post("/api/lists", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertListSchema.parse(req.body);
      const list = await storage.createList(validatedData);
      res.status(201).json(list);
    } catch (error) {
      console.error("Error creating list:", error);
      res.status(400).json({ message: "Invalid list data" });
    }
  });

  app.get("/api/lists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getList(id);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      res.json(list);
    } catch (error) {
      console.error("Error fetching list:", error);
      res.status(500).json({ message: "Failed to fetch list" });
    }
  });

  // Get contacts in a specific list
  app.get("/api/lists/:id/contacts", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contacts = await storage.getListContacts(id);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching list contacts:", error);
      res.status(500).json({ message: "Failed to fetch list contacts" });
    }
  });

  app.put("/api/lists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertListSchema.parse(req.body);
      const list = await storage.updateList(id, validatedData);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      res.json(list);
    } catch (error) {
      console.error("Error updating list:", error);
      res.status(400).json({ message: "Invalid list data" });
    }
  });

  app.delete("/api/lists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteList(id);
      if (!success) {
        return res.status(404).json({ message: "List not found" });
      }
      res.json({ message: "List deleted successfully" });
    } catch (error) {
      console.error("Error deleting list:", error);
      res.status(500).json({ message: "Failed to delete list" });
    }
  });

  // List contact routes
  app.get("/api/lists/:id/contacts", isAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const contacts = await storage.getListContacts(listId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching list contacts:", error);
      res.status(500).json({ message: "Failed to fetch list contacts" });
    }
  });

  app.post("/api/lists/:id/contacts", isAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const { contactId } = req.body;
      const validatedData = insertListContactSchema.parse({ listId, contactId });
      const listContact = await storage.addContactToList(validatedData);
      res.status(201).json(listContact);
    } catch (error) {
      console.error("Error adding contact to list:", error);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.delete("/api/lists/:listId/contacts/:contactId", isAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.listId);
      const contactId = parseInt(req.params.contactId);
      const success = await storage.removeContactFromList(listId, contactId);
      if (!success) {
        return res.status(404).json({ message: "Contact not found in list" });
      }
      res.json({ message: "Contact removed from list successfully" });
    } catch (error) {
      console.error("Error removing contact from list:", error);
      res.status(500).json({ message: "Failed to remove contact from list" });
    }
  });

  // Send email with selected contacts (protected)
  app.post("/api/send-email", isAuthenticated, async (req, res) => {
    try {
      const { to, subject, message, contactIds, from } = req.body;
      
      if (!to || !subject || !message || !Array.isArray(contactIds)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get selected contacts
      const contacts: Contact[] = [];
      for (const id of contactIds) {
        const contact = await storage.getContact(parseInt(id));
        if (contact) {
          contacts.push(contact);
        }
      }

      // Build contact list for email
      const contactList = contacts.map(contact => {
        const portfolioLink = contact.portfolio ? ` | Portfolio: ${contact.portfolio}` : '';
        const linkedinLink = contact.linkedin ? ` | LinkedIn: ${contact.linkedin}` : '';
        return `• ${contact.firstName} ${contact.lastName} - ${contact.role} at ${contact.company}${linkedinLink}${portfolioLink}`;
      }).join('\n');

      const emailText = `${message}\n\nCurated Design Talent:\n\n${contactList}`;
      const emailHtml = `
        <p>${message.replace(/\n/g, '<br>')}</p>
        <h3>Curated Design Talent:</h3>
        <ul>
          ${contacts.map(contact => {
            const portfolioLink = contact.portfolio ? ` | <a href="${contact.portfolio}">Portfolio</a>` : '';
            const linkedinLink = contact.linkedin ? ` | <a href="${contact.linkedin}">LinkedIn</a>` : '';
            return `<li><strong>${contact.firstName} ${contact.lastName}</strong> - ${contact.role} at ${contact.company}${linkedinLink}${portfolioLink}</li>`;
          }).join('')}
        </ul>
      `;

      const success = await sendEmail({
        to,
        from: from || process.env.FROM_EMAIL || 'noreply@designcrm.com',
        subject,
        text: emailText,
        html: emailHtml
      });

      if (success) {
        res.json({ message: "Email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Send list via email
  app.post("/api/lists/:id/send", isAuthenticated, async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const { to, from, subject, message } = req.body;
      
      if (!to || !from || !subject) {
        return res.status(400).json({ message: "Missing required fields: to, from, subject" });
      }

      // Get list and contacts
      const list = await storage.getList(listId);
      const contacts = await storage.getListContacts(listId);
      
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }

      // Generate email content
      const contactsHtml = contacts.map(contact => `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f8fafc;">
          <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: 600;">
            ${contact.firstName} ${contact.lastName}
          </h3>
          <p style="margin: 4px 0; color: #475569; font-size: 14px;">
            <strong>Role:</strong> ${contact.role || 'Not specified'}
          </p>
          <p style="margin: 4px 0; color: #475569; font-size: 14px;">
            <strong>Company:</strong> ${contact.company || 'Not specified'}
          </p>
          ${contact.linkedin ? `
            <p style="margin: 4px 0;">
              <a href="${contact.linkedin}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">LinkedIn Profile</a>
            </p>
          ` : ''}
          ${contact.portfolio ? `
            <p style="margin: 4px 0;">
              <a href="${contact.portfolio}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Portfolio</a>
            </p>
          ` : ''}
          ${contact.notes ? `
            <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px; font-style: italic;">
              ${contact.notes}
            </p>
          ` : ''}
        </div>
      `).join('');

      const htmlContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h1 style="color: #1e293b; margin-bottom: 16px;">${list.name}</h1>
          ${list.description ? `<p style="color: #475569; margin-bottom: 24px;">${list.description}</p>` : ''}
          ${message ? `<p style="color: #374151; margin-bottom: 24px;">${message}</p>` : ''}
          
          <h2 style="color: #1e293b; margin-bottom: 16px; font-size: 18px;">Design Talent (${contacts.length} contacts)</h2>
          ${contactsHtml}
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              Sent from Design CRM
            </p>
          </div>
        </div>
      `;

      const textContent = `
${list.name}
${list.description ? `${list.description}\n` : ''}
${message ? `${message}\n` : ''}

Design Talent (${contacts.length} contacts):

${contacts.map(contact => `
${contact.firstName} ${contact.lastName}
Role: ${contact.role || 'Not specified'}
Company: ${contact.company || 'Not specified'}
${contact.linkedin ? `LinkedIn: ${contact.linkedin}` : ''}
${contact.portfolio ? `Portfolio: ${contact.portfolio}` : ''}
${contact.notes ? `Notes: ${contact.notes}` : ''}
---
`).join('')}

Sent from Design CRM
      `;

      const success = await sendEmail({
        to,
        from,
        subject,
        html: htmlContent,
        text: textContent
      });

      if (success) {
        res.json({ message: "List sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Error sending list:", error);
      res.status(500).json({ message: "Failed to send list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
