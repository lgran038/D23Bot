module.exports = {
    name: 'hello',
    aliases: ['hi', 'hey'],
    cooldown: 5,
    execute(message, args) {
        message.channel.send('Beep Boop. Bot is under construction!');
    },
};