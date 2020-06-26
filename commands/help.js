const { prefix, cooldown } = require('../config.json');
const utils = require('../utils.js');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '<command>',
	cooldown: 1,
	execute(message, args, db) {
		const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push(`${utils.reactRobot(2)}. Here\'s a list of all my commands:`);
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply(`I\'ve sent you a DM with all my commands! ${utils.reactSuccess()}!`);
                })
                .catch(error => {
                    console.error(`${utils.reactError()}. Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply(`${utils.reactError()}! \`${prefix}${name}\`\'s not a valid command!`);
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
        if (command.example) data.push(`**Example:** ${prefix}${command.name} ${command.example}`);
        if (command.minimumRole) data.push(`**Required Role:** Must be at least a(n) ${command.minimumRole}`);

        data.push(`**Cooldown:** ${command.cooldown || cooldown} second(s)`);

        message.channel.send(data, { split: true });
    },
};