const moment = require('moment-timezone');

module.exports = {
    name: 'ping',
    description: 'I just reply Pong. Don\'t need a good reason for everything! :stuck_out_tongue_winking_eye:',
    dbOnly: true,
    execute(message, args, db) {
        message.channel.send('Pong.');
        console.log("----- Ping Start -----");

        let soon = moment().add(5, "m").valueOf();
        console.log(soon.valueOf());

        db.collection('servers').find(
            { "reminders.nextExecTime": {$lt: soon} },
            ).toArray()
            .then(servers => {
                if (!servers.length)
                    return console.log("none found");

                for (let server of servers) {
                    for (let reminder of server.reminders) {
                        if (reminder.nextExecTime < soon) {

                            let now = moment().valueOf();
                            setTimeout(() => {
                                console.log("***** SetTimeout triggered ******");
                                console.log(`***** at time ${moment()}`);
                                let channel = message.guild.channels.cache.find(channel => channel.id == reminder.channelID);
                                channel.send(reminder.data);
                            }, Math.abs(reminder.nextExecTime - now));

                            console.log(`Reminder: ${reminder.name} is about to trigger`);
                        
                            if (reminder.hours > 0) {
                                let nextExecTime = moment(reminder.nextExecTime).add(reminder.hours, 'h').valueOf();
                                db.collection('servers').updateOne(
                                    { id: server.id, "reminders.name": reminder.name },
                                    { $set: { "reminders.$.nextExecTime":  nextExecTime} }
                                );
                            }
                            else {
                                db.collection('servers').updateOne(
                                    { id: server.id },
                                    { $pull: { "reminders": { name: reminder.name } } }
                                )
                            }
                        }
                    }
                }
                console.log("----- Ping End -----");
            })
            .catch(error => {
                console.log(error);
            })

            
    },
};