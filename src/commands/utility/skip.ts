import { GuildMember, SlashCommandBuilder } from "discord.js";
import { connection, player, queue } from "../../state/musicState.js";
import { playNext } from "../../utils/playNext.js";

export const data = new SlashCommandBuilder()
   .setName("skip")
   .setDescription("Pula a música atual");

export async function execute(interaction: any) {
   const member = interaction.member as GuildMember;
   const userVoiceChannel = member.voice?.channel;
   const botVoiceChannel = interaction.guild?.members.me?.voice?.channel;

   if (!userVoiceChannel) {
      await interaction.channel.send("Você precisa estar em um canal de voz!");
      return;
   }

   if (!botVoiceChannel) {
      await interaction.channel.send("O bot não está em nenhum canal de voz.");
      return;
   }

   if (userVoiceChannel.id !== botVoiceChannel.id) return;

   const guildId = userVoiceChannel.guild.id;
   const currentQueue = queue.get(guildId);
   const currentPlayer = player.get(guildId);
   const currentConnection = connection.get(guildId);

   if (
      !currentQueue ||
      currentQueue?.length === 0 ||
      !currentPlayer ||
      !currentConnection
   ) {
      await interaction.channel.send("Não estou tocando nada.");
      return;
   }

   currentQueue.shift();
   queue.set(guildId, currentQueue);

   playNext(guildId, currentConnection, interaction);
}
