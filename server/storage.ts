import {
  users,
  contacts,
  type User,
  type UpsertUser,
  type Contact,
  type InsertContact,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Contact operations
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  searchContacts(query: string): Promise<Contact[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async updateContact(id: number, updateData: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(id: number): Promise<boolean> {
    try {
      await db.delete(contacts).where(eq(contacts.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const allContacts = await db.select().from(contacts);
    const lowerQuery = query.toLowerCase();
    return allContacts.filter(contact =>
      contact.firstName.toLowerCase().includes(lowerQuery) ||
      contact.lastName.toLowerCase().includes(lowerQuery) ||
      contact.role.toLowerCase().includes(lowerQuery) ||
      contact.company.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new DatabaseStorage();
