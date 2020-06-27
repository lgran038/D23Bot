const { prefix } = require('../config.json');
const utils = require('../utils.js');

module.exports = {
	name: 'delreminder',
    description: `Deletes a reminder if it is set.`,
    usage: `<name>`,
    args: 1,
    guildOnly: true,
    dbOnly: true,
    minimumRole: "Co-Leader",
	execute(message, args, db) {

        let reminderName = args[0].toLowerCase();
        db.collection('servers').updateOne(
            { id: message.guild.id },
            { $pull: {reminders: { name: reminderName, type: "all" } } }
        ).then(result => {
            let reply = ``;
            if (result.modifiedCount == 0) {
                reply = `${utils.reactError()}. I could not find reminder \`${reminderName}\``;
                reply += `\nTry the \`${prefix}reminders\` command to see the existing reminders.`;
            }
            else {
                reply = `${utils.reactSuccess()}! Successfully deleted reminder \`${reminderName}\`.`;
            }
            
            return message.channel.send(reply);
        });
	},
};