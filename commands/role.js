module.exports = {
	name: 'role',
    description: 'Sets a user\'s role',
    args: true,
    usage: '<user> <role>',
	execute(message, args) {
        return message.channel.send(`Setting ${args[0]}'s role to ${args[1]}`);
	},
};