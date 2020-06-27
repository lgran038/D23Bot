const { prefix } = require('../config.json');
const utils = require('../utils.js');
const Discord = require('discord.js');

module.exports = {
	name: 'rules',
    description: 'Displays server rules set by !setrules and links to a channel if provided in !setrules',
    guildOnly: true,
    dbOnly: true,
	execute(message, args, db) {
        this.getRules(db, message.guild, message.channel);
	},
};

module.exports.getRules = (db, guild, replyChannel, embeded) => {
    if (db) {
        if (replyChannel) {
            db.collection('servers').find(
                { id: guild.id }
            ).toArray()
                .then(servers => {
                    if (!servers.length || !servers[0].rules)
                        return replyChannel.send(`${utils.reactError()}! Seems like the rules haven't been set yet.\nTry the \`${prefix}setrules\` command first.`);
                        
                    const { channelID, data } = servers[0].rules;
                    let channel = null;
                    if (channelID)
                        channel = utils.getGuildChannelByID(channelID, guild);
        
                    let reply = data;
                    if (channel)
                        reply += `\nVisit ${channel} for more details`;
        
                    const embed = new Discord.MessageEmbed().setDescription(reply);
                    return replyChannel.send(embed);
                })
                .catch(error => {
                    console.error(error);
                    return replyChannel.send(`${utils.reactError()}! Something went wrong.`);
                });
        }
    }
};