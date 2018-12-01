const express = require('express')
const app = express()
const { Pool } = require('pg')
const pool =  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

const port = process.env.PORT || 5000;

app.get('/', (request, response) => {
    response.send("Welcome to the App!  This is an example database querying app with the potential to become the production server")
})

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

app.get('/available', async (request, response) => {
    try {
        const client = await pool.connect()
        const result = await client.query("SELECT * FROM ancestor WHERE user_id IS NULL")
        response.send(result.rows)
        client.release()
    } catch (err) {
        console.error(err);
        response.send("Error " + err);
    }
})

app.get('/reserve/:ancestorId/:userId', async (request, response) => {
    try {
        const ancestorId = request.params.ancestorId
        const userId = request.params.userId

        const client = await pool.connect()

        // Query the ancestorId that came through
        const result = await client.query(`SELECT fs_id FROM ancestor WHERE ancestor_id = ${ancestorId}`)

        // First, reserve the ancestor for this user
        if (result.rows.length == 1 && userId != undefined) {
            console.log('We found the fs_id for the requested ancestor!')
            var fsId = result.rows[0]['fs_id']

            // Reserve the ancestor by updating the user_id column for this ancestorId
            const updateResult = await client.query(`UPDATE ancestor SET user_id = ${userId}`)

            // Retrieve the PDF for this fs_id

            // Send the PDF back to the client
            response.send(`Ancestor ${fsId} reserved successfully`)
        } else {
            response.send('Either ancestorId not found or userId was undefined')
        }
        client.release()
    } catch (err) {
        console.error(err);
        response.send("Error " + err);
    }
})

app.get('/login/:username', async (request, response) => {
    try {
        var username = request.params.username

        const client = await pool.connect()

        // Query the username that came through
        const result = await client.query(`SELECT * FROM "user" WHERE username = '${username}'`)
        
        if (result.rows.length > 0 && result.rows[0]['username'] == username) {
            console.log('User found!')

            var userId = result.rows[0]['user_id']

            var stringifiedUserId = JSON.stringify(userId)

            response.send(stringifiedUserId)
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