const { prefix } = require('../config.json');
const utils = require('../utils.js');

let sampleRules = 
            " [[\n" +
            ":straight_ruler: Rules to being a good bot :straight_ruler: \n" +
            ":white_small_square: Oil your gears daily! :gear: \n" +
            ":white_small_square: :battery: A full charge a day keeps the Doctor away :woman_health_worker:\n" +
            ":white_small_square: Have fun and chat with friends! :satellite:\n" +
            "]]";

module.exports = {
	name: 'setrules',
    description: 'Saves the server rules and links the channel provided if given',
    usage: '<#channel> <[[Your rules here]]>',
    example: `#DaRules ${sampleRules}`,
    guildOnly: true,
    dbOnly: true,
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
            return message.reply(`${utils.reactError()}! I didn't find any rules in your message.` + 
            `\nUse the command \`${prefix}help ${this.name}\` to learn how to use this command`);
        }

        let parsedRules = regexResult[1];
        db.collection('servers').findOneAndUpdate(
            { id: message.guild.id },
            {
                $set: { 
                    rules: {
                        authorID: message.author.id,
                        channelID: channelID, 
                        data: parsedRules
                    }
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