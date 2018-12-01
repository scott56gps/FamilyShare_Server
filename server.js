const express = require('express')
const app = express()
const { Pool } = require('pg')
const pool =  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

app.get('/', (request, response) => {
    response.send("Welcome to the App!  This is an example database querying app with the potential to become the production server")
})

app.get('/exampleQuery', (request, response) => {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM user');
    response.send(result.rows)
    client.release()
})