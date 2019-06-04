const express = require('express')
const multer = require('multer')
const socket = require('socket.io')
const app = express()

// Bring in the Controllers
const ancestorController = require('./controllers/ancestorController');
const userController = require('./controllers/userController');

// Configure body-parser
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(logRequest);

// Configure Multer
var storage = multer.memoryStorage()

const upload = multer({
    storage: storage
})

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`Server now listening on port ${port}`)
});

// Configure Socket.IO
// const http = require('http').createServer(app);
var io = socket(server);

app.get('/', (request, response) => {
    response.send("Welcome to the App!  This is an example database querying app with the potential to become the production server")
})

app.get('/ancestors', ancestorController.handleGetAvailable);
app.get('/ancestors/:userId', ancestorController.handleGetReserved);
app.get('/templeCard/:ancestorId', ancestorController.handleGetTempleCard);

app.post('/ancestor', upload.single('templePdf'), ancestorController.handlePostAncestor);
app.post('/createUser', userController.handlePostUser);
app.post('/login', userController.handleLoginUser);

app.put('/reserve', ancestorController.handlePutAncestor);

app.delete('/ancestor', ancestorController.handleDeleteAncestor);

io.on('connection', (socket) => {
    console.log('Made a connection');

    socket.on('disconnect', () => {
        console.log('Socket ' + socket + ' was disconnected');
    });

    setTimeout(function() {
        // Simple Message send
        // socket.send('Sent a message after connection!');

        // Send a list of ancestors
        ancestorController.socketIOGetAvailable((error, ancestors) => {
            if (error) {
                console.error(error);
                return;
            }

            console.log(ancestors);

            socket.emit('availableAncestors', ancestors);
        })
     }, 4000);
})

// Middleware
function logRequest(request, response, next) {
    console.log('Received ' + request.method + ' request for: ' + request.url);
    next();
}
