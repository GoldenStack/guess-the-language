import {Client, Events, GatewayIntentBits} from 'discord.js';
import { guess } from './commands/guess.js'

const client = new Client({intents: [GatewayIntentBits.Guilds]});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

client.on(Events.InteractionCreate, async interaction => {
	console.log(interaction + ", " + interaction.isButton() + ", " + interaction["customId"]);
	if (!interaction.isChatInputCommand()) return;

	try {
		await guess.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});
