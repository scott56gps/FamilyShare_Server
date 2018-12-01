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
        const result = await client.query("SELECT * FROM ancestor WHERE user_id IS NULL");
        response.send(result.rows)
        client.release()
    } catch (err) {
        console.error(err);
        response.send("Error " + err);
    }
})

app.listen(port, () => {
    console.log(`Server now listening on port ${port}`)
})