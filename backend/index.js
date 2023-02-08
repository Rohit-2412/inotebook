const express = require('express')
var cors = require('cors')
const connectToMongo = require('./db');
connectToMongo();

const app = express()
const port = 9999

app.use(cors())
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`iNotebook backend listening at http://localhost:${port}`)
})