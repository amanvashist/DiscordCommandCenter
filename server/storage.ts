import { users, type User, type InsertUser, botUsers, type BotUser, type InsertBotUser } from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bot user management
  getBotUser(id: number): Promise<BotUser | undefined>;
  getBotUserByUsername(username: string): Promise<BotUser | undefined>;
  getAllBotUsers(): Promise<BotUser[]>;
  createBotUser(botUser: InsertBotUser): Promise<BotUser>;
  updateBotUser(id: number, botUser: Partial<InsertBotUser>): Promise<BotUser | undefined>;
  deleteBotUser(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private botUsers: Map<number, BotUser>;
  private userCurrentId: number;
  private botUserCurrentId: number;

  constructor() {
    this.users = new Map();
    this.botUsers = new Map();
    this.userCurrentId = 1;
    this.botUserCurrentId = 1;
    
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      isAdmin: true
    });
    
    // Add some sample bot users
    this.createBotUser({
      username: "JohnDoe",
      apiKey: "poppy-api-key-1",
      model: "poppy-v1",
      temperature: "0.7",
      maxTokens: 1024,
      isActive: true,
      role: "Admin",
      canUseAsk: true,
      canUseSummary: true
    });
    
    this.createBotUser({
      username: "AliceSmith",
      apiKey: "poppy-api-key-2",
      model: "poppy-v2",
      temperature: "0.5",
      maxTokens: 2048,
      isActive: true,
      role: "Moderator",
      canUseAsk: true,
      canUseSummary: true
    });
    
    this.createBotUser({
      username: "BobJohnson",
      apiKey: "poppy-api-key-3",
      model: "poppy-v1",
      temperature: "0.8",
      maxTokens: 512,
      isActive: false,
      role: "User",
      canUseAsk: true,
      canUseSummary: false
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Bot user methods
  async getBotUser(id: number): Promise<BotUser | undefined> {
    return this.botUsers.get(id);
  }
  
  async getBotUserByUsername(username: string): Promise<BotUser | undefined> {
    return Array.from(this.botUsers.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getAllBotUsers(): Promise<BotUser[]> {
    return Array.from(this.botUsers.values());
  }
  
  async createBotUser(insertBotUser: InsertBotUser): Promise<BotUser> {
    const id = this.botUserCurrentId++;
    const botUser: BotUser = { ...insertBotUser, id };
    this.botUsers.set(id, botUser);
    return botUser;
  }
  
  async updateBotUser(id: number, botUser: Partial<InsertBotUser>): Promise<BotUser | undefined> {
    const existingUser = this.botUsers.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: BotUser = { ...existingUser, ...botUser };
    this.botUsers.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteBotUser(id: number): Promise<boolean> {
    return this.botUsers.delete(id);
  }
}

export const storage = new MemStorage();
