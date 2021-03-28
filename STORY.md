## Inspiration

[Research](https://www.psychologicalscience.org/observer/the-science-of-swearing) show that children begin to swear at ages 10-12, and the average amount of people is only increasing due to online social media platforms. Our story to prevent people from developing these bad habits began one year ago. We've been moderating Discord communities (and school communities in particular) for quite a bit now and one of the challenges we've faced was how to keep the chat clean. There's many anti-swear bots out there but the vast majority of them have two properties - first, they only work in TEXT channels, meaning that someone swearing in a voice channel would go completely unnoticed, and two, they were extremely unsophisticated. In particular, we found many matched on input such as "embar**ass**ed" and did _not_ match on input such as "f \* c k".

Our goal was to fix the habit of swearing (and the technical problerms with other bots).

## What it does

Our bot automatically joins into Discord voice channels with you and records your voice. We run this through a speech-to-text engine and scan the resulting transcript for dirty words. If we find any, we send a detailed report to a pre-configured report channel and warn the user via Direct Messages. We do the same with all text messages, but employ a far more sophisticated algorithm to catch potential bypasses the user may attempt to use.

To incentivize users into _not_ swearing, we also have a reputation system. People get points for talking but lose a large number of points if they swear. As competition is a strong emotion developed through evolution, it is only normal that members will compete with others, thus making them less likely from posting undesirable content. Putting this into a clean, viewable pacakge, we created a paginated leaderboard and image rank card for users to view their rep, level and rank. Finally, for commands themselves, we utilize Discord's new interactions API (sometimes known as "slash commands") for a near-native experience when using commands.

## How we built it

- For running the bot, we used Docker and Docker Compose
- We utilized Google's Speech to Text API to get transcriptions of what people were saying in voice channels
- We used the Node.JS platform for developing our bot
  - We used Discord.js framework to interact with the Discord API
  - We used the `slash-create` module to create Discord slash commands
  - We used the `canvas` and `canvas-constructor` library to create dynamic rank card images
- We used PostgreSQL to store persistent data, such as server settings, member preferences, and reputation points
  - To interact with it, we used the Postgres.js module (`postgres` on npm)
- We used Photoshop and Krita to create images and other designs

## Challenges we ran into

Bolded ones are the more painful ones.
In order that they appeared while working:

1. How should we collaborate on the project?
   - VSC Live Share
   - Git and a GitHub repo
2. How do we use the Google Speech to Text API?
   - The way that we were supposed to authenticate was a bit hard to figure out (set an environment variable to a path to the auth file)
   - What do we send to the API?
     - Linear PCM audio encoded in Base64
3. How do we record audio from users on Discord?
   - Tried just joining the channel and recording directly like how the documentation instructed us to do
   - After much searching, it turned out Discord doesn't let us receive audio unless we play a sound
     - We just played a very short silence frame
4. **Why is Google Speech-to-Text not working?**
   - 99% of the time, after we sent our recording, it returned absolutely nothing
   - Other times, it just returned nonsense
   - Perhaps our audio was corrupted?
   - Okay, let's see if we can listen to the recorded audio
     - Recording is PCM format -- how are we supposed to play it?
       - Eventually installed Audacity (an audio editor), imported the PCM file, and listened to it
       - Sounds OK, so what's the issue?
   - Eventually found that Google Speech-to-Text only supports 1 channel (mono) audio while our recording was 2 channel (stereo)
     - How do we convert stereo to mono?
     - Found a post on dev.to that talked about it, we tried the code, it worked
5. **How do we get slash commands working?**
   - The library we used for Discord (`discord.js`) does not officially support interactions (there is a WIP pull request for it)
     - Had to look into other solutions (directly sending requests to the Discord API?)
   - Eventually found a library (`slash-create`) that managed slash commands for us
     - It didn't integrate very well with `discord.js` though so we essentially had to write a wrapper library around it so the two could work together
6. How do we generate the rank card image?
   - We had a general idea of what we were doing but it was really hard to get all the coordinates right
   - Just did trial and error and eventually it looked somewhat OK
7. Discord Slash Command limitations
   - We wanted to send rank cards in response to slash commands
   - We can't simply send attachments in response to a slash command (Discord doesn't allow it - this is a limitation of their API which they have on their roadmap)
   - Had to send a "waiting" message and then send another message with the attachment
8. SQL syntax issues
   - Really painful trial and error here (many stupid issues like adding a trailing comma on queries)
9. **How do we match text for the swear filter?**
   - We wanted to match a list of patterns against some text
   - Doing a loop and then just `string.includes()` wouldn't really work - we needed things like word boundaries and fuzzy matching
   - Regular expressions were an option (just match regular expressions one by one) but we found they were really, really verbose and easy to get wrong
   - Eventually settled on a variation of the Aho-Corasick algorithm, modified to do some fuzzy searching
     - Unfortunately all the existing libraries in the JS ecosystem did not meet our very specific requirements - so we had to write the algorithm ourselves
     - Very painful to write - Aho-Corasick by itself is not a trivial algorithm and we wanted to make some large variations to it
       - Had to really understand what the algorithm was doing

## Accomplishments that we're proud of

In no particular order,

1. Our voice chat swear filter:

   - As no other public Discord bot (to our knowledge) has the voice chat swear detection feature, we can claim that ours is the first of its kind
   - We were able to overcome one of the biggest challenges in this hackathon, and be able to create a cohesive package in such little time

2. Rank cards

   - As we were creating the rank card, we tried to perfect every single pixel. At the end, we were able to create a nearly perfect rank card

3. Text-based swear detection
   - Our text swear scanner detects all of the below:
     - spaced text `h e l l o`
     - zalgo `h̸̜e̢l̸̼͎̬̥̤lo̷̭̩̼̯̣̠`
     - leetspeak `h3llo`
   - It's also very fast, thanks to the Aho-Corasick algorithm

## What we learned

- How to use Docker to run a Discord bot
- How to use Google's Text to Speech API
- How to create Discord slash commands with a JS Discord bot
- How to record audio in Discord Voice Channels
- Various PostgreSQL things (i.e. how to get the rank of a row sorted by some criteria, how to add a default value to a column after it has been created)

## What's next for Ikenai

We want to continue to polish it and hopefully deploy it to production one day. Two things we would like to do are: 1) a dashboard, using Vue.js and Express, 2) customizable phrases for the swear filter. Furthermore, we would like to advertise to advertise our bot and get it into other servers, making it as the first voice-chat-swear-bot that is publicly available.
