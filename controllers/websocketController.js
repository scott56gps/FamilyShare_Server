const ancestorController = require('./ancestorController');

function registerDefaultConnection(defaultNamespace, socket) {
    console.log('Made a share connection');

    socket.on('shareAncestor', (data) => {
        ancestorController.handleShareAncestor(data, (error, ancestor) => {
            if (error) {
                // Handle Error
                console.error(error);
                socket.emit('shareError', error);
                return;
            }

            defaultNamespace.emit('newAvailableAncestor', ancestor);
            return;
        });
    });

    socket.on('reserveAncestor', (data) => {
        ancestorController.handleReserveAncestor(data, (error, ancestor) => {
            if (error) {
                console.error(error);
                socket.emit('reserveError', error);
                return;
            }

            defaultNamespace.emit('ancestorReserved', ancestor);
            return;
        });
    });

    socket.on('disconnect', () => {
        console.log('Share socket was disconnected');
    });
}

function registerReserveConnection(defaultNamespace, socket) {
    socket.on('reserveAncestor', (data) => {
        ancestorController.handleReserveAncestor(data, (error, ancestor) => {
            if (error) {
                console.error(error);
                socket.emit('reserveError', error);
                return;
            }

            defaultNamespace.emit('ancestorReserved', ancestor);
            return;
        });
    });

    socket.on('disconnect', () => {
        console.log('Reserve socket was disconnected');
    });
}

module.exports = {
    registerDefaultConnection: registerDefaultConnection
    // registerReserveConnection: registerReserveConnection
}