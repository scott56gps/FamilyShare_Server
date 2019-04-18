const ancestorModel = require('../models/ancestorModel');

function getAvailableAncestors(request, response) {
    ancestorModel.getAncestors(null, (error, ancestors) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: err });
            return;
        }

        response.json(ancestors);
    })
}

module.exports = {
    handleGetAvailable: getAvailableAncestors
}