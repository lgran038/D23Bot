const { prefix } = require('../config.json');
const utils = require('../utils.js');
const moment = require('moment-timezone');

// moment().tz("America/Los_Angeles").isDST() ? "PDT" : "PST"
// moment().tz("America/New_York").isDST() ? "EDT" : "EST"

module.exports = {
	name: 'remindall',
    description: `Sets a reminder for all rounded up to the nearest 15 minutes to repeat every set number of hours if provided.` 
                + `\nThe reminder will be sent in the channel where it was set.`,
    usage: `<name> <HH:MM time start ${moment().tz("America/Los_Angeles").isDST() ? "PDT" : "PST"}> <every X hours> <[[reminder]]>`,
    example: `cogs 15:30 24 [[ Daily reminder to oil your cogs! ]]`,
    guildOnly: true,
    dbOnly: true,
    minimumRole: "Co-Leader",
	execute(message, args, db) {
        
        let authorMember = utils.getGuildMemberByUser(message.author, message.guild);
        if (!authorMember)
            return message.reply(`${utils.reactError()}! I can't find you in this server!`);

        let channelID = message.channel.id;

        let regex = /\[\[([\s\S]*?)\]\]/;
        let regexResult = regex.exec(message.content);
        if (!regexResult || !regexResult.length) {
            return message.reply(`${utils.reactError()}! I can\'t find a reminder in your message.` + 
            `\nUse the command \`${prefix}help ${this.name}\` to learn how to use this command`);
        }

        let parsedReminder = regexResult[1];
        let options = message.content.substring(0, regexResult.index).trim().slice(prefix.length).split(/ +/);
        options.shift();
        
        let name, timeInput = null;
        let hours = 0;
        if (options.length < 2 || !(/^[a-zA-Z]+$/.test(options[0])) || !(/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(options[1]))) {
            return message.reply(`${utils.reactError()}! At least a name and time are needed to set a reminder.` + 
            `\nUse the command \`${prefix}help ${this.name}\` for more details.`);
        }
        else {
            
            name = options[0].toLowerCase();
            
            timeInput = options[1];

            // let utcOffset = moment().tz("America/New_York").isDST() ? "-0400" : "-0500";
            // let timezone = utcOffset == "-0400" ? "EDT" : "EST";
            let utcOffset = moment().tz("America/Los_Angeles").isDST() ? "-0700" : "-0800";
            let timezone = utcOffset == "-0700" ? "PDT" : "PST";
            
            let nowMoment = moment().utcOffset(utcOffset);
            let hhmm = options[1].split(":");
            let roundedMins = Math.ceil(hhmm[1]/15) * 15;
            let targetMoment = moment().utcOffset(utcOffset).hours(parseInt(hhmm[0])).minutes(parseInt(roundedMins)).seconds(0);

            if (targetMoment.isBefore(nowMoment))
                targetMoment.add(1, 'd');

            if (options.length > 2 && !isNaN(options[2])) {
                hours = parseInt(options[2], 10);
            }

            let reminder = {
                type: 'all',
                name: name, 
                startTime: targetMoment.valueOf(),
                currentExecTime: targetMoment.valueOf(),
                nextExecTime: targetMoment.valueOf(),
                hours: hours,
                data: parsedReminder,
                channelID: channelID,
                authorID: message.author.id,
                queued: false
            };

            db.collection('servers').updateOne(
                { id: message.guild.id, reminders: { $not: { $elemMatch: { name: name, type: 'all' } } } },
                { $push: { reminders: reminder } },
            )
                .then ((result) => {
                    let numModified = result.result.nModified;
                    if (numModified == 0) {                        
                        db.collection('servers').updateOne(
                            { id: message.guild.id, reminders: { $elemMatch: { name: name, type: 'all' } } },
                            { $set: { "reminders.$": reminder } },
                        )
                            .catch((error) => {
                                console.log(error);
                                return message.channel.send(`${utils.reactError()}. Something went wrong uploading the reminder. Try again.`);
                            });
                    }

                    let displayAt = `${moment(reminder.startTime).utcOffset(utcOffset).calendar()} ${timezone}`;
                    let reply = `${utils.reactSuccess()}! Updated reminder \`${reminder.name}\``;
                    reply += ` to be displayed \`${displayAt}\``;
                    if (reminder.hours > 0)
                        reply += ` and repeat every \`${reminder.hours}\` hour(s) from then`;

                    reply += `.\nUse the \`${prefix}reminders\` command to view it!`

                    return message.channel.send(reply);
                })
                .catch (error => {
                    console.error(error);
                    return message.channel.send(`${utils.reactError()}. Something went wrong uploading the reminder. Try again.`);
                });   
        }
	},
};