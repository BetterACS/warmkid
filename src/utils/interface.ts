import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

type commandType = 'chat' | 'modal_submitted' | 'button_clicked';

interface commandData {
	name: string;
	type: commandType;
	data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
}

interface fetchedCommands extends commandData {
	execute: Function | undefined;
	interaction: Function | undefined;
}

export { commandData, commandType, fetchedCommands };
