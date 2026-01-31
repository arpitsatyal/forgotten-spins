import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import * as forgottenCommand from './commands/forgotten';
import { keepAlive } from './keep_alive';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('Error: DISCORD_TOKEN is missing in .env');
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Command Collection
const commands = new Collection<string, any>();
commands.set(forgottenCommand.data.name, forgottenCommand);

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.login(token);
keepAlive();
