const moment = require('moment-timezone');

module.exports.initReminders = (db) => {
    if (db) {
        console.log("Initializing reminders");
        db.collection('servers').updateMany(
            {},
            { $set: { "reminders.$[].queued": false }}
        ).then(result => {
           console.log(`${result.matched} reminder(s) found. ${result.modifiedCount} reminders(s) reset.`);
        }).catch(err => {
            console.log(err);
        });
        console.log("Reminder initialization complete");
    }
    else {
        console("Reminder init failed, reattempting in 5 seconds.");
        setTimeout(() => {
            this.initReminders(db);
        }, 5000);
    }
}
/*
TODO: 
It looks like reminders are working.
The current exec time and next exec time should be different by the number of hours it is meant to be repeated.
*/

module.exports.reminderCron = (db, discordClient) => { 
    if (db) {
        console.log('---- START REMINDER CRON JOB ----');

        let soon = moment().add(5, "m").valueOf();

        db.collection('servers').find(
            { "reminders.nextExecTime": {$lt: soon} },
            ).toArray()
            .then(servers => {
                if (!servers.length)
                    return console.log("none found");

                for (let server of servers) {
                    for (let reminder of server.reminders) {
                        let now = moment().valueOf();

                        // Prepare reminder for execution
                        if (reminder.nextExecTime < soon && reminder.nextExecTime > now && !reminder.queued) {   
                            console.log(`Reminder: ${reminder.name} is about to trigger`);
                        
                            if (reminder.hours > 0) {
                                let nextExecTime = moment(reminder.nextExecTime).add(reminder.hours, 'm').valueOf();
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
                                        now = moment().valueOf();
                                        setTimeout(() => {
                                            console.log("***** SetTimeout triggered ******");
                                            console.log(`***** at time ${moment()}`);
                                            let channel = discordClient.channels.cache.find(channel => channel.id == reminder.channelID);
                                            channel.send(reminder.data);
                                            // Update queued to indicate that the reminder is ready to run again.
                                            db.collection('servers').updateOne(
                                                { id: server.id, "reminders.name": reminder.name },
                                                { $set: { "reminders.$.queued": false } }
                                            );
                                        }, Math.abs(reminder.nextExecTime - now));

                                        console.log(`***** reminder updated *****`);
                                    }
                                });
                            }
                            else {
                                db.collection('servers').updateOne(
                                    { id: server.id },
                                    { $pull: { "reminders": { name: reminder.name } } }
                                );
                            }
                        }
                        else if (reminder.nextExecTime < now) {
                            console.log("need correcting");

                            // Corrects reminders on server startup
                            if (reminder.hours > 0) {
                                let iterationsMissed = Math.ceil((now - reminder.nextExecTime)/(reminder.hours * 60000));
                                let newExecTime = moment(reminder.nextExecTime).add(iterationsMissed * reminder.hours, 'm').valueOf();
                                db.collection('servers').updateOne(
                                    { id: server.id, "reminders.name": reminder.name },
                                    { $set: { "reminders.$.nextExecTime": newExecTime } }
                                ).then( result => {
                                    if (result.modifiedCount > 0)
                                        console.log("updated old exec time");
                                    else
                                        console.log("did not update old exec time");
                                });
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

        console.log('---- END REMINDER CRON JOB ----\n');
    }
};