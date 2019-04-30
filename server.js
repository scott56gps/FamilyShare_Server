const express = require('express')
const multer = require('multer')
const app = express()

// Bring in the Controllers
const ancestorController = require('./controllers/ancestorController');
const userController = require('./controllers/userController');

// Configure Postgres
const { Pool } = require('pg')
const pool =  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

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
    response.send("Welcome to the App!  This is an example database querying app with the potential to become the production server")
})

app.get('/ancestors', ancestorController.handleGetAvailable);
app.get('/ancestors/:id', ancestorController.handleGetReserved);
app.get('/templeCard/:ancestorId', ancestorController.handleGetTempleCard);

app.post('/ancestor', upload.single('templePdf'), ancestorController.handlePostAncestor);
app.post('/createUser', userController.handlePostUser);
app.post('/login', userController.handleLoginUser);

app.put('/reserve', ancestorController.handlePutAncestor);

// Middleware
function logRequest(request, response, next) {
    console.log('Received ' + request.method + ' request for: ' + request.url);
    next();
}

app.get('/exampleQuery', async (request, response) => {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT user_id FROM "user" WHERE user_id = 1');
        response.send(result.rows[0])
        client.release()
    } catch (err) {
        console.error(err);
        response.send("Error " + err);
    }
})

app.listen(port, () => {
    console.log(`Server now listening on port ${port}`)
})