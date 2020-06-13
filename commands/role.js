const { prefix } = require('../config.json');
const utils = require('../utils.js');

module.exports = {
	name: 'role',
    description: 'Adds a role to a user. If the user already has the role, then the role is removed.',
    args: 2,
    usage: '<@user> <role>',
    guildOnly: true,
    mentions: 1,
    minimumRole: "Co-Leader",
	execute(message, args, db) {
        let authorMember = message.guild.members.cache.find(member => member.user.id == message.author.id);
        if (!authorMember)
            return message.reply(`${utils.reactError()}! I can't find you in this server!`);

        let targetUser = message.mentions.users.first();
        if (!targetUser)
            return message.reply(`${utils.reactError()}! A user mention is required for this command!\nThe proper usage would be: \`${prefix}${this.name} ${this.usage}\``);

        let targetMember = message.guild.members.cache.find(member => member.user.id == targetUser.id);
        let targetRole = message.guild.roles.cache.find(role => role.name.toLowerCase() == args[1].toLowerCase());
        if (!targetMember)
            return message.channel.reply(`${utils.reactError()}! Can't find member '${targetUser.username}' in this server`);

        if (!targetRole)
            return message.channel.reply(`${utils.reactError()}! Can't find role ${args[1]} in this server`);
        
        let authorRole = authorMember.roles.highest;
        if (authorRole && authorRole.comparePositionTo(targetRole) < 1) {
            return message.reply(
                `${utils.reactError()}! It seems like you don't have permissions to set ${args[0]}'s role to ${targetRole.name}.` +
                `\nYour highest role must be higher than the role you are setting`
            );
        }

        if (targetMember.roles.cache.find(role => role.id == targetRole.id)) {
            targetMember.roles.remove(targetRole);
            return message.channel.send(`${utils.reactSuccess()}! Removing role **${targetRole.name}** from ${args[0]}`);
        }
        else {
            targetMember.roles.add(targetRole);
            return message.channel.send(`${utils.reactSuccess()}! Adding role **${targetRole.name}** to ${args[0]}`);
        }
    
        
	},
};