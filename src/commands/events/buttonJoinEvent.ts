import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import { commandData } from '../../utils/interface';
import { modal as showModal } from './showEventModal';

export const embed = (name: string, description: string) => {
	const randomColor = Math.floor(Math.random() * 16777215).toString(16);
	const embed = new EmbedBuilder().setTitle(name).setDescription(description).setColor(`#${randomColor}`);
	return embed;
};

export const buttons = (id: string) => {
	const confirm = new ButtonBuilder()
		.setCustomId(`event-join-succes.${id}`)
		.setLabel('Join event')
		.setStyle(ButtonStyle.Success);

	const actionRow = new ActionRowBuilder().addComponents(confirm);
	return actionRow;
};

export const data: commandData = {
	name: 'event-join-succes',
	type: 'button_clicked',
	data: new SlashCommandBuilder().setName('event-join-button').setDescription('Join an event'),
};
export async function execute(interaction: CommandInteraction) {}

export async function interaction(interaction: ButtonInteraction, id: string) {
	await interaction.showModal(showModal(id));
}
