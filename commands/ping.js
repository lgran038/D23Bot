module.exports = {
    name: 'ping',
    aliases: ['pang', 'pung'],
    cooldown: 5,
    execute(message, args) {
        message.channel.send('Pong.');
    },
};