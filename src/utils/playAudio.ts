import {
   createAudioPlayer,
   createAudioResource,
   entersState,
   joinVoiceChannel,
   StreamType,
   VoiceConnectionStatus,
} from "@discordjs/voice";
import { GuildMember, CommandInteraction, ChannelType } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function playAudio(interaction: CommandInteraction) {
   if (!interaction.guild || !interaction.member) return;

   const member = interaction.member as GuildMember;
   const voiceChannel = member.voice.channel;

   if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
      await interaction.reply("❌ Você precisa estar em um canal de voz.");
      return;
   }

   const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
   });

   try {
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

      const filePath = path.join(__dirname, "../assets/audio/ronaldinho.mp3");
      const resource = createAudioResource(filePath, {
         inputType: StreamType.Arbitrary,
      });

      const player = createAudioPlayer();
      connection.subscribe(player);

      player.play(resource);

      await interaction.reply("▶️ Tocando áudio...");
   } catch (err) {
      console.error("Erro ao tocar áudio:", err);
      await interaction.reply("❌ Ocorreu um erro ao tentar tocar o áudio.");
   }
}
