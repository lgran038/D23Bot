module.exports.initGuilds = (db, discordClient, guildID) => {
    let initGuild = (id) => {
        db.collection('servers').updateOne(
            { id: id },
            { $setOnInsert: { "reminders": [] }},
            { upsert: true }
        ).then( () => {
            console.log(`Guilds initialized!`);
         }).catch(err => {
             console.log(err);
         });
    };

    if (db && discordClient) {
        if (guildID) {
            initGuild(guildID);
        }
        else {
            discordClient.guilds.cache.forEach(guild => {
                initGuild(guild.id);
            });
        }   
    }
    else {
        console("Guild(s) init failed, reattempting in 5 seconds.");
        setTimeout(() => {
            this.initGuilds(db, discordClient);
        }, 5000);
    }
}