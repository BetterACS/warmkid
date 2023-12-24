import { Interaction } from 'discord.js';
import { commandType, fetchedCommands } from './interface';

interface groupedCommands {
	type: commandType;
	commands: Array<fetchedCommands>;
}

class CommandHandlers {
	commands: Array<fetchedCommands>;
	groupedCommands: groupedCommands[] = [];
	constructor(commands: Array<fetchedCommands>) {
		this.commands = commands;
		this.groupCommands();
		console.log(this.groupedCommands);
	}

	async groupCommands() {
		for (const command of this.commands) {
			if (this.groupedCommands.find((group) => group.type === command.type)) {
				this.groupedCommands.find((group) => group.type === command.type)?.commands.push(command);
			} else {
				this.groupedCommands.push({
					type: command.type,
					commands: [command],
				});
			}
		}
	}

	async execute(interaction: Interaction) {
		if (interaction === null || interaction === undefined) return;
		if (interaction.isChatInputCommand()) {
			for (const command of this.groupedCommands.find((group) => group.type === 'chat')?.commands || []) {
				if (interaction.commandName !== command.name || !command.execute) continue;
				command.execute(interaction);
			}
		} else if (interaction.isModalSubmit()) {
			for (const command of this.groupedCommands.find((group) => group.type === 'modal_submitted')?.commands ||
				[]) {
				const [commandName, id] = interaction.customId.split('.');
				if (!command.name.includes(commandName) || !command.interaction) continue;
				console.log(commandName, id);
				command.interaction(interaction, id);
			}
		} else if (interaction.isButton()) {
			for (const command of this.groupedCommands.find((group) => group.type === 'button_clicked')?.commands ||
				[]) {
				const [commandName, id] = interaction.customId.split('.');
				if (!command.name.includes(commandName) || !command.interaction) continue;
				command.interaction(interaction, id);
			}
		}
	}
}

export { CommandHandlers };
