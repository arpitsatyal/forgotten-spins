import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import * as forgottenCommand from './commands/forgotten';
import { keepAlive } from './keep_alive';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process - keep the bot running
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process - keep the bot running
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('❌ CRITICAL ERROR: DISCORD_TOKEN is missing!');
    console.error('Please set DISCORD_TOKEN in your Render environment variables.');
    console.error('The bot cannot start without a valid Discord token.');
    // Keep the keep-alive server running even if token is missing
    keepAlive();
    // Exit after a delay to allow logs to be captured
    setTimeout(() => process.exit(1), 5000);
} else {
    console.log('✅ DISCORD_TOKEN found');

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    // Command Collection
    const commands = new Collection<string, any>();
    commands.set(forgottenCommand.data.name, forgottenCommand);

    client.once(Events.ClientReady, c => {
        console.log(`✅ Ready! Logged in as ${c.user.tag}`);
        console.log(`✅ Bot is in ${c.guilds.cache.size} server(s)`);
        console.log('✅ Discord bot is fully operational and ready to receive commands!');
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        console.log(`📥 Received command: ${interaction.commandName} from ${interaction.user.tag}`);

        const command = commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            console.log(`⚙️ Executing command: ${interaction.commandName}`);
            await command.execute(interaction);
            console.log(`✅ Command ${interaction.commandName} executed successfully.`);
        } catch (error) {
            console.error(`❌ Error executing ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });

    // Start keep-alive server FIRST to satisfy Render health check immediately
    console.log('🚀 Starting keep-alive server...');
    keepAlive();

    console.log('🔐 Attempting to log in to Discord...');

    // Set a timeout to check if login succeeds
    let loginSuccessful = false;
    setTimeout(() => {
        if (!loginSuccessful) {
            console.error('⚠️ WARNING: Discord login did not complete within 30 seconds!');
            console.error('⚠️ This usually means:');
            console.error('   1. Invalid DISCORD_TOKEN - Check your token in Render environment variables');
            console.error('   2. Network issues - Discord API might be unreachable');
            console.error('   3. Token was regenerated - Get a new token from Discord Developer Portal');
            console.error('⚠️ The bot will NOT respond to commands until login succeeds!');
        }
    }, 30000);

    console.log('token', token)
    client.login(token)
        .then(() => {
            loginSuccessful = true;
            console.log('✅ Login request sent successfully, waiting for ready event...');
        })
        .catch(error => {
            console.error('❌ Failed to log in to Discord:', error);
            console.error('❌ Error details:', error.message);
            console.error('This usually means:');
            console.error('1. Invalid DISCORD_TOKEN - The token format is wrong or expired');
            console.error('2. Network connectivity issues - Cannot reach Discord API');
            console.error('3. Discord API is down - Check https://discordstatus.com');
            console.error('');
            console.error('🔧 To fix:');
            console.error('   1. Go to https://discord.com/developers/applications');
            console.error('   2. Select your application');
            console.error('   3. Go to Bot section');
            console.error('   4. Click "Reset Token" to get a new token');
            console.error('   5. Update DISCORD_TOKEN in Render environment variables');
            // Don't exit - keep the keep-alive server running
        });
}
