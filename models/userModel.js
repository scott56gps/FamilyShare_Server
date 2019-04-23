const db = require('./dbFunctions');

function createUser(username, callback) {
    db.connectToDatabase((connectionError, client, done) => {
        if (connectionError) {
            callback(connectionError);
            return;
        }

        var query = {
            text: 'INSERT INTO "user"(username) VALUES ($1) RETURNING username',
            values: [username]
        };

        db.queryDatabase(query, client, (userError, userResult) => {
            if (userError) {
                done();
                callback(userError);
                return;
            }

            var user = userResult.rows[0];

            // Return the newly created user
            done();
            callback(null, user);
        })
    })
}

module.exports = {
    createUser: createUser
}