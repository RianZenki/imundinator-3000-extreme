import fs from "fs";
import {
   AudioPlayerStatus,
   createAudioPlayer,
   createAudioResource,
   StreamType,
   VoiceConnection,
} from "@discordjs/voice";
import { spawn } from "child_process";
import { player, queue } from "../state/musicState.js";
import { russianRoulette } from "./russianRoulette.js";
import { cleanMusicStates } from "./cleanMusicStates.js";
import path from "path";
import { chmod } from "fs/promises";
import https from "https";

export const playNext = async (
   guildId: string,
   connection: VoiceConnection,
   interaction: any
) => {
   const currentQueue = queue.get(guildId);

   if (!currentQueue || currentQueue.length === 0) {
      connection.destroy();
      cleanMusicStates(guildId);
      return;
   }

   if (russianRoulette()) {
      currentQueue.unshift({
         title: "Rick Astley - Never Gonna Give You Up",
         url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
         requestedBy: "Rick Astley",
      });
      queue.set(guildId, currentQueue);
   }

   const binFolder = path.resolve(process.cwd(), "bin");
   if (!fs.existsSync(binFolder)) fs.mkdirSync(binFolder);

   const ytDlpPath = path.join(binFolder, "yt-dlp");
   const ffmpegPath = path.join(binFolder, "ffmpeg-win32-x64.exe");

   async function downloadYtDlp() {
      return new Promise<void>((resolve, reject) => {
         if (fs.existsSync(ytDlpPath)) {
            console.log("yt-dlp já existe");
            return resolve();
         }

         console.log("Baixando yt-dlp...");
         const file = fs.createWriteStream(ytDlpPath);

         https
            .get(
               "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
               (response) => {
                  response.pipe(file);
                  file.on("finish", () => {
                     file.close(() => {
                        fs.chmodSync(ytDlpPath, 0o755);
                        console.log("yt-dlp baixado e pronto para uso");
                        resolve();
                     });
                  });
               }
            )
            .on("error", (err) => {
               if (fs.existsSync(ytDlpPath)) fs.unlinkSync(ytDlpPath);
               reject(err);
            });
      });
   }

   await chmod(ytDlpPath, 0o755);

   // await downloadYtDlp();

   // async function setupYtDlp() {
   //    try {
   //       // Dá permissão de execução
   //       await chmod(ytDlpPath, 0o755);
   //    } catch (err) {
   //       console.error("❌ Falha ao configurar yt-dlp:", err);
   //    }
   // }

   // await setupYtDlp();

   // const child = spawn(ytDlpPath, [
   //    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
   //    "-o",
   //    "output.mp3",
   // ]);
   // child.stdout.on("data", (data) => console.log(data.toString()));
   // child.stderr.on("data", (data) => console.error(data.toString()));
   // child.on("close", (code) =>
   //    console.log(`Processo finalizado com código ${code}`)
   // );

   // fs.readdir("/home/node/bin", (err, files) => {
   //    if (err) {
   //       console.error("Erro ao listar /home/node:", err);
   //       return;
   //    }
   //    console.log("/home/node/bin contém:", files);
   // });

   // console.log("yt-dlp path:", ytDlpPath);
   // console.log("yt-dlp existe?", fs.existsSync(ytDlpPath));
   // console.log("Permissões:", fs.statSync(ytDlpPath).mode.toString(8));

   // console.log("ffmpeg path:", ffmpegPath);
   // console.log("ffmpeg existe?", fs.existsSync(ffmpegPath));
   // console.log("Permissões:", fs.statSync(ffmpegPath).mode.toString(8));

   // console.log("Executando yt-dlp em:", ytDlpPath);
   // console.log("Executando ffmpeg em:", ffmpegPath);

   console.log("antes do test");

   const test = spawn(ytDlpPath, ["--version"]);

   console.log(test)

   console.log("passou do test");

   test.stdout.on("data", (chunk) => {
      console.log("yt-dlp versão:", chunk.toString());
   });

   test.on("close", (code) => {
      console.log("yt-dlp terminou com código", code);
   });

   const ytdlp = spawn(ytDlpPath, [
      "-f",
      "bestaudio",
      "-o",
      "-",
      "--no-playlist",
      "--no-part",
      "--no-cache-dir",
      currentQueue[0].url,
      "-v",
      "debug",
   ]);

   console.log("passou do ytdlp");

   // console.log("Iniciando yt-dlp com args:", [
   //    "-f",
   //    "bestaudio",
   //    "--no-playlist",
   //    "--audio-format",
   //    "opus",
   //    "-o",
   //    "-",
   //    currentQueue[0].url,
   // ]);

   const resource = createAudioResource(ytdlp.stdout, {
      inputType: StreamType.Arbitrary,
   });

   const currentPlayer = player.get(guildId) ?? createAudioPlayer();
   currentPlayer.play(resource);

   connection.subscribe(currentPlayer);
   player.set(guildId, currentPlayer);

   await interaction.channel.send(`Tocando **${currentQueue[0].title}**`);

   let totalBytes = 0;
   ytdlp.stdout.on("data", (chunk) => {
      totalBytes += chunk.length;
      console.log(
         `YT-DLP stdout: +${chunk.length} bytes (total: ${totalBytes})`
      );
   });

   ytdlp.stderr.on("data", (data) => {
      console.error("YT-DLP stderr:", data.toString());
   });

   currentPlayer.once(AudioPlayerStatus.Idle, () => {
      currentQueue.shift();
      queue.set(guildId, currentQueue);
      playNext(guildId, connection, interaction);
   });
};
