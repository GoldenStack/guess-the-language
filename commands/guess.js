import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, Emoji } from 'discord.js';
import { readFile } from "fs";

const fileName = "sources.json";

let sources = {};
readFile(fileName, "UTF-8", (err, data) => {
	if (err) {
		console.log("Error reading file: " + err);
		return;
	}

	sources = Object.values(JSON.parse(data));
})

const allowedLanguages = [
    "JavaScript",
    "HTML",
    "C++",
    "Python",
    "TypeScript",
    "CSS",
    "Dart",
    "C",
    "C#",
    "Go",
    "Java",
    "PHP",
    "Shell",
    "SQL",
    "Elixir",
    "PowerShell",
    "Ruby",
    "Rust",
    "Swift",
    "R",
    "Lua",
    "Zig",
    "Coq",
    "Objective-C",
    "Elm",
    "Scala",
    "Kotlin",
    "Assembly",
    "D",
]

const languageCount = 4;

const maxLineCount = 20;
const maxCharCount = 1000;

function trim(source) {
	return source.split("\n").splice(0, maxLineCount).join("\n").slice(0, maxCharCount);
}

function genLanguages(correct) {
	const languages = [...allowedLanguages]
	.filter(l => l !== correct)
	.sort(() => 0.5 - Math.random())
	.slice(0, languageCount - 1);

	languages.push(correct);
	languages.sort(() => 0.5 - Math.random());	

	return languages;
}

function createLanguageButtons(languages) {
	return languages.map(l => {
		return new ButtonBuilder()
			.setCustomId(l)
			.setLabel(l)
			.setStyle(ButtonStyle.Primary);
	})
}

function embed(color, title, description) {
	return new EmbedBuilder().setColor(color).setTitle(title).setDescription(description);
}

function row(args) {
	return new ActionRowBuilder().addComponents(args);
}

async function execute(interaction) {

	const element = sources[Math.floor(Math.random() * sources.length)];

	const code = trim(element.text);

	const languages = genLanguages(element.language);

	const response = await interaction.reply({
		embeds: [embed(0x0099FF, "What programming language is this?", "```js\n" + code + "\n```")],
		components: [row(createLanguageButtons(languages))],
	});

	const collectorFilter = i => i.user.id === interaction.user.id;

	try {
		const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

		let embeds;
		if (confirmation.customId === element.language) {
			embeds = embed(0x00FF00, "Correct!", "```js\n" + code + "\n```\nThe code was written in **" + element.language + "**");
		} else {
			embeds = embed(0xFF0000, "Incorrect!", "```js\n" + code + "\n```\nThe code was written in **" + element.language + "**");
		}

		await confirmation.reply({
			embeds: [embeds]
		});
		await response.delete();
	} catch (e) {
		console.log(e);
		await interaction.editReply({
			embeds: [embed(0x0099FF, "Time Up!", "```js\n" + code + "\n```\nThe code was written in **" + element.language + "**")]
		});
	}
}

export let guess = {
	data: new SlashCommandBuilder()
		.setName('guess')
		.setDescription('Shows a random code snippet!'),
	execute: execute
};
