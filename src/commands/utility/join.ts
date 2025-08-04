import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { connectToVoice } from "../../utils/connectToVoice.js";

export const data = new SlashCommandBuilder()
   .setName("join")
   .setDescription("Faz o bot entrar no seu canal de voz");

export async function execute(interaction: CommandInteraction<CacheType>) {
   await connectToVoice(interaction);
}
