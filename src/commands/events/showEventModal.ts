import { SlashCommandBuilder } from '@discordjs/builders';
import {
	ActionRowBuilder,
	CommandInteraction,
	GuildMember,
	ModalBuilder,
	ModalSubmitFields,
	ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { supabaseClient } from '../../database/supabase';
import { commandData } from '../../utils/interface';

export const modal = (id: string) => {
	const modal = new ModalBuilder().setCustomId(`event-show-participant-modal.${id}`).setTitle('Show an event');
	const participantsID = new TextInputBuilder()
		.setCustomId(`event-show-participant-input-id`)
		// The label is the prompt the user sees for this input
		.setLabel('รหัสประจำตัวนักศึกษา')
		// Short means only a single line of text
		.setStyle(TextInputStyle.Short);

	const participantsName = new TextInputBuilder()
		.setCustomId('event-show-participant-input-name')
		.setLabel('ชื่อ-นามสกุล นักศึกษา')
		// Paragraph means multiple lines of text.
		.setStyle(TextInputStyle.Short);

	const participantsMotivation = new TextInputBuilder()
		.setCustomId('event-show-participant-input-motivation')
		.setRequired(false)
		.setLabel('เหตุผลที่ต้องการเข้าร่วม (ไม่จำเป็น)')
		.setStyle(TextInputStyle.Paragraph);

	// An action row only holds one text input,
	// so you need one action row per text input.
	const firstActionRow = new ActionRowBuilder().addComponents(participantsID);
	const secondActionRow = new ActionRowBuilder().addComponents(participantsName);
	const thirdActionRow = new ActionRowBuilder().addComponents(participantsMotivation);

	// Add inputs to the modal
	modal.addComponents(firstActionRow as any, secondActionRow as any, thirdActionRow as any);
	return modal;
};

export const data: commandData = {
	name: 'event-show-participant-modal',
	type: 'modal_submitted',
	data: new SlashCommandBuilder().setName('event-join').setDescription('Join an event'),
};
export async function execute(interaction: CommandInteraction) {}

export async function interaction(interaction: ModalSubmitInteraction, id: string) {
	const fields = interaction.fields as ModalSubmitFields;

	const participantsID = fields.getTextInputValue('event-show-participant-input-id');
	const participantsName = fields.getTextInputValue('event-show-participant-input-name');
	const participantsMotivation = fields.getTextInputValue('event-show-participant-input-motivation');

	const { data, error } = await supabaseClient
		.from('participants')
		.upsert({
			event_id: id,
			participant_id: participantsID,
			participant_name: participantsName,
			participant_motivation: participantsMotivation,
		})
		.select();
	if (error) {
		await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
		return;
	}

	const eventRole = await supabaseClient.from('events').select('event_name, role_name').eq('event_id', id);
	if (eventRole.data === null) {
		await interaction.reply({ content: `Error: ${eventRole.error.message}`, ephemeral: true });
		return;
	}

	const role = interaction.guild?.roles.cache.find((role) => role.name === eventRole.data[0].role_name);
	const member = interaction.member as GuildMember;
	await member.roles.add(role as any);

	await interaction.reply({
		content: `You have joined the ${eventRole.data[0].event_name} event! :tada:`,
		ephemeral: true,
	});
}
