const userModel = require('../models/userModel');

function postUser(request, response) {
    var username = request.body.username

    // Create a user using the model
    userModel.createUser(username, (error, user) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: error });
            return;
        }

        response.json(user);
    });
}

module.exports = {
    handlePostUser: postUser
}