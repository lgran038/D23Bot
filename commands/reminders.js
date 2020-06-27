const { prefix } = require('../config.json');
const utils = require('../utils.js');
const moment = require('moment-timezone');

module.exports = {
	name: 'reminders',
    description: `Returns a list of existing reminders`,
    guildOnly: true,
    dbOnly: true,
    minimumRole: "Co-Leader",
	execute(message, args, db) {

        let utcOffset = moment().tz("America/New_York").isDST() ? "-0400" : "-0500";
        let timezone = utcOffset == "-0400" ? "EDT" : "EST";

        db.collection('servers').findOne(
            { id: message.guild.id }
        ).then(result => {
            
            if (result.reminders.length) {
                let reminderList = [];
                reminderList.push(`${utils.reactRobot(2)}. Here is a list of reminders for the server **${message.guild.name}**:\n`);
                for (let reminder of result.reminders) {
                    if (reminder.type == "all") {
                        reminderList.push(`**----------------**`);
                        reminderList.push(`**Name:** \`${reminder.name}\``);

                        let displayAt = `${moment(reminder.currentExecTime).utcOffset(utcOffset).calendar()} ${timezone}`;
                        let when = `**To be displayed at:** \`${displayAt}\``;
                        if (reminder.hours > 0)
                            when += ` and repeat every \`${reminder.hours}\` hour(s)`;

                        reminderList.push(when);

                        let channel = utils.getGuildChannelByID(reminder.channelID, message.guild)
                        if (channel)
                            reminderList.push(`**Channel:** \`${channel.name}\``);

                        let authorMember = utils.getGuildMemberByID(reminder.authorID, message.guild);
                        if (authorMember) {
                            let authorName = authorMember.nickname ? authorMember.nickname : authorMember.user.username;
                            reminderList.push(`**Author:** \`${authorName}\``);
                        }

                        reminderList.push(`**Message**:`);
                        reminderList.push(reminder.data);
                        reminderList.push(`**----------------**`);
                    }
                }

                if (reminderList.length > 1) {
                    return message.author.send(reminderList, { split: true })
                        .then(() => {
                            if (message.channel.type === 'dm') return;
                            message.reply(`I've sent you a DM with all the active reminders! ${utils.reactSuccess()}!`);
                        })
                        .catch(error => {
                            console.error(`${utils.reactError()}. Could not send help DM to ${message.author.tag}.\n`, error);
                            message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                        });
                }
            }
            else {
                let reply = `${utils.reactRobot(3)}. It seems like there are no active reminders.`;
                reply += `\nTry the command \`${prefix}remindall\` to set a new reminder.`;
                return message.channel.send(reply);
            }
        });
	},
};

module.exports.initReminders = (db, discordClient) => {
    if (db) {
        db.collection('servers').updateMany(
            {},
            { $set: { "reminders.$[].queued": false }}
        ).then( () => {
           console.log(`Reminders initialized!`);
        }).catch(err => {
            console.log(err);
        });

        module.exports.reminderCron(db, discordClient, true);
    }
    else {
        console("Reminder init failed, reattempting in 5 seconds.");
        setTimeout(() => {
            this.initReminders(db, discordClient);
        }, 5000);
    }
};

module.exports.reminderCron = (db, discordClient, isInit) => { 

    let runReminder = (db, server, reminder) => {
        let now = moment().valueOf();
        setTimeout(() => {
            // console.log("***** SetTimeout triggered ******");
            // console.log(`***** at time ${moment()}`);
            let channel = discordClient.channels.cache.find(channel => channel.id == reminder.channelID);
            if (channel)
                channel.send(reminder.data);
            // Update queued to indicate that the reminder is ready to run again.
            db.collection('servers').updateOne(
                { id: server.id, "reminders.name": reminder.name },
                { $set: { "reminders.$.queued": false } }
            );
        }, Math.abs(reminder.nextExecTime - now));
    };

    if (db) {
        // console.log('---- START REMINDER CRON JOB ----');

        let soon = moment().add(16, "m").valueOf();

        let filter = isInit ? {} : { "reminders.nextExecTime": {$lt: soon} };
        db.collection('servers').find(
            filter,
            ).toArray()
            .then(servers => {
                if (!servers.length)
                    return;

                for (let server of servers) {
                    for (let reminder of server.reminders) {
                        let now = moment().valueOf();
                        
                        // Prepare reminder for execution
                        if (reminder.nextExecTime < soon && reminder.nextExecTime > now && !reminder.queued) {   
                            // console.log(`Reminder: ${reminder.name} is about to trigger`);
                        
                            if (reminder.hours > 0) {
                                let nextExecTime = moment(reminder.nextExecTime).add(reminder.hours, 'h').valueOf();
                                db.collection('servers').updateOne(
                                    { id: server.id, reminders: { $elemMatch: { name: reminder.name, queued: false } } },
                                    { $set: { 
                                            "reminders.$.nextExecTime":  nextExecTime, 
                                            "reminders.$.currentExecTime": reminder.nextExecTime,
                                            "reminders.$.queued": true
                                        } 
                                    }
                                ).then(result => {
                                    if (result.modifiedCount > 0) {
                                        runReminder(db, server, reminder);
                                    }
                                });
                            }
                            else {
                                runReminder(db, server, reminder);
                                
                                db.collection('servers').updateOne(
                                    { id: server.id },
                                    { $pull: { "reminders": { name: reminder.name } } }
                                );
                            }
                        }
                        else if (reminder.nextExecTime < now) {
                            // Corrects reminders on server startup
                            // console.log("Updating reminder execution time.");
                            if (reminder.hours > 0) {
                                let iterationsMissed = Math.ceil((now - reminder.nextExecTime)/(reminder.hours * 3600 * 1000));
                                let newExecTime = moment(reminder.nextExecTime).add(iterationsMissed * reminder.hours, 'h').valueOf();
                                db.collection('servers').updateOne(
                                    { id: server.id, "reminders.name": reminder.name },
                                    { $set: { "reminders.$.nextExecTime": newExecTime } }
                                );
                            }
                            else {
                                // Delete the expired reminder
                                db.collection('servers').updateOne(
                                    { id: server.id },
                                    { $pull: { "reminders": { name: reminder.name } } }
                                );
                            }
                        }
                    }
                }
            })
            .catch(error => {
                console.log(error);
            })

        // console.log('---- END REMINDER CRON JOB ----\n');
    }
};