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
      resave: true, // Set to true to ensure session is saved on every request
      saveUninitialized: true, // Set to true to create session object for all requests
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    console.log("Auth check:", {
      authenticated: req.session.authenticated,
      user: req.session.user
    });
    
    if (req.session.authenticated && req.session.user) {
      next();
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  };
  
  // Admin middleware - simplified for Render compatibility
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    console.log("Admin check:", {
      authenticated: req.session.authenticated,
      user: req.session.user,
      isAdmin: req.session.user?.isAdmin,
      env: {
        adminUsername: process.env.ADMIN_USERNAME || 'admin',
        nodeEnv: process.env.NODE_ENV
      }
    });
    
    // DIRECT FIX: If username matches ADMIN_USERNAME env var, grant admin access
    // This is specifically for Render deployment where file storage might be ephemeral
    if (process.env.ADMIN_USERNAME && 
        req.session.authenticated && 
        req.session.user && 
        req.session.user.username === process.env.ADMIN_USERNAME) {
      console.log("Admin access granted via environment variable override");
      
      // Force-set isAdmin to true in the session
      if (!req.session.user.isAdmin) {
        req.session.user.isAdmin = true;
        req.session.save();
      }
      
      next();
      return;
    }
    
    // Standard admin check
    if (req.session.authenticated && req.session.user) {
      // Check all possible ways isAdmin could be true
      const isAdminValue = req.session.user.isAdmin;
      
      // Using a more type-safe approach
      const isAdmin = 
        // Boolean true
        isAdminValue === true || 
        // String 'true'
        (typeof isAdminValue === 'string' && (isAdminValue as string).toLowerCase() === 'true') ||
        // Number 1 
        (typeof isAdminValue === 'number' && isAdminValue === 1) ||
        // String '1'
        (typeof isAdminValue === 'string' && isAdminValue === '1');
      
      if (isAdmin) {
        console.log("Admin access granted");
        next();
        return;
      }
    }
    
    console.log("Admin access denied");
    res.status(403).json({ success: false, message: "Admin access required" });
  };
  
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt:", req.body);
      const credentials = loginSchema.parse(req.body);
      let user = await storage.getUserByUsername(credentials.username);
      
      console.log("Found user:", user);
      
      if (!user || user.password !== credentials.password) {
        console.log("Invalid credentials");
        return res.status(401).json({ 
          success: false, 
          message: "Invalid username or password" 
        });
      }
      
      // RENDER FIX: Special case for env-defined admin
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      if (credentials.username === adminUsername) {
        console.log("Admin user login detected");
        // Force admin rights for the admin user (important for Render)
        user.isAdmin = true;
      }
      
      // Ensure isAdmin is a boolean
      console.log("Raw isAdmin value:", user.isAdmin, "type:", typeof user.isAdmin);
      
      // Normalize isAdmin value to boolean
      const isAdmin = (() => {
        // Special case for admin username (from env)
        if (user.username === adminUsername) {
          return true;
        }
        
        // If it's explicitly a boolean true
        if (user.isAdmin === true) {
          return true;
        }
        
        // If it's a string 'true' (case insensitive)
        if (typeof user.isAdmin === 'string') {
          return (user.isAdmin as string).toLowerCase() === 'true';
        }
        
        // Default to false for all other values
        return false;
      })();
      
      console.log("Final isAdmin value:", isAdmin);
      
      // Direct method - set session values and respond
      req.session.authenticated = true;
      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: isAdmin
      };
      
      console.log("Session data set:", {
        authenticated: req.session.authenticated,
        user: req.session.user
      });
      
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
        } else {
          console.log("Session saved successfully");
        }
      });
      
      // Respond immediately
      return res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          isAdmin: isAdmin
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });
  
  // TEMPORARY: Direct admin access route for Render deployment
  app.post("/api/auth/admin-login", async (req, res) => {
    console.log("Direct admin login attempted");
    
    // Only allow in production or if ADMIN_PASSWORD is set
    if (process.env.NODE_ENV !== 'production' && !process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ 
        success: false,
        message: "This endpoint is only available in production"
      });
    }
    
    // Check password if provided
    if (process.env.ADMIN_PASSWORD && 
        (!req.body.password || req.body.password !== process.env.ADMIN_PASSWORD)) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin password"
      });
    }
    
    // Set session data with admin privileges
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    req.session.authenticated = true;
    req.session.user = {
      id: 1,
      username: adminUsername,
      isAdmin: true
    };
    
    console.log("Direct admin access granted, setting session:", req.session);
    
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, message: "Session error" });
      }
      
      res.json({ 
        success: true, 
        user: {
          id: 1,
          username: adminUsername,
          isAdmin: true
        }
      });
    });
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
    console.log("Auth status check request received");
    console.log("Session ID:", req.sessionID);
    console.log("Cookie:", req.headers.cookie);
    
    // For security reasons, log only necessary session info
    console.log("Auth status:", {
      authenticated: !!req.session.authenticated,
      hasUser: !!req.session.user,
      username: req.session.user?.username
    });
    
    if (req.session.authenticated === true && req.session.user) {
      console.log("User is authenticated, sending success response");
      return res.json({ 
        success: true, 
        user: {
          id: req.session.user.id,
          username: req.session.user.username,
          isAdmin: !!req.session.user.isAdmin
        }
      });
    } else {
      console.log("User is not authenticated");
      return res.json({ success: false });
    }
  });
  
  // Get all bot users
  app.get("/api/bot-users", requireAdmin, async (req, res) => {
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
  app.get("/api/bot-users/:id", requireAdmin, async (req, res) => {
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
  app.post("/api/bot-users", requireAdmin, async (req, res) => {
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
  app.put("/api/bot-users/:id", requireAdmin, async (req, res) => {
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
  app.delete("/api/bot-users/:id", requireAdmin, async (req, res) => {
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
