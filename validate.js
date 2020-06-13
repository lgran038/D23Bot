const Discord = require('discord.js');
const { prefix, cooldown } = require('./config.json');
const utils = require('./utils.js');

module.exports.cooldowns = new Discord.Collection();

/**
 * Handles the validation of the discord message
 * @param {Discord.Client} discordClient 
 * @param {Message} message 
 * @param {string []} args 
 */
module.exports.validate = (discordClient, message, args) => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.content.length < 2) return;
    
    const commandName = args.shift().toLowerCase();

    const command = discordClient.commands.get(commandName)
		|| discordClient.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return null;

    if ((command.guildOnly) && message.channel.type !== 'text') {
        message.reply(`I can\'t execute that command inside DMs! ${utils.reactRobot(2)}`);
        return null;
    }

    if (command.minimumRole) {
        let member = utils.getGuildMemberByUser(message.author, message.guild);
        let memberRole = member.roles.highest;
        let role = message.guild.roles.cache.find(role => role.name.toLowerCase() == command.minimumRole.toLowerCase());
        if (!role)
            return null;

        if (memberRole && memberRole.comparePositionTo(role) < 0) {
            message.reply(
                `${utils.reactError()}! It seems like you don\'t have permission to use the ${prefix + command.name} command!` +
                `\nYou must be at least a **${role.name}** to use this command.`
            );

            return null;
        }
    }

    if (command.args && command.args != args.length) {
        let reply = `${utils.reactError()}! You didn't use the correct number of arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        message.channel.send(reply);
        return null;
    }

    if (command.mentions && (message.mentions.users.size + message.mentions.roles.size != command.mentions)) {
        message.reply(`You didn't the correct number of mentions.\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``);
        return null;
    }

    if (!this.cooldowns.has(command.name)) {
        this.cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || cooldown) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
            return null;
        }
    }
    else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    return command;
}