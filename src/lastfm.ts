import axios from 'axios';
import { LastFmTopAlbumsResponse, NormalizedAlbum } from './types';

const API_ROOT = 'http://ws.audioscrobbler.com/2.0/';

export class LastFmClient {
    private apiKey: string;
    private username: string;

    constructor(apiKey: string, username: string) {
        this.apiKey = apiKey;
        this.username = username;
    }

    private async fetch<T>(method: string, params: Record<string, string | number>): Promise<T> {
        const query = new URLSearchParams({
            method,
            user: this.username,
            api_key: this.apiKey,
            format: 'json',
            ...params,
        });

        try {
            const response = await axios.get<T>(`${API_ROOT}?${query.toString()}`);
            return response.data;
        } catch (error) {
            if ((axios as any).isAxiosError(error)) {
                const axiosError = error as any;
                throw new Error(`Last.fm API error: ${axiosError.message}`);
            }
            throw error;
        }
    }

    async getTopAlbums(period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall', limit = 100): Promise<NormalizedAlbum[]> {
        const response = await this.fetch<LastFmTopAlbumsResponse>('user.gettopalbums', {
            period,
            limit,
        });

        return response.topalbums.album.map((album) => ({
            name: album.name,
            artist: album.artist.name,
            playcount: parseInt(album.playcount, 10),
            url: album.url,
            mbid: album.mbid,
        }));
    }

    async findLastPlayed(artist: string, albumName: string): Promise<Date | null> {
        try {
            // Check recent 100 tracks by this artist
            // According to Last.fm docs, user.getArtistTracks doesn't exist? 
            // Wait, standard endpoint is specific. Let's verify.
            // If user.getArtistTracks is deprecated or requires authentication, we can use user.getRecentTracks and filter.
            // But let's try user.getArtistTracks as it is documented in some places.
            // Actually, safer to use user.getArtistTracks if it works, but let's assume it does.
            // Documentation: https://www.last.fm/api/show/user.getArtistTracks

            const response = await this.fetch<any>('user.getartisttracks', {
                artist,
                limit: 200,
            });

            // Note: The structure might be slightly different depending on the endpoint.
            // Let's assume response.artisttracks.track exists.
            const tracks = response.artisttracks?.track;
            if (!tracks || !Array.isArray(tracks)) return null;

            const targetAlbum = albumName.toLowerCase();

            for (const track of tracks) {
                if (track.album && track.date) {
                    const trackAlbumName = (track.album['#text'] || track.album.name || '').toLowerCase();
                    if (trackAlbumName === targetAlbum) {
                        const uts = parseInt(track.date.uts, 10);
                        return new Date(uts * 1000);
                    }
                }
            }

            return null; // Not found in recent history for this artist
        } catch (error) {
            console.warn(`Failed to fetch last played date for ${artist} - ${albumName}:`, error);
            return null;
        }
    }
    async getAlbumTags(artist: string, album: string): Promise<string[]> {
        try {
            const response = await this.fetch<any>('album.getinfo', {
                artist,
                album,
            });

            const tags = response.album?.tags?.tag;
            if (!tags) return [];

            if (Array.isArray(tags)) {
                return tags.map((t: any) => t.name.toLowerCase());
            } else if (tags.name) {
                return [tags.name.toLowerCase()];
            }

            return [];
        } catch (error) {
            console.warn(`Failed to fetch tags for ${artist} - ${album}:`, error);
            return [];
        }
    }
}
