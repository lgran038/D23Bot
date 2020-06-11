
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, cooldown } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.hasOwnProperty("enabled") && !command.enabled)
        continue;

    if (command.minumumRole)
        command.guildOnly = true;

    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.content.length < 2) return;
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if ((command.guildOnly) && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.minimumRole) {
        let member = message.guild.members.cache.find(member => member.user.id == message.author.id);
        let memberRole = member.roles.highest;
        let role = message.guild.roles.cache.find(role => role.name.toLowerCase() == command.minimumRole.toLowerCase());
        if (!role)
            return;

        if (memberRole && memberRole.comparePositionTo(role) < 0) {
            return message.reply(
                `Uh oh! It seems like you don\'t have permission to use the ${prefix + command.name} command!` +
                `\nYou must be at least a **${role.name}** to use this command.`
            );
        }
    }

    if (command.args && command.args != args.length) {
        let reply = `You didn't use the correct number of arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }

    if (command.mentions && (message.mentions.users.size + message.mentions.roles.size != command.mentions)) {
        return message.reply(`You didn't the correct number of mentions.\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || cooldown) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

// login to Discord with your app's token
client.login(token);