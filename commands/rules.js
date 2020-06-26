const { prefix } = require('../config.json');
const utils = require('../utils.js');

module.exports = {
	name: 'rules',
    description: 'Displays server rules set by !setrules and links to a channel if provided in !setrules',
    guildOnly: true,
    dbOnly: true,
	execute(message, args, db) {
        db.collection('servers').find(
            { id: message.guild.id }
        ).toArray()
            .then(servers => {
                if (!servers.length || !servers[0].rules)
                    return message.channel.send(`${utils.reactError()}! Seems like the rules haven't been set yet.\nTry the \`${prefix}setrules\` command first.`);
                    
                const { channelID, data } = servers[0].rules;
                let channel = null;
                if (channelID)
                    channel = utils.getGuildChannelByID(channelID, message.guild);

                let reply = data;
                if (channel)
                    reply += `\nVisit ${channel} for more details`;

                return message.channel.send(reply);
            })
            .catch(error => {
                console.error(error);
                return message.channel.send(`${utils.reactError()}! Something went wrong.`);
            });
	},
};