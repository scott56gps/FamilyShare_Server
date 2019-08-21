const express = require('express')
const multer = require('multer')
const app = express()

// Bring in the Controllers
const ancestorController = require('./controllers/ancestor-controller');
const userController = require('./controllers/user-controller');
const sseController = require('./controllers/sse-controller');

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

app.get('/', (request, response) => {
    if (req.headers.accept && req.headers.accept == 'text/event-stream') {
        var sseBody = sseController.createSSEBody('SSE Connection opened');
        sseController.emitSSE(sseBody, response, (error) => {
            if (error) {
                console.error(error);
                response.status(500).json({ success: false, error: error });
            }
        })
    } else {
        response.send("Welcome to the App!  This is an example database querying app with the potential to become the production server")
    }
})

app.get('/ancestors', ancestorController.handleGetAvailable);
app.get('/ancestors/:userId', ancestorController.handleGetReserved);
app.get('/templeCard/:ancestorId', ancestorController.handleGetTempleCard);

app.post('/ancestor', upload.single('templePdf'), ancestorController.handlePostAncestor);
app.post('/createUser', userController.handlePostUser);
app.post('/login', userController.handleLoginUser);

app.put('/reserve', ancestorController.handlePutAncestor);

app.delete('/ancestor', ancestorController.handleDeleteAncestor);

// Middleware
function logRequest(request, response, next) {
    console.log('Received ' + request.method + ' request for: ' + request.url);
    next();
}

app.listen(port, () => {
    console.log(`Server now listening on port ${port}`)
})