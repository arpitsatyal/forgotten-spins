// 1. THIS IS THE KEY: Import process from the node compatibility layer
import * as process from 'node:process';
(globalThis as any).process = process;

// 2. NOW keep your current imports
import { LastFmClient } from './lastfm';
import { Analyzer } from './analyzer';
import { formatDistanceToNow } from 'date-fns';

export default {
    async fetch(request, env) {
        try {
            // Because we set globalThis.process above, these will now work
            // even in nested files like lastfm.ts!
            const apiKey = process.env.LASTFM_API_KEY;
            const username = process.env.LASTFM_USERNAME;
            const periodEnv = process.env.FORGOTTEN_PERIOD || '12month';

            const client = new LastFmClient(apiKey!, username!);
            const analyzer = new Analyzer(client, periodEnv as any);

            console.log(`Analyzing for ${username}...`);
            const recommendation = await analyzer.getForgottenAlbum();

            if (recommendation) {
                return new Response(`Today's Forgotten Spin: ${recommendation.name} by ${recommendation.artist}`);
            }
            return new Response("No forgotten spins found today.");

        } catch (error: any) {
            return new Response(`Error: ${error.message}`, { status: 500 });
        }
    }
};