const { Pool } = require('pg');

// Configure Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

function connectToDatabase(callback) {
    pool.connect(function (connectError, client, done) {
        if (connectError) {
            callback(connectError);
        }

        callback(null, client, done);
    });
}

function queryDatabase(query, client, callback) {
    // Query the Database
    client.query(query, function (queryError, queryResult) {
        if (queryError) {
            callback(queryError);
        }

        callback(null, queryResult)
    })
}

module.exports = {
    connectToDatabase: connectToDatabase,
    queryDatabase: queryDatabase
}