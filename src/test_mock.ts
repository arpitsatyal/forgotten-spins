import { Analyzer } from './analyzer';
import { LastFmClient } from './lastfm';
import { NormalizedAlbum } from './types';

// Mock LastFmClient
class MockLastFmClient extends LastFmClient {
    constructor() {
        super('mock_key', 'mock_user');
    }

    async getTopAlbums(period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall', limit = 100): Promise<NormalizedAlbum[]> {
        if (period === 'overall') {
            return [
                { name: 'Favorite Album', artist: 'Best Band', playcount: 500, url: 'http://url' },
                { name: 'Old Obsession', artist: 'Retro Band', playcount: 400, url: 'http://url' }, // This should be picked
                { name: 'Recent Hit', artist: 'New Band', playcount: 300, url: 'http://url' },
                { name: 'Greatest Hits', artist: 'Classic Band', playcount: 200, url: 'http://url' }, // Should be excluded
                { name: 'Low Playcount', artist: 'Indie Band', playcount: 10, url: 'http://url' }, // Should be excluded
            ];
        } else if (period === '12month') {
            return [
                { name: 'Recent Hit', artist: 'New Band', playcount: 150, url: 'http://url' },
                { name: 'New Discovery', artist: 'Trendy Band', playcount: 100, url: 'http://url' },
            ];
        }
        return [];
    }
}

async function runTest() {
    const mockClient = new MockLastFmClient();
    const analyzer = new Analyzer(mockClient);

    console.log('Running mock test...');
    const result = await analyzer.getForgottenAlbum();

    if (result) {
        if (result.name === 'Old Obsession' || result.name === 'Favorite Album') {
            // Favorite Album is checking:
            // Recent contains "Recent Hit"
            // Overall: Favorite Album (500), Old Obsession (400), Recent Hit (300), Greatest Hits (200), Low Playcount (10)
            // 
            // Logic:
            // 1. Filter out Recent Hit (in recent) -> Remaining: Favorite Album, Old Obsession, Greatest Hits, Low Playcount
            // 2. Filter out Greatest Hits -> Remaining: Favorite Album, Old Obsession, Low Playcount
            // 3. Filter out Low Playcount (<30) -> Remaining: Favorite Album, Old Obsession
            // 4. Sort -> 1. Favorite Album (500), 2. Old Obsession (400)
            // 5. Randomly pick from top 20.

            console.log(`SUCCESS: Analyzer picked a valid candidate: ${result.name} by ${result.artist}`);
        } else {
            console.error(`FAILURE: Unexpected selection: ${result.name}`);
        }
    } else {
        console.error('FAILURE: No album selected');
    }
}

runTest();
