import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { Song } from "../types/Song.js";

export const queue = new Map<string, Song[]>();
export const player = new Map<string, AudioPlayer>();
export const connection = new Map<string, VoiceConnection>();
