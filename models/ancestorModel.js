const format = require('pg-format')
const { Pool } = require('pg');
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

function getAncestors(userId, callback) {
    connectToDatabase((connectionError, client, done) => {
        if (connectionError) {
            callback(connectionError);
            return;
        }
        var query;
        if (userId) {
            query = {
                text: 'SELECT id, given_name, surname, ordinance_needed, gender FROM ancestor WHERE user_id = $1',
                values: [userId]
            };
        } else {
            query = {
                text: 'SELECT id, given_name, surname, ordinance_needed, gender FROM ancestor'
            };
        }

        queryDatabase(query, client, (ancestorErr, ancestorResult) => {
            if (ancestorErr) {
                done();
                callback(ancestorErr);
                return;
            }

            var ancestors = ancestorResult.rows;

            // Return the ancestors
            done();
            callback(null, ancestors);
        });
    });
}

module.exports = {
    getAncestors: getAncestors
}