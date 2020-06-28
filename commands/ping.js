module.exports = {
    name: 'ping',
    description: 'I just reply Pong. Don\'t need a good reason for everything! :stuck_out_tongue_winking_eye:',
    dbOnly: true,
    execute(message, args, db) {
        message.channel.send('Pong.');
    },
};