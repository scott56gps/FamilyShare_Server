const ancestorController = require('./ancestorController');

function registerDefaultConnection(defaultNamespace, socket) {
    console.log('Made a default connection');

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
    })

    socket.on('disconnect', () => {
        console.log('Socket was disconnected');
    });
}

module.exports = {
    registerDefaultConnection: registerDefaultConnection
}