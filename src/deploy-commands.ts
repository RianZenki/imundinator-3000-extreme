import dotenv from "dotenv";
import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, "commands", "utility");
const commandFiles = fs
   .readdirSync(commandsPath)
   .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of commandFiles) {
   const command = await import(`file://${path.join(commandsPath, file)}`);
   if ("data" in command) {
      commands.push(command.data.toJSON());
   }
}

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

try {
   console.log("🔄 Atualizando (registrando) os comandos...");
   await rest.put(
      Routes.applicationGuildCommands(
         process.env.CLIENT_ID!,
         process.env.GUILD_ID!
      ),
      {
         body: commands,
      }
   );
   console.log("✅ Comandos registrados com sucesso!");
} catch (error) {
   console.error("❌ Erro ao registrar os comandos:", error);
}
