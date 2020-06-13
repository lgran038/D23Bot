// Supplementary Functions

/**
 * Returns the member object of the user within the specified guild
 * @param {User} user 
 * @param {Guild} guild 
 */
module.exports.getGuildMemberByUser = (user, guild) => {
    return guild.members.cache.find(member => member.user.id == user.id);
}

/**
 * Returns the member object of the user within the specified guild
 * @param {string} channelID 
 * @param {Guild} guild 
 */
module.exports.getGuildChannelByID = (channelID, guild) => {
    return guild.channels.cache.find(channel => channel.id == channelID);
}

module.exports.reactions = [
    ["Woo", "Hooray", "Yeah", "Alas", "Whoopee", "Hurrah", "Boomshakalaka"],
    ["Ruh-Roh", "Uh-Oh", "Oops", "Yikes", "Oh no", "Darn", "Dangnabbit"],
    ["Beep", "Boop", "Bop", "Bzzt"]
];

module.exports.reactionType = [ "SUCCESS", "ERROR", "ROBOT" ];

/**
 * Returns a random reaction of the given type
 * @param {int} type 
 */
module.exports.react = (type) => {
    return this.reactions[type][Math.floor(Math.random() * this.reactions[type].length)];
}

/**
 * Returns a random success reaction
 */
module.exports.reactSuccess = () => {
    return this.react(this.reactionType.indexOf("SUCCESS"));
}

/**
 * Returns a random error reaction
 */
module.exports.reactError = () => {
    return this.react(this.reactionType.indexOf("ERROR"));
}

/**
 * Returns a random robot reaction
 */
module.exports.reactRobot = (amount) => {
    let reaction = "";
    let count = 0;
    while (count < amount) {
        reaction += this.react(this.reactionType.indexOf("ROBOT")) + " ";
        count++;
    }

    return reaction.substr(0, reaction.length - 1);
}