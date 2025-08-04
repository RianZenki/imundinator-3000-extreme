import { connection, player, queue } from "../state/musicState.js";

export const cleanMusicStates = (guildId: string) => {
   const currentQueue = queue.get(guildId);
   const currentPlayer = player.get(guildId);
   const currentConnection = connection.get(guildId);

   if (currentQueue) queue.delete(guildId);
   if (currentPlayer) player.delete(guildId);
   if (currentConnection) connection.delete(guildId);
};
