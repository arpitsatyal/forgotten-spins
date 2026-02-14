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
    });
    client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand())
            return;
        console.log(`Received command: ${interaction.commandName}`);
        const command = commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            console.log(`Executing command: ${interaction.commandName}`);
            await command.execute(interaction);
            console.log(`Command ${interaction.commandName} executed successfully.`);
        }
        catch (error) {
            console.error(`Error executing ${interaction.commandName}:`, error);
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
    client.login(token).catch(error => {
        console.error('❌ Failed to log in to Discord:', error);
        console.error('This usually means:');
        console.error('1. Invalid DISCORD_TOKEN');
        console.error('2. Network connectivity issues');
        console.error('3. Discord API is down');
        // Don't exit - keep the keep-alive server running
    });
}
