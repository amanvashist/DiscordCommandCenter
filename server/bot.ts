import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { IStorage } from './storage';

// Configure API request function
async function callPoppyAPI(prompt: string, userConfig: any) {
  try {
    const apiKey = userConfig.apiKey;
    if (!apiKey) {
      throw new Error('API key not found for this user');
    }

    const response = await fetch('https://api.poppy.ai/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: userConfig.model || 'poppy-v1',
        prompt: prompt,
        temperature: parseFloat(userConfig.temperature) || 0.7,
        max_tokens: userConfig.maxTokens || 1024
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Poppy API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].text;
  } catch (error) {
    console.error('Error calling Poppy API:', error);
    throw error;
  }
}

export async function initializeBot(token: string, storage: IStorage) {
  // Create a new client instance
  const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ] 
  });
  
  // Create slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName('ask')
      .setDescription('Ask a question to Poppy AI')
      .addStringOption(option =>
        option.setName('question')
          .setDescription('Your question to ask Poppy AI')
          .setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('summary')
      .setDescription('Summarize a thread')
      .addStringOption(option =>
        option.setName('thread')
          .setDescription('The thread to summarize')
          .setRequired(true))
  ];
  
  // Register slash commands
  const rest = new REST().setToken(token);
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    client.once(Events.ClientReady, async (readyClient) => {
      console.log(`Ready! Logged in as ${readyClient.user.tag}`);
      
      // Register commands to all guilds the bot is in
      const guilds = readyClient.guilds.cache.map(guild => guild.id);
      
      for (const guildId of guilds) {
        await rest.put(
          Routes.applicationGuildCommands(readyClient.user.id, guildId),
          { body: commands }
        );
      }
      
      console.log('Successfully reloaded application (/) commands.');
    });
    
    // Handle interactions
    client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;
      
      // Get the user configuration by Discord username
      const username = interaction.user.username;
      const userConfig = await storage.getBotUserByUsername(username);
      
      if (!userConfig) {
        await interaction.reply({ 
          content: `You are not authorized to use this bot. Please contact an administrator.`,
          ephemeral: true
        });
        return;
      }
      
      if (!userConfig.isActive) {
        await interaction.reply({ 
          content: `Your account is currently inactive. Please contact an administrator.`,
          ephemeral: true
        });
        return;
      }
      
      const { commandName } = interaction;
      
      try {
        if (commandName === 'ask') {
          if (!userConfig.canUseAsk) {
            await interaction.reply({ 
              content: `You don't have permission to use the /ask command.`,
              ephemeral: true
            });
            return;
          }
          
          const question = interaction.options.getString('question');
          await interaction.deferReply();
          
          const answer = await callPoppyAPI(question!, userConfig);
          
          await interaction.editReply(`**Question:** ${question}\n\n**Answer:** ${answer}`);
        } 
        else if (commandName === 'summary') {
          if (!userConfig.canUseSummary) {
            await interaction.reply({ 
              content: `You don't have permission to use the /summary command.`,
              ephemeral: true
            });
            return;
          }
          
          const threadName = interaction.options.getString('thread');
          await interaction.deferReply();
          
          // In a real app, we would fetch the actual thread's messages
          // For this demo, we'll use a placeholder
          const threadContent = `This is a simulated thread called ${threadName}. 
          In a real application, we would extract all messages from the specified thread.
          Then we'd send them to Poppy AI for summarization.`;
          
          const prompt = `Please summarize the following Discord thread:\n\n${threadContent}`;
          
          const summary = await callPoppyAPI(prompt, userConfig);
          
          await interaction.editReply(`**Thread Summary (${threadName}):**\n\n${summary}`);
        }
      } catch (error) {
        console.error(`Error handling command ${commandName}:`, error);
        
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(`Sorry, something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } else {
          await interaction.reply({ 
            content: `Sorry, something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ephemeral: true
          });
        }
      }
    });
    
    // Login to Discord
    await client.login(token);
    
    return client;
  } catch (error) {
    console.error('Error initializing bot:', error);
    throw error;
  }
}
