const { prefix } = require('../config.json');
const utils = require('../utils.js');

module.exports = {
	name: 'rules',
    description: 'Displays server rules set by !setrules and links to a channel if provided in !setrules',
    guildOnly: true,
	execute(message, args, db) {
        const commandsCollection = db.collection('commands');
        commandsCollection.find(
            { name: 'rules' }
        ).toArray()
            .then(results => {
                if (!results.length || !results[0].data)
                    return message.channel.send(`${utils.reactError()}! Seems like the rules haven't been set yet.\nTry the \`${prefix}setrules\` command first.`);
                    
                const {userID, channelID, data } = results[0];
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