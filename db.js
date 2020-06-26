const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const {
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
} = process.env;

const dbURL = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/`;

const options = {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}

let _db;

module.exports.getDb = () => {return _db};

try {
    // Connect to the MongoDB cluster
    MongoClient.connect(dbURL, options, function (err, client) {
        if (err) throw err;

        console.log("Database Ready!");
        _db = client.db(MONGO_DB);
    });

} catch (e) {
    console.error(e);
}