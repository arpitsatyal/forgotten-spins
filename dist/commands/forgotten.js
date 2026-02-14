"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const lastfm_1 = require("../lastfm");
const analyzer_1 = require("../analyzer");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('forgotten')
    .setDescription('Get a recommendation for a forgotten album from your Last.fm history')
    .addStringOption(option => option.setName('username')
    .setDescription('Your Last.fm username (optional if configured in .env)')
    .setRequired(false))
    .addStringOption(option => option.setName('period')
    .setDescription('Period to check for "recent" plays (default: 12month)')
    .setRequired(false)
    .addChoices({ name: '7 Days', value: '7day' }, { name: '1 Month', value: '1month' }, { name: '3 Months', value: '3month' }, { name: '6 Months', value: '6month' }, { name: '1 Year', value: '12month' }))
    .addStringOption(option => option.setName('genre')
    .setDescription('Filter by genre (e.g. "rock", "jazz", "indie")')
    .setRequired(false));
async function execute(interaction) {
    await interaction.deferReply();
    const usernameOption = interaction.options.getString('username');
    const periodOption = interaction.options.getString('period');
    const genreOption = interaction.options.getString('genre');
    const DefaultUsername = process.env.LASTFM_USERNAME;
    const DefaultPeriod = process.env.FORGOTTEN_PERIOD || '12month';
    const username = usernameOption || DefaultUsername;
    const period = periodOption || DefaultPeriod;
    if (!username) {
        await interaction.editReply('Please provide a username using the `username` option, or configure LASTFM_USERNAME in .env.');
        return;
    }
    const apiKey = process.env.LASTFM_API_KEY;
    if (!apiKey) {
        await interaction.editReply('Bot configuration error: LASTFM_API_KEY is missing.');
        return;
    }
    try {
        const client = new lastfm_1.LastFmClient(apiKey, username);
        const analyzer = new analyzer_1.Analyzer(client, period);
        let statusMsg = `Analyzing listening history for **${username}** (Period: ${period})`;
        if (genreOption)
            statusMsg += ` looking for **${genreOption}**`;
        statusMsg += `... This might take a moment.`;
        await interaction.editReply(statusMsg);
        const recommendation = await analyzer.getForgottenAlbum(genreOption || undefined);
        if (recommendation) {
            let reply = `🎧 **Recommended Forgotten Spin** 🎧\n`;
            reply += `**Album:** ${recommendation.name}\n`;
            reply += `**Artist:** ${recommendation.artist}\n`;
            reply += `**Total Scrobbles:** ${recommendation.playcount}\n`;
            if (recommendation.lastPlayed) {
                reply += `**Last Played:** ${recommendation.lastPlayed.toLocaleDateString()}\n`;
            }
            else {
                reply += `**Last Played:** Over a year ago (or not found in recent history)\n`;
            }
            reply += `\n${recommendation.url}`;
            await interaction.editReply(reply);
        }
        else {
            await interaction.editReply('No suitable forgotten albums found! Maybe you listen to everything equally?');
        }
    }
    catch (error) {
        console.error(error);
        await interaction.editReply('An error occurred while fetching your data. Please check the username and try again.');
    }
}
