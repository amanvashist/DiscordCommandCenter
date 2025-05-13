# Deploying the Discord Bot with Poppy AI Integration to Render

This guide explains how to deploy the Discord bot with Poppy AI integration to Render.

## Setting Up Environment Variables

When deploying to Render, you need to set up these environment variables:

### Required Environment Variables

- `DISCORD_TOKEN`: Your Discord bot token
- `PASSPHRASE`: The passphrase for generating authentication tokens (can be any secure string you choose)
- `SESSION_SECRET`: The secret for securing session cookies (can be any secure string)

### Admin Authentication Variables

To ensure you always have admin access, even with Render's ephemeral filesystem, set these variables:

- `ADMIN_USERNAME`: The username for the admin account (default is "admin" if not set)
- `ADMIN_PASSWORD`: The password for the admin account (default is "admin123" if not set)

### Optional Environment Variables

- `PORT`: The port the web server runs on (defaults to 5000)

## Steps to Deploy on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Configure the deployment with the following settings:
   - **Name**: Your service name (e.g., "poppy-discord-bot")
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node dist/server/index.js`
   - **Environment Variables**: Add all the required environment variables

## Accessing the Admin Interface

Once deployed, you can access the admin interface at your Render URL:

```
https://your-app-name.onrender.com
```

Use the admin credentials you set in the environment variables to log in.

## Troubleshooting

If you encounter issues with the admin account:

1. Verify your environment variables are set correctly on Render
2. Check the Render logs for any initialization errors
3. Make sure you're using the correct admin username and password specified in your environment variables

## File Storage Considerations

Since Render uses an ephemeral filesystem on some plans, user configurations added through the web interface will be lost when the service restarts or redeploys. To ensure your Discord bot configurations persist:

1. Use the admin interface to set up initial configurations
2. Export and save your configurations if you need to make changes to the code that require redeployment
3. After redeployment, import your saved configurations

Alternatively, consider upgrading to a Render plan with persistent disk storage.