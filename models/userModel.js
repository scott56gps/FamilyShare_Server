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

function loginUser(username, callback) {
    db.connectToDatabase((connectionError, client, done) => {
        if (connectionError) {
            callback(connectionError);
            return;
        }

        console.log(username)

        var query = {
            text: 'SELECT user_id FROM "user" WHERE username = $1',
            values: [username]
        };

        db.queryDatabase(query, client, (userError, userResult) => {
            if (userError) {
                done();
                callback(userError);
                return;
            }

            console.log(userResult)

            var userId = userResult.rows[0]['user_id'];

            callback(null, userId);
        })
    })
}

module.exports = {
    createUser: createUser,
    loginUser: loginUser
}