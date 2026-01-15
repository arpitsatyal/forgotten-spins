# Forgotten Spins 📀

**Forgotten Spins** is a CLI tool that digs into your Last.fm listening history to resurface albums you used to love but haven't played in a long time. It helps you rediscover your old favorites by filtering out what you've been listening to recently.

## Features
- **Smart Analysis**: Compares your all-time top albums against your last 12 months of listening history.
- **Intelligent Filtering**: Automatically excludes "Greatest Hits" compilations and low-playcount albums to ensure high-quality recommendations.
- **Last Played Detection**: Pinpoints exactly when you last listened to the album (if within available history).
- **Chaos Mode**: Randomly selects from the top candidates so you don't get the same recommendation every time.

## Installation

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root:
   ```env
   LASTFM_API_KEY=your_api_key_here
   LASTFM_USERNAME=your_lastfm_username
   ```
   *You can get an API key from the [Last.fm API account creation page](https://www.last.fm/api/account/create).*

## Usage

Run the tool from your terminal:

```bash
npm start
```

## How It Works
The tool fetches your top 200 all-time albums and compares them against your top albums from the last year. It removes duplicates, applies filters, and presents you with a "forgotten spin" — an album that defined a past era of your life but has gone silent in your current rotation.
