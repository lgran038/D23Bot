const mongoose = reqire('mongoose');
const Schema = mongoose.Schema;

const Mention = new Schema ({
    type: { type: String, required: true },
    value: { type: String, required: true }
});

module.exports = mongoose.model('Mention', Mention);