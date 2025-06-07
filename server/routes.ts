import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, type Contact } from "@shared/schema";
import { sendEmail } from "./sendgrid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all contacts
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Search contacts
  app.get("/api/contacts/search", async (req, res) => {
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

  // Get single contact
  app.get("/api/contacts/:id", async (req, res) => {
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

  // Create contact
  app.post("/api/contacts", async (req, res) => {
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

  // Update contact
  app.put("/api/contacts/:id", async (req, res) => {
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

  // Delete contact
  app.delete("/api/contacts/:id", async (req, res) => {
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

  // Send email with selected contacts
  app.post("/api/send-email", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
