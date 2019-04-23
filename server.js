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

app.post('/ancestor', upload.single('templePdf'), ancestorController.handlePostAncestor);
app.post('/createUser', userController.handlePostUser);

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

app.post('/reserve', upload.none(), async (request, response) => {
    try {
        // const ancestorId = request.params.ancestorId
        // const userId = request.params.userId
        console.log(request.body.id)
        console.log(request.body.userId)
        var ancestorId = request.body.id
        var userId = request.body.userId

        const client = await pool.connect()

        // Query the ancestorId that came through
        const result = await client.query(`SELECT fs_id FROM ancestor WHERE id = ${ancestorId} AND user_id IS NULL`)

        // First, reserve the ancestor for this user
        if (result.rows.length == 1 && userId != undefined) {
            console.log('We found the fs_id for the requested ancestor!')
            var fsId = result.rows[0]['fs_id']

            // Reserve the ancestor by updating the user_id column for this ancestorId
            const updateResult = await client.query(`UPDATE ancestor SET user_id = ${userId} WHERE id = ${ancestorId}`)

            client.release()
            response.send({ "fs_id": fsId })
        } else {
            client.release()
            response.send({ "Error": "Either the ancestorId or userId was undefined" })
        }
    } catch (err) {
        console.error(err);
        response.send("Error " + err);
    }
})

app.get('/templeCard/:userId/:ancestorId', async (request, response) => {
    console.log('userId:', request.params.userId)
    console.log('ancestorId:', request.params.ancestorId)
    var userId = request.params.userId
    var ancestorId = request.params.ancestorId

    // Check to see if the user is associated with this ancestor
    try {
        const client = await pool.connect()

        const result = await client.query(`SELECT * FROM ancestor WHERE user_id = ${userId} AND id = ${ancestorId};`)
    
        var fsId = result.rows[0]['fs_id']
        console.log('fs_id', fsId)
        if (result.rows.length == 1) {
            // Proceed with the download
            loadPdfFromAWS(fsId, (err, data) => {
                if (err) {
                    console.log("ERROR!")
                    console.log(err)
                    client.release()
                    response.send(err)
                }
                response.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=${fsId}.pdf`,
                    'Content-Length': data.length
                });
                client.release()
                response.end(data)
            })
        } else {
            response.send('ERROR: User is not associated with this ancestor')
        }
    } catch (err) {
        console.error(err)
        response.send("Error " + err)
    }
})

app.get('/login/:username', async (request, response) => {
    try {
        var username = request.params.username
        console.log('username:', username)

        const client = await pool.connect()

        // Query the username that came through
        const result = await client.query(`SELECT * FROM "user" WHERE username = '${username}'`)
        
        if (result.rows.length > 0 && result.rows[0]['username'] == username) {
            console.log('User found!')

            //var userId = result.rows[0]['user_id']

            //var stringifiedUserId = JSON.stringify(userId)

            console.log(result.rows)
            response.send(result.rows)
        } else {
            response.send('User not found')
        }
        client.release()
    } catch (err) {
        console.error(err);
        response.send("Error " + err);
    }
})

app.listen(port, () => {
    console.log(`Server now listening on port ${port}`)
})