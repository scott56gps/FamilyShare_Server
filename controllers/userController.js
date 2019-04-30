const userModel = require('../models/userModel');

function postUser(request, response) {
    var username = request.body.username;

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

function loginUser(request, response) {
    var username = request.body.username;

    // Log this user in
    userModel.loginUser(username, (error, userId) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: error });
            return;
        }

        response.json({ userId: userId });
    });
}

module.exports = {
    handlePostUser: postUser,
    handleLoginUser: loginUser
}