import { player, queue } from "./../../state/musicState.js";
import { getVoiceConnection } from "@discordjs/voice";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import { cleanMusicStates } from "../../utils/cleanMusicStates.js";

export const data = new SlashCommandBuilder()
   .setName("stop")
   .setDescription("Parar o bot");

export async function execute(interaction: any) {
   const member = interaction.member as GuildMember;
   const voiceChannel = member?.voice.channel;

   if (!voiceChannel) {
      interaction.channel!.send(
         "Você precisa estar em um canal de voz para usar esse comando."
      );
      return;
   }

   const guildId = interaction.guildId;
   const connection = getVoiceConnection(guildId!);

   if (connection) {
      connection.destroy();
      cleanMusicStates(guildId);
      interaction.channel!.send("Saí do canal de voz.");
   } else {
      interaction.channel!.send("Não estou conectado a nenhum canal de voz.");
   }
}
