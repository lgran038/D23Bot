const { prefix } = require('../config.json');
const utils = require('../utils.js');

module.exports = {
	name: 'setrules',
    description: 'Saves the server rules and links the channel provided if given',
    usage: '<#channel> <[[Your rules here]]>',
    guildOnly: true,
    minimumRole: "Co-Leader",
	execute(message, args, db) {
        
        let authorMember = utils.getGuildMemberByUser(message.author, message.guild);
        if (!authorMember)
            return message.reply(`${utils.reactError()}! I can't find you in this server!`);

        let channelID = null;
        let channel = message.mentions.channels.first();
        if (channel && channel.type == "text")
            channelID = channel.id;

        let regex = /\[\[([\s\S]*?)\]\]/;
        let regexResult = regex.exec(message.content);
        if (!regexResult || !regexResult.length) {
            let sampleChannel = ` #DaRules`;
            let sampleRules = 
            " [[\n" +
            ":straight_ruler: Rules to being a good bot :straight_ruler: \n" +
            ":white_small_square: Oil your gears daily! :gear: \n" +
            ":white_small_square: :battery: A full charge a day keeps the Doctor away :woman_health_worker:\n" +
            ":white_small_square: Have fun and chat with friends! :satellite:\n" +
            "]]";
            let reply = 
            `${utils.reactRobot(2)}. Here's how you use the \`${prefix}${this.name}\` command.\n` +
            `**Usage:** ${prefix}${this.name} ${this.usage}\n` + 
            `**Example:**\n\n` +
            prefix + this.name + sampleChannel + sampleRules;

            return message.author.send(reply, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply(
                        `${utils.reactError()}. I didn't find any rules in your message.` + 
                        `\nI\'ve sent you a DM with a sample of how to use the \`${prefix}${this.name}\` command. ${utils.reactRobot(2)}.`
                    );
                })
                .catch(error => {
                    console.error(`${utils.reactError()}. Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }

        let parsedRules = regexResult[1];
        const commandsCollection = db.collection('commands');
        commandsCollection.findOneAndUpdate(
            { name: 'rules' },
            {
                $set: { 
                    userID: message.author.id,
                    channelID: channelID, 
                    data: parsedRules
                }
            },
            { upsert: true }
        )
            .then (() => {
                return message.channel.send(`${utils.reactSuccess()}! Updated server rules!\nUse the \`${prefix}rules\` command to view them!`);
            })
            .catch (error => {
                console.error(error);
                return message.channel.send(`${utils.reactError()}. Something went wrong uploading the rules. Try again.`);
            });        
	},
};