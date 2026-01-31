import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import * as forgottenCommand from './commands/forgotten';

dotenv.config({ path: path.join(__dirname, '../.env') });

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
    console.error('Error: DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in .env');
    process.exit(1);
}

const commands = [
    forgottenCommand.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        // For global commands, use Routes.applicationCommands(clientId)
        // For development, we can try global, but it might take time to propagate. 
        // Let's use global for now as it's the standard for single-bot apps.
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${(data as any).length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();
