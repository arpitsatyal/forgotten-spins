import { LastFmClient } from './lastfm';
import { NormalizedAlbum } from './types';

export class Analyzer {
    private client: LastFmClient;

    constructor(client: LastFmClient) {
        this.client = client;
    }

    private isCompilation(albumName: string): boolean {
        const lower = albumName.toLowerCase();
        return (
            lower.includes('greatest hits') ||
            lower.includes('best of') ||
            lower.includes('singles collection') ||
            lower.includes('anthology') ||
            lower.includes('essential') ||
            lower.includes('remastered') // Sometimes remasters are treated as separate albums, but maybe we want them? Let's exclude "remastered" if it's explicitly in the title to avoid dupes, but usually it's fine. 
            // Actually, "Deleted" is common in Last.fm for merged entries, but let's stick to compilations.
            // Let's keep it simple for now.
        );
    }

    private cleanString(str: string): string {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    async getForgottenAlbum(): Promise<NormalizedAlbum | null> {
        console.log('Fetching top albums (overall)...');
        const overallTop = await this.client.getTopAlbums('overall', 200);

        console.log('Fetching recent top albums (last 12 months)...');
        const recentTop = await this.client.getTopAlbums('12month', 200);

        // Create a set of "key" strings for recent albums to easily filter them out
        const recentKeys = new Set(
            recentTop.map((a) => `${this.cleanString(a.artist)}:${this.cleanString(a.name)}`)
        );

        // Filter overall list
        const candidates = overallTop.filter((album) => {
            // 1. Must not be in recent list
            const key = `${this.cleanString(album.artist)}:${this.cleanString(album.name)}`;
            if (recentKeys.has(key)) return false;

            // 2. Must not be a compilation (heuristic)
            if (this.isCompilation(album.name)) return false;

            // 3. Must have significant play count (e.g. > 30 plays)
            if (album.playcount < 30) return false;

            return true;
        });

        if (candidates.length === 0) {
            return null;
        }

        // Sort by playcount descending (it should already be sort of sorted, but ensure it)
        candidates.sort((a, b) => b.playcount - a.playcount);

        // Dynamic selection:
        // Take the top 20 candidates.
        // Randomly pick one.
        // This ensures high quality (high play counts) but variation (not always the same #1).
        const topN = candidates.slice(0, 20);
        const selected = topN[Math.floor(Math.random() * topN.length)];

        // Fetch Last Played Date
        console.log(`Fetching last played date for: ${selected.artist} - ${selected.name}`);
        const lastPlayed = await this.client.findLastPlayed(selected.artist, selected.name);
        if (lastPlayed) {
            selected.lastPlayed = lastPlayed;
        }

        return selected;
    }
}
