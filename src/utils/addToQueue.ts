import { queue } from "../state/musicState.js";
import { Song } from "../types/Song.js";

export const addToQueue = (guildId: string, song: Song) => {
   if (!queue.has(guildId)) {
      queue.set(guildId, []);
   }

   queue.get(guildId)!.push(song);
};
