import dotenv from "dotenv";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import * as playdl from "play-dl";
import { russianRoulette } from "../../utils/russianRoulette.js";
import { addToQueue } from "../../utils/addToQueue.js";
import { connection, queue } from "../../state/musicState.js";
import { playNext } from "../../utils/playNext.js";

dotenv.config();

export const data = new SlashCommandBuilder()
   .setName("play")
   .setDescription("Toca um vídeo do YouTube no canal de voz.")
   .addStringOption((option) =>
      option
         .setName("url")
         .setDescription("Link do vídeo do YouTube ou nome do vídeo.")
         .setRequired(true)
   );

export async function execute(interaction: any, params: string[]) {
   const member = interaction.member as GuildMember;
   const voiceChannel = member.voice?.channel;
   const query =
      interaction?.options?.getString("url", true) || params.join(" ");

   if (!voiceChannel) {
      await interaction.reply("❌ Você precisa estar em um canal de voz!");
      return;
   }

   const guildId = voiceChannel.guild.id;

   if (russianRoulette()) {
      await interaction.channel.send("Não kkkkkkkkk");
      await interaction.channel.send(
         "https://tenor.com/view/cachorro-arrombado-gif-7448837797907435519"
      );
      return;
   }

   const results = await playdl.search(query, { limit: 1 });
   if (!results.length) {
      await interaction.reply("❌ Não encontrei nenhum vídeo com esse nome.");
      return;
   }

   addToQueue(guildId, {
      url: results[0].url,
      title: results[0].title!,
      requestedBy: member.displayName,
   });

   const currentConnection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
   });

   const currentQueue = queue.get(guildId);
   connection.set(guildId, currentConnection);

   if (currentQueue?.length === 1) {
      playNext(guildId, currentConnection, interaction);
   } else {
      await interaction.channel.send(
         `Adicionado na fila **${results[0].title}**`
      );
   }
}
