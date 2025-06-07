import {
  users,
  contacts,
  lists,
  listContacts,
  type User,
  type UpsertUser,
  type Contact,
  type InsertContact,
  type List,
  type InsertList,
  type ListContact,
  type InsertListContact,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
  
  // List operations
  getLists(): Promise<List[]>;
  getList(id: number): Promise<List | undefined>;
  createList(list: InsertList): Promise<List>;
  updateList(id: number, list: Partial<InsertList>): Promise<List | undefined>;
  deleteList(id: number): Promise<boolean>;
  
  // List contact operations
  getListContacts(listId: number): Promise<Contact[]>;
  addContactToList(listContact: InsertListContact): Promise<ListContact>;
  removeContactFromList(listId: number, contactId: number): Promise<boolean>;
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

  // List operations
  async getLists(): Promise<List[]> {
    const allLists = await db.select().from(lists);
    return allLists;
  }

  async getList(id: number): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.id, id));
    return list || undefined;
  }

  async createList(insertList: InsertList): Promise<List> {
    const [list] = await db
      .insert(lists)
      .values(insertList)
      .returning();
    return list;
  }

  async updateList(id: number, updateData: Partial<InsertList>): Promise<List | undefined> {
    const [list] = await db
      .update(lists)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(lists.id, id))
      .returning();
    return list || undefined;
  }

  async deleteList(id: number): Promise<boolean> {
    try {
      await db.delete(lists).where(eq(lists.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // List contact operations
  async getListContacts(listId: number): Promise<Contact[]> {
    const listContactsData = await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        role: contacts.role,
        company: contacts.company,
        linkedin: contacts.linkedin,
        portfolio: contacts.portfolio,
        notes: contacts.notes,
        profilePhoto: contacts.profilePhoto,
      })
      .from(listContacts)
      .leftJoin(contacts, eq(listContacts.contactId, contacts.id))
      .where(eq(listContacts.listId, listId));
    
    return listContactsData.filter(contact => contact.id !== null) as Contact[];
  }

  async addContactToList(listContact: InsertListContact): Promise<ListContact> {
    const [newListContact] = await db
      .insert(listContacts)
      .values(listContact)
      .returning();
    return newListContact;
  }

  async removeContactFromList(listId: number, contactId: number): Promise<boolean> {
    try {
      await db
        .delete(listContacts)
        .where(
          and(
            eq(listContacts.listId, listId),
            eq(listContacts.contactId, contactId)
          )
        );
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
