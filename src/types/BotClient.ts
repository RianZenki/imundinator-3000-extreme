import {
   ChatInputCommandInteraction,
   Message,
   Client,
   Collection,
   SlashCommandBuilder,
} from "discord.js";

export interface Command {
   data: SlashCommandBuilder;
   execute: (
      interactionOrMessage: ChatInputCommandInteraction | Message,
      args?: string[]
   ) => Promise<void>;
}

export class BotClient extends Client {
   public commands: Collection<string, Command> = new Collection();
}
