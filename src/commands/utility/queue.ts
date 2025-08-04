import { GuildMember, SlashCommandBuilder } from "discord.js";
import { queue as queueState } from "../../state/musicState.js";
import { Song } from "../../types/Song.js";

export const data = new SlashCommandBuilder()
   .setName("queue")
   .setDescription("Lista as músicas que estão na fila");

export async function execute(interaction: any) {
   const guildId = interaction.guildId;
   const currentQueue = queueState.get(guildId);

   if (!currentQueue || currentQueue.length === 0) {
      await interaction.channel.send(`Não foi encontrado nada na fila`);
      return;
   }

   let songQueue = "**Lista foda de música**\n\n";

   currentQueue?.forEach((song: Song, index) => {
      if (index === 0) {
         songQueue += `**Tocando agora**: ${song.title}\n`;
      } else {
         songQueue += `\n**${index}**. ${song.title}`;
      }
   });

   await interaction.channel.send(songQueue);
}
