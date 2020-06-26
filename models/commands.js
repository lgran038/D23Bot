const mongoose = reqire('mongoose');
const Schema = mongoose.Schema;
const Mention = require('./mentions.js');

const Command = new Schema ({
    name: { type: String, required: true },
    authorID: { type: String, required: true },
    mentions: [Mention],
    args: [ {type: String} ]
});

module.exports = mongoose.model('Command', Command);