import dotenv from "dotenv";
import { Collection, Events, GatewayIntentBits } from "discord.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { BotClient } from "./types/BotClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new BotClient({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
   ],
});

const prefix = "imundo";

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands", "utility");
const commandFiles = fs
   .readdirSync(commandsPath)
   .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of commandFiles) {
   const filePath = path.join(commandsPath, file);

   const command = await import(`file://${filePath}`);

   if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
   } else {
      console.warn(
         `[WARNING] O comando em ${filePath} está faltando "data" ou "execute".`
      );
   }
}

client.once(Events.ClientReady, async (readyClient) => {
   console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
   if (!interaction.isChatInputCommand()) return;

   const command = client.commands.get(interaction.commandName);

   if (!command) return;

   try {
      await command.execute(interaction);
   } catch (error) {
      console.error("Erro ao executar comando:", error);

      if (interaction.replied || interaction.deferred) {
         await interaction.followUp({
            content: "Ocorreu um erro ao executar o comando.",
            ephemeral: true,
         });
      } else {
         await interaction.reply({
            content: "Erro ao executar o comando.",
            ephemeral: true,
         });
      }
   }
});

client.on(Events.MessageCreate, async (message) => {
   if (!message.content.startsWith(prefix) || message.author.bot) return;

   const args = message.content.split(prefix)[1].trim().split(/ +/);
   const commandName = args.shift()?.toLowerCase();

   if (!commandName) return;

   if (commandName.includes("tomar")) {
      await message.channel.send("Vai tomar no cu kkkkk");
      await message.channel.send(
         "https://tenor.com/view/cachorro-arrombado-gif-7448837797907435519"
      );
      return;
   }

   const command = client.commands.get(commandName);
   if (!command) {
      await message.channel.send(`Comando "${commandName}" não encontrado.`);
      return;
   }

   try {
      await command.execute(message, args);
   } catch (err) {
      console.error(err);
      await message.channel.send("Erro ao executar o comando!");
   }
});

client.login(process.env.DISCORD_BOT_TOKEN);
