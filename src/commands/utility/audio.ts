import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { playAudio } from "../../utils/playAudio.js";

export const data = new SlashCommandBuilder()
   .setName("audio")
   .setDescription("Toca um áudio no canal de voz");

export async function execute(interaction: CommandInteraction<CacheType>) {
   await playAudio(interaction);
}
