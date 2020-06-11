module.exports = {
    name: 'ping',
    description: 'I just reply Pong. Don\'t need a good reason for everything! :stuck_out_tongue_winking_eye:',
    execute(message, args) {
        message.channel.send('Pong.');
    },
};