const { prefix } = require('../config.json');
const utils = require('../utils.js');

module.exports = {
	name: 'nick',
    description: 'Sets the nickname of a user.',
    args: 2,
    usage: '<@user> <nickname>',
    guildOnly: true,
    mentions: 1,
    minimumRole: "Co-Leader",
	execute(message, args, db) {
        let authorMember = utils.getGuildMemberByUser(message.author, message.guild);
        if (!authorMember)
            return message.reply(`${utils.reactError()}! I can't find you in this server!`);

        let targetUser = message.mentions.users.first();
        if (!targetUser)
            return message.reply(`${utils.reactError()}! A user mention is required for this command!\nThe proper usage would be: \`${prefix}${this.name} ${this.usage}\``);

        let targetMember = utils.getGuildMemberByUser(targetUser, message.guild);
        if (!targetMember)
            return message.channel.reply(`${utils.reactError()}! Can't find member '${targetUser.username}' in this server`);

        let targetRole = targetMember.roles.highest;
        let authorRole = authorMember.roles.highest;
        if (authorRole && authorRole.comparePositionTo(targetRole) < 1) {
            return message.reply(
                `${utils.reactError()}! It seems like you don't have permissions to set ${args[0]}'s nickname.` +
                `\nYour highest role must be higher than the user's highest role`
            );
        }

        let currentName = targetMember.nickname || targetMember.user.username;
        targetMember.setNickname(args[1]);
        return message.channel.send(
            `${utils.reactSuccess()}! Setting ${currentName}'s nickname to ${args[1]}` + 
            `\n Say Goodbye to **${currentName}** and heeelllooo to **${args[1]}**!` + 
            `\nhttps://media.giphy.com/media/Nx0rz3jtxtEre/giphy.gif`
        );
	},
};