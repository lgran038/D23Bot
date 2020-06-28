
const fs = require('fs');
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const utils = require('./utils.js');
const { validate } = require('./validate.js');
const dbServer = require('./db.js');
const cron = require("node-cron");
const { reminderCron , initReminders } = require('./commands/reminders.js');
const { initGuilds } = require('./guilds.js');
const { getRules } = require('./commands/rules.js');
const { getWelcome } = require('./commands/setwelcome.js'); 
require('dotenv').config();

const {
    DISCORD_TOKEN,
} = process.env;

const discordClient = new Discord.Client();
discordClient.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.hasOwnProperty("enabled") && !command.enabled)
        continue;

    if (command.minumumRole)
        command.guildOnly = true;

    discordClient.commands.set(command.name, command);
}

discordClient.once('ready', () => {
    console.log('Discord Client Ready!');

    const db = dbServer.getDb();
    initGuilds(db, discordClient, "");
    initReminders(db, discordClient);

    // runs job every X minutes
    let interval = 10;
    cron.schedule(`*/${interval} * * * *`, function () {
        reminderCron(db, discordClient, false);
    });
    
});

discordClient.on('message', message => {

    const db = dbServer.getDb();

    const args = message.content.slice(prefix.length).split(/ +/);

    const command = validate(discordClient, message, args, db);
    if (!command)
        return;

    try {
        command.execute(message, args, db);
    } catch (error) {
        console.error(error);
        message.reply(`${utils.reactError()}! There was an error trying to execute that command!`);
    }
});

discordClient.on('guildMemberAdd', member => {
    const db = dbServer.getDb();
    getWelcome(db, member);
});

discordClient.on('guildCreate', guild => {
    const db = dbServer.getDb();
    initGuilds(db, discordClient, guild.id);
});

// login to Discord with your app's token
discordClient.login(DISCORD_TOKEN).catch(err => {
    console.log(err);
});