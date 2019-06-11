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
    ancestorModel.createAncestor(ancestorDto, templeCardDto, (error, ancestor) => {
        if (error) {
            // console.error(error);
            // response.status(500).json({ success: false, error: error });
            callback({ success: false, error: error }, null);
            return;
        }

        callback(null, ancestor);
        return;
    });
}

function socketPostTest(request, response, next) {
    var ancestorDto = {
        "given_name": request.body.givenNames,
        surname: request.body.surname,
        "ordinance_needed": request.body.ordinanceNeeded,
        "fs_id": request.body.familySearchId,
        gender: request.body.gender
    }

    // Create a Temple Card DTO
    var templeCardDto = {
        key:`${request.body.familySearchId}.pdf`,
        value: request.file.buffer
    }

    console.log('ancestorDto', ancestorDto);
    console.log('templeCardDto', templeCardDto);

    ancestorDto.id = 0;
    response.locals.ancestor = ancestorDto;
    next();
}

module.exports = {
    handleGetAvailable: getAvailableAncestors,
    handleGetReserved: getReservedAncestors,
    handleGetTempleCard: getTempleCardForAncestor,
    handlePostAncestor: postAncestor,
    handlePutAncestor: reserveAncestor,
    handleDeleteAncestor: deleteAncestor,
    handleShareAncestor: handleShareAncestor,
    socketPostTest: socketPostTest
}