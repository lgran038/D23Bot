const utils = require('../utils.js');

module.exports = {
	name: 'cooldown',
    description: 'Sets the cooldown of a command. Minimum is 3 seconds',
    args: 2,
    usage: '<command> <seconds>',
    guildOnly: true,
    minimumRole: "Co-Leader",
	execute(message, args, db) {
        let seconds = args[1];

        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

        if (isNaN(seconds))
            return message.reply(`! ${seconds} is not a number.`);

        command.cooldown = seconds < 3 ? 3 : seconds;
        return message.channel.send(`${utils.reactRobot(2)}. Command \`${commandName}\`'s cooldown has been set to ${command.cooldown} seconds`);
	},
};