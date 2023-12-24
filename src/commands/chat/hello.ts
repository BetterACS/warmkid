import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { commandData } from '../../utils/interface';

export const data: commandData = {
	name: 'ping',
	type: 'chat',
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
};

export async function execute(interaction: CommandInteraction) {
	await interaction.reply(`:ping_pong: Pong!`);
}

export async function interaction(interaction: CommandInteraction) {}
