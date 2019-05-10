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
                text: 'SELECT id, given_name, surname, ordinance_needed, gender FROM ancestor WHERE user_id IS NULL'
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
                text: 'INSERT INTO ancestor(given_name, surname, ordinance_needed, user_id, fs_id, gender) VALUES ($1, $2, $3, NULL, $4, $5) RETURNING id, given_name, surname, ordinance_needed, user_id, fs_id, gender',
                values: [givenNames, surname, ordinanceNeeded, familySearchId, gender]
            }

            db.queryDatabase(query, client, (ancestorError, ancestorResult) => {
                if (ancestorError) {
                    done();
                    callback(ancestorError);
                    return;
                }

                var ancestor = ancestorResult.rows[0];

                done();
                callback(null, ancestor);
            })
        })
    })
}

function reserveAncestor(ancestorId, userId, callback) {
    db.connectToDatabase((connectionError, client, done) => {
        if (connectionError) {
            callback(connectionError);
            return;
        }

        var query = {
            text: 'UPDATE ancestor SET user_id = $1 WHERE id = $2 RETURNING id, given_name, surname, ordinance_needed, user_id, fs_id, gender',
            values: [userId, ancestorId]
        };

        db.queryDatabase(query, client, (ancestorError, ancestorResult) => {
            if (ancestorError) {
                done();
                callback(ancestorError);
                return;
            }

            var ancestor = ancestorResult.rows[0];

            done();
            callback(null, ancestor);
        })
    })
}

function getTempleCardForAncestor(ancestorId, callback) {
    db.connectToDatabase((connectionError, client, done) => {
        if (connectionError) {
            callback(connectionError);
            return;
        }

        // Get the FS ID for this Ancestor from the database
        var query = {
            text: 'SELECT fs_id FROM ancestor WHERE id = $1',
            values: [ancestorId]
        };

        db.queryDatabase(query, client, (ancestorError, ancestorResult) => {
            if (ancestorError) {
                done();
                callback(ancestorError);
                return;
            }

            var fsId = ancestorResult.rows[0]['fs_id'];
            done();

            aws.loadPdfFromAWS(fsId, (loadPdfError, templeCard) => {
                if (loadPdfError) {
                    callback(loadPdfError);
                    return;
                }

                // Create Temple Card DTO
                var templeCardDto = {
                    templeCard: templeCard,
                    filename: `${fsId}.pdf`
                };

                callback(null, templeCardDto);
            })
        })
    })
}

function deleteAncestor(ancestorId) {
    db.connectToDatabase((connectionError, client, done) => {
        if (connectionError) {
            callback(connectionError);
            return;
        }

        // Get the FS ID for this ancestor from the database
        var query = {
            text: 'SELECT fs_id FROM ancestor WHERE id = $1',
            values: [ancestorId]
        };

        db.queryDatabase(query, client, (ancestorError, ancestorResult) => {
            if (ancestorError) {
                callback(ancestorError);
                done();
                return;
            }

            var fsId = ancestorResult.rows[0]['fs_id'];
            // done();

            
        })
    })
}

module.exports = {
    getAncestors: getAncestors,
    createAncestor: createAncestor,
    reserveAncestor: reserveAncestor,
    getTempleCardForAncestor: getTempleCardForAncestor
}