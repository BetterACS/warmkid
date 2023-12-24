import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { supabaseClient } from '../../database/supabase';
import { commandData } from '../../utils/interface';
import { buttons, embed } from './buttonJoinEvent';
import { modal as createModal } from './creatEventModal';

export const data: commandData = {
	name: 'event',
	type: 'chat',
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Event management')
		.addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create an event'))
		.addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Delete an event'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('show')
				.setDescription('Show an event')
				.addNumberOption((option) => option.setName('id').setDescription('The event id').setRequired(true))
		),
};
export async function execute(interaction: CommandInteraction) {
	const option = interaction.options as CommandInteractionOptionResolver;
	const subcommand = option.getSubcommand();

	if (subcommand === 'create') {
		await interaction.showModal(createModal());
		await interaction.awaitModalSubmit({ time: 60000 });
	} else if (subcommand === 'delete') {
		await interaction.reply('Delete');
	} else if (subcommand === 'show') {
		const id = option.getNumber('id');
		if (id === null) {
			await interaction.reply('Please input event id');
			return;
		}
		const { data, error } = await supabaseClient.from('events').select().eq('event_id', id);
		if (error) {
			await interaction.reply(`Error: ${error.message}`);
			return;
		}
		const event = data[0];
		const eventName = event.event_name;
		const eventDescription = event.event_description;

		await interaction.reply({
			embeds: [embed(eventName, eventDescription)],
			components: [buttons(id.toString())] as any,
		});
	} else {
		await interaction.reply('Unknown subcommand');
	}
}

export async function interaction(interaction: CommandInteraction) {}
