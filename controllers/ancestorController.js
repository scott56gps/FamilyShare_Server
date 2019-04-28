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
    var userId = request.params.id
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
    var ancestorDto = {
        givenNames: request.body.givenNames,
        surname: request.body.surname,
        ordinanceNeeded: request.body.ordinanceNeeded,
        familySearchId: request.body.familySearchId,
        gender: request.body.gender
    }

    // Create a Temple Card DTO
    var templeCardDto = {
        key:`${request.body.familySearchId}.pdf`,
        value: request.file.buffer
    }

    // Put this Ancestor in the database
    ancestorModel.createAncestor(ancestorDto, templeCardDto, (error, ancestor) => {
        if (error) {
            console.error(error);
            response.status(500).json({ success: false, error: error });
            return;
        }

        response.json(ancestor);
    });
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

module.exports = {
    handleGetAvailable: getAvailableAncestors,
    handleGetReserved: getReservedAncestors,
    handleGetTempleCard: getTempleCardForAncestor,
    handlePostAncestor: postAncestor,
    handlePutAncestor: reserveAncestor
}