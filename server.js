const express = require('express')
const multer = require('multer')
const socket = require('socket.io')
const app = express()

// Bring in the Controllers
const ancestorController = require('./controllers/ancestorController');
const userController = require('./controllers/userController');
const websocketController = require('./controllers/websocketController');

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
var io = socket(server);

/* API Handles */
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

const shareNamespace = io.of('/share');
const reserveNamespace = io.of('/reserve');

shareNamespace.on('connection', (socket) => {
    websocketController.registerShareConnection(shareNamespace, socket);
});
reserveNamespace.on('connection', (socket) => {
    websocketController.registerReserveConnection(reserveNamespace, socket);
});

// Middleware
function logRequest(request, response, next) {
    console.log('Received ' + request.method + ' request for: ' + request.url);
    next();
}
