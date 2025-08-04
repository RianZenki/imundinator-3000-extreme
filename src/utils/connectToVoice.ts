import {
   joinVoiceChannel,
   VoiceConnection,
   entersState,
   VoiceConnectionStatus,
} from "@discordjs/voice";
import { CommandInteraction, GuildMember, ChannelType } from "discord.js";

export async function connectToVoice(interaction: CommandInteraction) {
   // Garante que é um comando em um servidor
   if (!interaction.guild || !interaction.member) return;

   const member = interaction.member as GuildMember;
   const voiceChannel = member.voice.channel;

   if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      await interaction.reply("❌ Você precisa estar em um canal de voz.");
      return;
   }

   try {
      const connection: VoiceConnection = joinVoiceChannel({
         channelId: voiceChannel.id,
         guildId: voiceChannel.guild.id,
         adapterCreator: voiceChannel.guild.voiceAdapterCreator,
         selfDeaf: false,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      await interaction.reply(
         `✅ Entrei no canal de voz: ${voiceChannel.name}`
      );
   } catch (error) {
      console.error("Erro ao entrar no canal de voz:", error);
      await interaction.reply("❌ Não consegui entrar no canal de voz.");
   }
}
