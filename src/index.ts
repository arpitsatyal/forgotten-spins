import dotenv from 'dotenv';
import { LastFmClient } from './lastfm';
import { Analyzer } from './analyzer';
import path from 'path';
import { formatDistanceToNow } from 'date-fns';

// Load .env from project root
// dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.LASTFM_API_KEY;
const username = process.env.LASTFM_USERNAME;
const periodEnv = process.env.FORGOTTEN_PERIOD || '12month';

const validPeriods = ['7day', '1month', '3month', '6month', '12month'];
if (!validPeriods.includes(periodEnv)) {
    console.error(`Error: Invalid FORGOTTEN_PERIOD '${periodEnv}'. Must be one of: ${validPeriods.join(', ')}`);
    process.exit(1);
}

const period = periodEnv as '7day' | '1month' | '3month' | '6month' | '12month';

if (!apiKey || !username) {
    console.error('Error: LASTFM_API_KEY and LASTFM_USERNAME must be set in .env file.');
    process.exit(1);
}

async function main() {
    try {
        const client = new LastFmClient(apiKey!, username!);
        // Pass both the API fetching period AND the custom cutoff date (if any)
        const analyzer = new Analyzer(client, period);

        console.log(`Analyzing listening history for user: ${username}...`);
        console.log(`Looking for albums not played in the last ${period}...`);

        const recommendation = await analyzer.getForgottenAlbum();

        if (recommendation) {
            console.log('\n------------------------------------------------');
            console.log('🎧 RECOMMENDED FORGOTTEN SPIN 🎧');
            console.log('------------------------------------------------');
            console.log(`Album:  ${recommendation.name}`);
            console.log(`Artist: ${recommendation.artist}`);
            console.log(`Total Scrobbles: ${recommendation.playcount}`);
            if (recommendation.lastPlayed) {
                const timeAgo = formatDistanceToNow(recommendation.lastPlayed, { addSuffix: true });
                console.log(`Last Played: ${recommendation.lastPlayed.toLocaleDateString()} (${timeAgo})`);
            } else {
                console.log('Last Played: Over a year ago (or not found in recent history)');
            }
            console.log(`URL: ${recommendation.url}`);
            console.log('------------------------------------------------');
            console.log('Why? You used to listen to this a lot, but haven\'t played it much in the last year.');
        } else {
            console.log('No suitable forgotten albums found. Maybe try listening to more music?');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
