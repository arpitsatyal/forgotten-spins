"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const forgottenCommand = __importStar(require("./commands/forgotten"));
const keep_alive_1 = require("./keep_alive");
// Load .env
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
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
    (0, keep_alive_1.keepAlive)();
    // Exit after a delay to allow logs to be captured
    setTimeout(() => process.exit(1), 5000);
}
else {
    console.log('✅ DISCORD_TOKEN found');
    const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
    // Command Collection
    const commands = new discord_js_1.Collection();
    commands.set(forgottenCommand.data.name, forgottenCommand);
    client.once(discord_js_1.Events.ClientReady, c => {
        console.log(`✅ Ready! Logged in as ${c.user.tag}`);
        console.log(`✅ Bot is in ${c.guilds.cache.size} server(s)`);
        console.log('✅ Discord bot is fully operational and ready to receive commands!');
    });
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand())
            return;
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
        }
        catch (error) {
            console.error(`❌ Error executing ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });
    // Start keep-alive server FIRST to satisfy Render health check immediately
    console.log('🚀 Starting keep-alive server...');
    (0, keep_alive_1.keepAlive)();
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
