const Discord = require('discord.js');

module.exports = {    
    name: 'reload',
    description: 'Reloads a command or all commands if no command is supplied',
    usage: '<command>',
    enabled: false,
	execute(message, args, db) {
        let commands = new Discord.Collection();

        if (args.length) {
            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName)
                || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
            if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

            commands.set(command.name, command);
        }
        else {
            commands = message.client.commands;
        }
        
        commands.each((command) => {
            delete require.cache[require.resolve(`./${command.name}.js`)];

            try {
                const newCommand = require(`./${command.name}.js`);
                message.client.commands.set(newCommand.name, newCommand);
                message.channel.send(`Command \`${command.name}\` was reloaded!`);
            } catch (error) {
                console.log(error);
                message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
            }
        });
	},
};