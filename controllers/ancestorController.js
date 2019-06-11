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

function getReservedAncestors(request, response) {
    var userId = request.params.userId
    ancestorModel.getAncestors(userId, (error, ancestors) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: err });
            return;
        }

        response.json(ancestors);
    })
}

function postAncestor(request, response) {
    // Create a Temple Card DTO
    var templeCardDto = {
        key:`${request.body.familySearchId}.pdf`,
        value: request.file.buffer
    }

    ancestorModel.savePdfToAWS(templeCardDto, (error) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: err });
            return;
        }

        response.json({ success: true });
    })
}

function reserveAncestor(request, response) {
    var ancestorId = request.body.ancestorId;
    var userId = request.body.userId;

    // Reserve this ancestor for this user
    ancestorModel.reserveAncestor(ancestorId, userId, (error, ancestor) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: error });
            return;
        }

        response.json(ancestor);
    });
}

function getTempleCardForAncestor(request, response) {
    var ancestorId = request.params.ancestorId;

    // Get the Temple Card for this ancestorId
    ancestorModel.getTempleCardForAncestor(ancestorId, (error, templeCardDto) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: error });
            return;
        }

        response.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${templeCardDto.filename}`,
            'Content-Length': templeCardDto.templeCard.length
        });
        response.end(templeCardDto.templeCard);
    })
}

function deleteAncestor(request, response) {
    var ancestorId = request.body.ancestorId;

    ancestorModel.deleteAncestor(ancestorId, (error) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: error });
            return;
        }

        response.end();
    })
}

/* Websocket Handlers */

function handleShareAncestor(ancestor, callback) {
    console.log(ancestor);

    var ancestorDto = {
        givenNames: ancestor.givenNames,
        surname: ancestor.surname,
        ordinanceNeeded: ancestor.ordinanceNeeded,
        familySearchId: ancestor.familySearchId,
        gender: ancestor.gender
    }

    // Put this Ancestor in the database
    ancestorModel.createAncestor(ancestorDto, (error, ancestor) => {
        if (error) {
            callback({ success: false, error: error }, null);
            return;
        }

        callback(null, ancestor);
        return;
    });
}

module.exports = {
    handleGetAvailable: getAvailableAncestors,
    handleGetReserved: getReservedAncestors,
    handleGetTempleCard: getTempleCardForAncestor,
    handlePostAncestor: postAncestor,
    handlePutAncestor: reserveAncestor,
    handleDeleteAncestor: deleteAncestor,
    handleShareAncestor: handleShareAncestor
}