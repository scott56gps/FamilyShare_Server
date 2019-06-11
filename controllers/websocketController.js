function registerDefaultConnection(defaultNamespace, socket) {
    console.log('Made a default connection');

    socket.on('shareAncestor', (data) => {
        ancestorController.handleShareAncestor(data, (error, ancestor) => {
            if (error) {
                // Handle Error
            }

            defaultNamespace.emit('newAvailableAncestor', ancestor);
        });
    })

    socket.on('disconnect', () => {
        console.log('Socket was disconnected');
    });
}

module.exports = {
    registerDefaultConnection: registerDefaultConnection
}