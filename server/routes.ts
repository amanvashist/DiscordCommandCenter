import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, authResponseSchema, insertBotUserSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import { initializeBot } from "./bot";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      isAdmin: boolean;
    };
    authenticated: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "poppy-discord-bot-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (req.session.authenticated) {
      next();
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };
  
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(credentials.username);
      
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      req.session.authenticated = true;
      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin ?? false
      };
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin ?? false
        }
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Failed to logout" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
  
  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    if (req.session.authenticated && req.session.user) {
      res.json({ 
        success: true, 
        user: req.session.user
      });
    } else {
      res.json({ success: false });
    }
  });
  
  // Get all bot users
  app.get("/api/bot-users", requireAuth, async (req, res) => {
    try {
      const botUsers = await storage.getAllBotUsers();
      res.json(botUsers);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Server error" 
      });
    }
  });
  
  // Get a specific bot user
  app.get("/api/bot-users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }
      
      const botUser = await storage.getBotUser(id);
      if (!botUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.json(botUser);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Server error" 
      });
    }
  });
  
  // Create a bot user
  app.post("/api/bot-users", requireAuth, async (req, res) => {
    try {
      const botUserData = insertBotUserSchema.parse(req.body);
      
      // Check if a user with this username already exists
      const existingUser = await storage.getBotUserByUsername(botUserData.username);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "A user with this username already exists" 
        });
      }
      
      const newBotUser = await storage.createBotUser(botUserData);
      res.status(201).json(newBotUser);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Invalid request data" 
      });
    }
  });
  
  // Update a bot user
  app.put("/api/bot-users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }
      
      // Validate request data (partial update allowed)
      const botUserData = insertBotUserSchema.partial().parse(req.body);
      
      // Check if username is being updated and if it already exists
      if (botUserData.username) {
        const existingUser = await storage.getBotUserByUsername(botUserData.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ 
            success: false, 
            message: "A user with this username already exists" 
          });
        }
      }
      
      const updatedBotUser = await storage.updateBotUser(id, botUserData);
      if (!updatedBotUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.json(updatedBotUser);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Invalid request data" 
      });
    }
  });
  
  // Delete a bot user
  app.delete("/api/bot-users/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }
      
      const success = await storage.deleteBotUser(id);
      if (!success) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Server error" 
      });
    }
  });
  
  // Initialize the Discord bot if token is provided
  const discordToken = process.env.DISCORD_TOKEN;
  if (discordToken) {
    try {
      await initializeBot(discordToken, storage);
      console.log("Discord bot initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Discord bot:", error);
    }
  } else {
    console.warn("DISCORD_TOKEN not provided, bot will not be initialized");
  }

  return httpServer;
}
