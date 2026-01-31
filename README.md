title: Forgotten Spins
emoji: 🎲
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false


# Forgotten Spins 📀

**Forgotten Spins** is a Discord bot that digs into your Last.fm listening history to resurface albums you used to love but haven't played in a long time. It helps you rediscover your old favorites by filtering out what you've been listening to recently.

## Features
- **Smart Analysis**: Compares your all-time top albums against your last 12 months of listening history.
- **Intelligent Filtering**: Automatically excludes "Greatest Hits" compilations and low-playcount albums.
- **Genre Search**: Filter recommendations by specific genres (e.g., "shoegaze", "jazz").
- **Last Played Detection**: Pinpoints exactly when you last listened to the album.

## Installation

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root:
   ```env
   LASTFM_API_KEY=your_lastfm_api_key
   LASTFM_USERNAME=your_lastfm_username (optional default)
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_discord_client_id
   FORGOTTEN_PERIOD=12month
   ```

## Usage

### 1. Deploy Commands
Before running the bot for the first time (or when commands change), register the slash commands:
```bash
npm run deploy-commands
```

### 2. Start the Bot
```bash
npm run start:bot
```

### 3. Discord Commands
- `/forgotten` - Get a random recommendation.
- `/forgotten username:yourname` - specific user.
- `/forgotten genre:rock` - Filter by genre.
- `/forgotten period:6month` - Change the "recent" cutoff.

## How It Works
The bot fetches your top 200 all-time albums and checks them against your recent top albums. It applies filters (compilations, play counts, genres) and returns a forgotten gem that hasn't been in your rotation for the specified period.
