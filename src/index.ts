import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CommandHandlers } from './utils/commandsHandler';
import { commandData, fetchedCommands } from './utils/interface';
const config = await Bun.file('src/config.json').json();
//#region Command Imports
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands: fetchedCommands[] = [];
const foldersPath = path.join(import.meta.dir, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: {
			data: commandData;
			execute?: Function;
			interaction?: Function;
		} = await import(filePath);

		if ('data' in command && 'execute' in command) {
			commands.push({
				name: command.data.name,
				type: command.data.type,
				data: command.data.data,
				execute: command.execute,
				interaction: command.interaction,
			});
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
	console.log('Started refreshing application (/) commands.');

	await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
		body: commands.map((command: fetchedCommands) => command.data.toJSON()),
	});

	console.log('Successfully reloaded application (/) commands.');
} catch (error) {
	console.error(error);
}

const commandHandler = new CommandHandlers(commands);

client.on(Events.InteractionCreate, async (interaction) => {
	commandHandler.execute(interaction);
});
//#endregion

client.login(config.token);
