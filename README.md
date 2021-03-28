# IKENAI

## About

Ikenai is an intelligent Discord bot that detects and removes swears. Unlike other bots though, it is able to detect and moderate swear in a voice chat. This is done by listening to users and uploading them to the Google Cloud API. Text moderation uses a modified aho-corasick algo to detect swears and remove them

[Invite The Bot](https://discord.com/api/oauth2/authorize?client_id=825168976119988254&permissions=8&scope=bot)

## Bot Commands

- Rank (Displays Rank Car)
- View-Backgrounds (Displays all Possible Backgrounds)
- Color (Sets Color)
- Background (Sets Background)
- Leaderboard (Views Leaderboard)
- Info (Gets Info on Bot)

**_Admin Only_**

- Set-Swear-Log (Sets a Channel as a Log for Swears)
- Set-Rep (Sets Users Rep)
- Purge (Purges Messages)

## Installation

- Clone project
- Setup Discord botand Google Cloud
- Add TOKEN to `.env`
- Run `docker-compose up --build-bot`

## Credits

- Created by Vincent Qi and Joseph Liu
- [Stereo to Mono](https://dev.to/codr/raw-stereo-audio-to-mono-channel-113a)
