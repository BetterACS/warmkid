import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

const commands = [
	{
		name: 'ping',
		description: 'Replies with Pong!',
	},
];

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN as string);

try {
	console.log('Started refreshing application (/) commands.');

	await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID as string), { body: commands });

	console.log('Successfully reloaded application (/) commands.');
} catch (error) {
	console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
	console.log(`Logged in as warmkid!`);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
});

client.login(process.env.DISCORD_BOT_TOKEN as string);
