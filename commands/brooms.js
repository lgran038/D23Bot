module.exports = {
    name: 'brooms',
    aliases: ['broom', 'donations'],
    description: 'Reminds sorcerers to donate brooms!',
    cooldown: 5,
    execute(message, args) {
        message.channel.send(':clock1: :arrow_up: :broom: :door: ');
    },
};