const express = require('express')

const app = express()

app.use('/', (req, res) => { res.send('This is working') })

app.listen(3001, () => {
    console.log('Server is listening on port 3001');
})