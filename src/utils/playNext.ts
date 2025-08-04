import {
   AudioPlayerStatus,
   createAudioPlayer,
   createAudioResource,
   StreamType,
   VoiceConnection,
} from "@discordjs/voice";
import { spawn } from "child_process";
import { player, queue } from "../state/musicState.js";
import { russianRoulette } from "./russianRoulette.js";
import { cleanMusicStates } from "./cleanMusicStates.js";

export const playNext = async (
   guildId: string,
   connection: VoiceConnection,
   interaction: any
) => {
   const currentQueue = queue.get(guildId);

   if (!currentQueue || currentQueue.length === 0) {
      connection.destroy();
      cleanMusicStates(guildId);
      return;
   }

   if (russianRoulette()) {
      currentQueue.unshift({
         title: "Rick Astley - Never Gonna Give You Up",
         url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
         requestedBy: "Rick Astley",
      });
      queue.set(guildId, currentQueue);
   }

   const ytdlp = spawn("yt-dlp", [
      "-f",
      "bestaudio",
      "-o",
      "-",
      "--no-playlist",
      currentQueue[0].url,
   ]);

   const resource = createAudioResource(ytdlp.stdout, {
      inputType: StreamType.Arbitrary,
   });

   const currentPlayer = player.get(guildId) ?? createAudioPlayer();
   currentPlayer.play(resource);

   connection.subscribe(currentPlayer);
   player.set(guildId, currentPlayer);

   await interaction.channel.send(`Tocando **${currentQueue[0].title}**`);

   currentPlayer.on(AudioPlayerStatus.Idle, () => {
      currentQueue.shift();
      queue.set(guildId, currentQueue);
      playNext(guildId, connection, interaction);
   });
};
