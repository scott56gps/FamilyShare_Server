const db = require('./dbFunctions');
const aws = require('./awsFunctions');

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

function createAncestor(ancestorDto, templeCardDto, callback) {
    // First, put the templeCard into AWS
    aws.savePdfToAWS(templeCardDto, (awsError) => {
        if (awsError) {
            callback(awsError);
            return;
        }

        // Now, put the ancestor in the database
        var givenNames = ancestorDto.givenNames
        var surname = ancestorDto.surname
        var ordinanceNeeded = ancestorDto.ordinanceNeeded
        var familySearchId = ancestorDto.familySearchId
        var gender = ancestorDto.gender

        db.connectToDatabase((connectionError, client, done) => {
            if (connectionError) {
                callback(connectionError);
                return;
            }

            var query = {
                text: 'INSERT INTO ancestor(given_name, surname, ordinance_needed, user_id, fs_id, gender) VALUES ($1, $2, $3, NULL, $4, $5) RETURNING given_name, surname, ordinance_needed, user_id, fs_id, gender',
                values: [givenNames, surname, ordinanceNeeded, familySearchId, gender]
            }

            db.queryDatabase(query, client, (ancestorError, ancestorResult) => {
                if (ancestorError) {
                    done();
                    callback(ancestorError);
                    return;
                }

                var ancestor = ancestorResult.rows[0];

                callback(null, ancestor);
            })
        })
    })
}

module.exports = {
    getAncestors: getAncestors,
    createAncestor: createAncestor
}