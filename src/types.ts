export interface LastFmImage {
    '#text': string;
    size: 'small' | 'medium' | 'large' | 'extralarge';
}

export interface LastFmArtist {
    name: string;
    url: string;
    mbid?: string;
}

export interface LastFmAlbum {
    name: string;
    playcount: string;
    mbid?: string;
    url: string;
    artist: LastFmArtist;
    image: LastFmImage[];
}

export interface LastFmTopAlbumsResponse {
    topalbums: {
        album: LastFmAlbum[];
        '@attr': {
            user: string;
            page: string;
            perPage: string;
            totalPages: string;
            total: string;
        };
    };
}

export interface LastFmDate {
    uts: string;
    '#text': string;
}

export interface LastFmTrack {
    name: string;
    artist: LastFmArtist;
    album: {
        '#text': string; // Sometimes album is just text in track responses
        mbid?: string;
    };
    date?: LastFmDate; // date is missing if currently playing
}

export interface LastFmArtistTracksResponse {
    artisttracks: {
        track: LastFmTrack[];
        '@attr': {
            user: string;
            artist: string;
            page: string;
            perPage: string;
            totalPages: string;
            total: string;
        };
    };
}

export interface NormalizedAlbum {
    name: string;
    artist: string;
    playcount: number;
    url: string;
    mbid?: string;
    lastPlayed?: Date;
}
