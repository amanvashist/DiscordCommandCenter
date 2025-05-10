import { users, type User, type InsertUser, botUsers, type BotUser, type InsertBotUser } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

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

export class FileSystemStorage implements IStorage {
  private usersDir = path.join(process.cwd(), 'configs/users');
  private botUsersDir = path.join(process.cwd(), 'configs/bot-users');
  private userIdCounter: number = 1;
  private botUserIdCounter: number = 1;

  constructor() {
    // Create directories if they don't exist
    this.ensureDirectoryExists(this.usersDir);
    this.ensureDirectoryExists(this.botUsersDir);
    
    // Initialize ID counters based on existing files
    this.initializeCounters();
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private initializeCounters(): void {
    // Find the highest ID for users
    try {
      const userFiles = fs.readdirSync(this.usersDir);
      for (const file of userFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.usersDir, file);
          const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (userData.id && userData.id >= this.userIdCounter) {
            this.userIdCounter = userData.id + 1;
          }
        }
      }
    } catch (error) {
      console.error('Error initializing user ID counter:', error);
    }

    // Find the highest ID for bot users
    try {
      const botUserFiles = fs.readdirSync(this.botUsersDir);
      for (const file of botUserFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.botUsersDir, file);
          const botUserData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (botUserData.id && botUserData.id >= this.botUserIdCounter) {
            this.botUserIdCounter = botUserData.id + 1;
          }
        }
      }
    } catch (error) {
      console.error('Error initializing bot user ID counter:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const userFiles = fs.readdirSync(this.usersDir);
      for (const file of userFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.usersDir, file);
          const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (userData.id === id) {
            // Ensure all required fields are present
            if (userData.isAdmin === undefined) {
              userData.isAdmin = false;
            }
            return userData as User;
          }
        }
      }
    } catch (error) {
      console.error('Error getting user by ID:', error);
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const filePath = path.join(this.usersDir, `${username}.json`);
      if (fs.existsSync(filePath)) {
        const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Ensure all required fields are present
        if (userData.isAdmin === undefined) {
          userData.isAdmin = false;
        }
        return userData as User;
      }
    } catch (error) {
      console.error('Error getting user by username:', error);
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    // Ensure required fields have values
    const userWithDefaults = {
      ...insertUser,
      isAdmin: insertUser.isAdmin ?? false
    };
    
    const user: User = { ...userWithDefaults, id };
    
    try {
      const filePath = path.join(this.usersDir, `${user.username}.json`);
      fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
    
    return user;
  }
  
  // Bot user methods
  async getBotUser(id: number): Promise<BotUser | undefined> {
    try {
      const botUserFiles = fs.readdirSync(this.botUsersDir);
      for (const file of botUserFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.botUsersDir, file);
          const botUserData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (botUserData.id === id) {
            // Ensure all required fields have values
            const botUserWithDefaults = {
              boardId: botUserData.boardId ?? "",
              chatId: botUserData.chatId ?? "",
              model: botUserData.model ?? "claude-3-7-sonnet-20250219",
              temperature: botUserData.temperature ?? "0.7",
              maxTokens: botUserData.maxTokens ?? 1024,
              isActive: botUserData.isActive ?? true,
              role: botUserData.role ?? "User",
              canUseAsk: botUserData.canUseAsk ?? true,
              canUseSummary: botUserData.canUseSummary ?? true,
              ...botUserData
            };
            return botUserWithDefaults as BotUser;
          }
        }
      }
    } catch (error) {
      console.error('Error getting bot user by ID:', error);
    }
    return undefined;
  }
  
  async getBotUserByUsername(username: string): Promise<BotUser | undefined> {
    try {
      const filePath = path.join(this.botUsersDir, `${username}.json`);
      if (fs.existsSync(filePath)) {
        const botUserData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Ensure all required fields have values
        const botUserWithDefaults = {
          boardId: botUserData.boardId ?? "",
          chatId: botUserData.chatId ?? "",
          model: botUserData.model ?? "claude-3-7-sonnet-20250219",
          temperature: botUserData.temperature ?? "0.7",
          maxTokens: botUserData.maxTokens ?? 1024,
          isActive: botUserData.isActive ?? true,
          role: botUserData.role ?? "User",
          canUseAsk: botUserData.canUseAsk ?? true,
          canUseSummary: botUserData.canUseSummary ?? true,
          ...botUserData
        };
        
        return botUserWithDefaults as BotUser;
      }
    } catch (error) {
      console.error('Error getting bot user by username:', error);
    }
    return undefined;
  }
  
  async getAllBotUsers(): Promise<BotUser[]> {
    const botUsers: BotUser[] = [];
    
    try {
      const botUserFiles = fs.readdirSync(this.botUsersDir);
      for (const file of botUserFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.botUsersDir, file);
          const botUserData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Ensure all required fields have values
          const botUserWithDefaults = {
            boardId: botUserData.boardId ?? "",
            chatId: botUserData.chatId ?? "",
            model: botUserData.model ?? "claude-3-7-sonnet-20250219",
            temperature: botUserData.temperature ?? "0.7",
            maxTokens: botUserData.maxTokens ?? 1024,
            isActive: botUserData.isActive ?? true,
            role: botUserData.role ?? "User",
            canUseAsk: botUserData.canUseAsk ?? true,
            canUseSummary: botUserData.canUseSummary ?? true,
            ...botUserData
          };
          
          botUsers.push(botUserWithDefaults as BotUser);
        }
      }
    } catch (error) {
      console.error('Error getting all bot users:', error);
    }
    
    return botUsers;
  }
  
  async createBotUser(insertBotUser: InsertBotUser): Promise<BotUser> {
    const id = this.botUserIdCounter++;
    
    // Ensure all required fields have values
    const botUserWithDefaults = {
      model: insertBotUser.model ?? "poppy-v1",
      temperature: insertBotUser.temperature ?? "0.7",
      maxTokens: insertBotUser.maxTokens ?? 1024,
      isActive: insertBotUser.isActive ?? true,
      role: insertBotUser.role ?? "User",
      canUseAsk: insertBotUser.canUseAsk ?? true,
      canUseSummary: insertBotUser.canUseSummary ?? true,
      ...insertBotUser
    };
    
    const botUser: BotUser = { ...botUserWithDefaults, id };
    
    try {
      const filePath = path.join(this.botUsersDir, `${botUser.username}.json`);
      fs.writeFileSync(filePath, JSON.stringify(botUser, null, 2));
    } catch (error) {
      console.error('Error creating bot user:', error);
      throw new Error('Failed to create bot user');
    }
    
    return botUser;
  }
  
  async updateBotUser(id: number, updates: Partial<InsertBotUser>): Promise<BotUser | undefined> {
    try {
      // Find the bot user
      const existingUser = await this.getBotUser(id);
      if (!existingUser) return undefined;
      
      // If username is being updated, we need to rename the file
      const oldFilePath = path.join(this.botUsersDir, `${existingUser.username}.json`);
      
      // Ensure all required fields have values when updating
      const updateWithDefaults = {
        model: updates.model ?? existingUser.model ?? "poppy-v1",
        temperature: updates.temperature ?? existingUser.temperature ?? "0.7",
        maxTokens: updates.maxTokens ?? existingUser.maxTokens ?? 1024,
        isActive: updates.isActive ?? existingUser.isActive ?? true,
        role: updates.role ?? existingUser.role ?? "User",
        canUseAsk: updates.canUseAsk ?? existingUser.canUseAsk ?? true,
        canUseSummary: updates.canUseSummary ?? existingUser.canUseSummary ?? true,
        ...updates
      };
      
      // Update the user data
      const updatedUser: BotUser = { ...existingUser, ...updateWithDefaults };
      
      if (updates.username && updates.username !== existingUser.username) {
        // Delete old file
        fs.unlinkSync(oldFilePath);
        
        // Write to new file
        const newFilePath = path.join(this.botUsersDir, `${updates.username}.json`);
        fs.writeFileSync(newFilePath, JSON.stringify(updatedUser, null, 2));
      } else {
        // Just update the existing file
        fs.writeFileSync(oldFilePath, JSON.stringify(updatedUser, null, 2));
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating bot user:', error);
      return undefined;
    }
  }
  
  async deleteBotUser(id: number): Promise<boolean> {
    try {
      const botUser = await this.getBotUser(id);
      if (!botUser) return false;
      
      const filePath = path.join(this.botUsersDir, `${botUser.username}.json`);
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting bot user:', error);
      return false;
    }
  }
}

export const storage = new FileSystemStorage();
