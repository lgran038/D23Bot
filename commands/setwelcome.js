const { prefix } = require('../config.json');
const utils = require('../utils.js');
const { getRules } = require('./rules.js'); 

let sampleWelcome = 
            " [[\n" +
            "Welcome to the best server! :muscle:\n" +
            "]]";

module.exports = {
	name: 'setwelcome',
    description: 'Saves the server welcome message to display in the channel provided or current channel when a new member joins the server.' + 
                    '\nIf \'**includeRules**\' is found in your command, then the server rules (if available) will be added to the end of your welcome message',
    usage: '<includeRules> <#channel> <[[Your welcome message here]]>',
    example: `#General includeRules ${sampleWelcome}`,
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
        else {
            channel = message.channel;
            channelID = message.channel.id;
        }

        let regex = /\[\[([\s\S]*?)\]\]/;
        let regexResult = regex.exec(message.content);
        if (!regexResult || !regexResult.length) {
            return message.reply(`${utils.reactError()}! I didn't find any welcome text in your message.` + 
            `\nUse the command \`${prefix}help ${this.name}\` to learn how to use this command`);
        }

        let parsedWelcome = regexResult[1];
        let options = message.content.substring(0, regexResult.index).trim().slice(prefix.length).split(/ +/);
        options.shift();

        let includeRules = false;
        for (let opt of options) {
            if (opt.toLowerCase() == "includerules") {
                includeRules = true;
                break;
            }
        }

        db.collection('servers').findOneAndUpdate(
            { id: message.guild.id },
            {
                $set: { 
                    welcome: {
                        authorID: message.author.id,
                        channelID: channelID, 
                        data: parsedWelcome,
                        includeRules: includeRules
                    }
                }
            },
            { upsert: true }
        )
            .then (() => {
                return message.channel.send(`${utils.reactSuccess()}! Updated server welcome message!`);
            })
            .catch (error => {
                console.error(error);
                return message.channel.send(`${utils.reactError()}. Something went wrong uploading the welcome message. Try again.`);
            });        
	},
};

module.exports.getWelcome = (db, member) => {
    if (db) {
        db.collection('servers').find(
            { id: member.guild.id }
        ).toArray()
            .then(servers => {
                if (!servers.length || !servers[0].welcome)
                    return;
                    
                const { channelID, data, includeRules } = servers[0].welcome;
                let channel = null;
                if (channelID)
                    channel = utils.getGuildChannelByID(channelID, member.guild);
                
                let reply = `${member}\n${data}`;
    
                channel.send(reply);
                if (includeRules)
                    getRules(db, member.guild, channel);

                return;
            })
            .catch(error => {
                console.error(error);
            });
    }
};