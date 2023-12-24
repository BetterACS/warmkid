import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ActionRowBuilder,
	ChannelType,
	CommandInteraction,
	ModalBuilder,
	ModalSubmitFields,
	ModalSubmitInteraction,
	OverwriteData,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { supabaseClient } from '../../database/supabase';
import { commandData } from '../../utils/interface';

export const modal = () => {
	const modal = new ModalBuilder().setCustomId('event-add-modal').setTitle('Add an event');
	const eventName = new TextInputBuilder()
		.setCustomId('event-add-input-name')
		// The label is the prompt the user sees for this input
		.setLabel('Name of the event')
		// Short means only a single line of text
		.setStyle(TextInputStyle.Short);

	const eventDescription = new TextInputBuilder()
		.setCustomId('event-add-input-description')
		.setLabel('Description of the event')
		// Paragraph means multiple lines of text.
		.setStyle(TextInputStyle.Paragraph);

	// An action row only holds one text input,
	// so you need one action row per text input.
	const firstActionRow = new ActionRowBuilder().addComponents(eventName);
	const secondActionRow = new ActionRowBuilder().addComponents(eventDescription);

	// Add inputs to the modal
	modal.addComponents(firstActionRow as any, secondActionRow as any);
	return modal;
};

export const data: commandData = {
	name: 'event-add-modal',
	type: 'modal_submitted',
	data: new SlashCommandBuilder().setName('event-submit').setDescription('Submit an event'),
};
export async function execute(interaction: CommandInteraction) {}

async function updateDatabase(event_id: any, channel: any, role: any) {
	console.log('rev', event_id, channel.id, role.name);

	const result = await supabaseClient.from('events').select().eq('event_id', event_id);
	console.log(result.data);

	const { data, error } = await supabaseClient
		.from('events')
		.update({ channel_id: channel?.id as number, role_name: role?.name as string })
		.eq('event_id', event_id);

	return { data, error };
}

export async function interaction(interaction: ModalSubmitInteraction, id: string) {
	const fields = interaction.fields as ModalSubmitFields;
	const eventName = fields.getTextInputValue('event-add-input-name');
	const eventDescription = fields.getTextInputValue('event-add-input-description');

	// Get the latest event_id from the database
	const result = await supabaseClient
		.from('events')
		.select('event_id')
		.order('event_id', { ascending: false })
		.limit(1);

	if (result.error) {
		await interaction.reply(`Error: ${result.error.message}`);
		return;
	}

	const latestEventId = result.data[0] === undefined || result.data[0] === null ? 0 : result.data[0].event_id + 1;

	const role = await interaction.guild?.roles.create({
		name: `participant-event-${latestEventId}`,
	});
	const everyOne = interaction.guild?.roles.everyone;
	const permissionOverwrites: OverwriteData[] = [
		{
			id: role?.id as string,
			allow: ['ViewChannel'],
		},
		{
			id: everyOne?.id as string,
			deny: ['ViewChannel'],
		},
		{
			id: interaction.client.user?.id as string,
			allow: ['ViewChannel'],
		},
	];

	const channel = await interaction.guild?.channels.create({
		name: `${eventName}`,
		type: ChannelType.GuildText,
		permissionOverwrites: permissionOverwrites,
	});

	const { data, error } = await supabaseClient
		.from('events')
		.upsert({
			event_id: latestEventId,
			event_name: eventName,
			event_description: eventDescription,
			channel_id: Number(channel?.id),
			role_name: role?.name as string,
		})
		.select();

	if (error) {
		await interaction.reply(`Error: ${error.message}`);
		return;
	}

	channel?.send(
		`🎉 This is the channel for Event ${eventName}! 🎉\nOnly people with the role  \`${role?.name}\`  can see this channel.`
	);

	await interaction.reply(
		`🎉 Event ${eventName} added successfully! 🎉
        Event description: ${eventDescription}
        -  📢 Don't forget to share it with your friends!  \`/event show id:${data[0].event_id}\`
        -  🗑️ If you want to delete it, use  \`/event delete id:${data[0].event_id}\``
	);
}
