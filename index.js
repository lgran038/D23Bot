
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, dbURL, dbName } = require('./config.json');
const utils = require('./utils.js');
const { validate } = require('./validate.js');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Create a new MongoClient
const dbClient = new MongoClient(dbURL, {useUnifiedTopology: true});

// Use connect method to connect to the Server
dbClient.connect(function(err) {
    assert.equal(null, err);
    console.log("Database Ready!");
    
    const db = dbClient.db(dbName);
    startBot(db);

    //dbClient.close();
});

let startBot = (db) => {
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
    });
    
    discordClient.on('message', message => {
    
        const args = message.content.slice(prefix.length).split(/ +/);
    
        const command = validate(discordClient, message, args);
        if (!command)
            return;
    
        try {
            command.execute(message, args, db);
        } catch (error) {
            console.error(error);
            message.reply(`${utils.reactError()}! There was an error trying to execute that command!`);
        }
    });
    
    // login to Discord with your app's token
    discordClient.login(token);
}

