import { LastFmClient } from './lastfm';
import { NormalizedAlbum } from './types';

export class Analyzer {
    private client: LastFmClient;
    private period: '7day' | '1month' | '3month' | '6month' | '12month';

    constructor(
        client: LastFmClient,
        period: '7day' | '1month' | '3month' | '6month' | '12month' = '12month'
    ) {
        this.client = client;
        this.period = period;
    }

    private isCompilation(albumName: string): boolean {
        const lower = albumName.toLowerCase();
        return (
            lower.includes('greatest hits') ||
            lower.includes('best of') ||
            lower.includes('singles collection') ||
            lower.includes('anthology') ||
            lower.includes('essential') ||
            lower.includes('remastered')
        );
    }

    private cleanString(str: string): string {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    async getForgottenAlbum(genre?: string): Promise<NormalizedAlbum | null> {
        // Fetching top albums (overall)
        const overallTop = await this.client.getTopAlbums('overall', 200);

        // Fetching recent top albums
        const recentTop = await this.client.getTopAlbums(this.period, 200);

        // Create a set of "key" strings for recent albums to easily filter them out
        const recentKeys = new Set(
            recentTop.map((a) => `${this.cleanString(a.artist)}:${this.cleanString(a.name)}`)
        );

        // Filter overall list
        let candidates = overallTop.filter((album) => {
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

        // Sort by playcount descending
        candidates.sort((a, b) => b.playcount - a.playcount);

        // If genre is specified, we need to filter further.
        // fetching tags for ALL candidates is expensive.
        // Strategy: Take top 50, fetch tags for them, filter, then pick from remaining.
        const poolSize = genre ? 50 : 20;
        let topN = candidates.slice(0, poolSize);

        if (genre) {
            const targetGenre = genre.toLowerCase();
            const filteredCandidates: NormalizedAlbum[] = [];

            for (const candidate of topN) {
                const tags = await this.client.getAlbumTags(candidate.artist, candidate.name);
                if (tags.some(tag => tag.includes(targetGenre))) {
                    filteredCandidates.push(candidate);
                }
            }
            topN = filteredCandidates;
        }

        if (topN.length === 0) return null;

        // Dynamic selection:
        // Randomly pick one from the filtered pool.
        const selected = topN[Math.floor(Math.random() * topN.length)];

        // Fetch Last Played Date
        const lastPlayed = await this.client.findLastPlayed(selected.artist, selected.name);

        if (lastPlayed) {
            selected.lastPlayed = lastPlayed;
        }

        return selected;
    }
}
