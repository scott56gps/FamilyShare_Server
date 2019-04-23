const db = require('./dbFunctions');

function getAncestors(userId, callback) {
    db.connectToDatabase((connectionError, client, done) => {
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
                text: 'SELECT id, given_name, surname, ordinance_needed, gender FROM ancestor WHERE user_id = NULL'
            };
        }

        db.queryDatabase(query, client, (ancestorErr, ancestorResult) => {
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