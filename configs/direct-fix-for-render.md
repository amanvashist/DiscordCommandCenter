# Direct Fix for Render Deployment

Since Render is not recognizing the admin user correctly despite our environment variable changes, here's a direct code fix you can apply to make the admin authentication work:

## Option 1: Force Admin Access Based on Environment Variables

Add this code at the beginning of your `requireAdmin` middleware in `server/routes.ts`:

```typescript
// Admin middleware
const requireAdmin = (req: Request, res: Response, next: Function) => {
  // DIRECT FIX: If the environment has ADMIN_USERNAME and we're in production,
  // treat the authenticated user as admin if username matches
  if (process.env.ADMIN_USERNAME && 
      process.env.NODE_ENV === 'production' && 
      req.session.authenticated && 
      req.session.user && 
      req.session.user.username === process.env.ADMIN_USERNAME) {
    console.log("Admin access granted via environment variable override");
    next();
    return;
  }

  // Rest of your existing admin check code...
};
```

## Option 2: Hard-Code Admin Account for Testing

If you're just testing and need immediate access, you can add this route:

```typescript
// TEMPORARY: Direct admin access route for testing
app.post("/api/auth/admin-login", async (req, res) => {
  // Set session data with admin privileges
  req.session.authenticated = true;
  req.session.user = {
    id: 1,
    username: 'admin',
    isAdmin: true
  };
  
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.status(500).json({ success: false, message: "Session error" });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: 1,
        username: 'admin',
        isAdmin: true
      }
    });
  });
});
```

## Option 3: Directly Modify routes.ts

Replace your entire `requireAdmin` middleware with this version:

```typescript
// Admin middleware - simplified for Render compatibility
const requireAdmin = (req: Request, res: Response, next: Function) => {
  console.log("Admin check:", {
    authenticated: req.session.authenticated,
    user: req.session.user
  });
  
  // Grant access if session is authenticated and:
  // 1. User is admin OR
  // 2. Username matches ADMIN_USERNAME env var
  const isAdmin = 
    req.session.authenticated && 
    req.session.user && 
    (req.session.user.isAdmin === true || 
     (process.env.ADMIN_USERNAME && req.session.user.username === process.env.ADMIN_USERNAME));
  
  if (isAdmin) {
    console.log("Admin access granted");
    // Force-set isAdmin to true in the session
    if (req.session.user && !req.session.user.isAdmin) {
      req.session.user.isAdmin = true;
      req.session.save();
    }
    next();
    return;
  }
  
  console.log("Admin access denied");
  res.status(403).json({ success: false, message: "Admin access required" });
};
```

Choose the option that best fits your immediate needs. Option 3 is the most robust solution that ensures admin access works properly on Render.