const express = require('express')
const { sequelize } = require('./models')

async function main(){
    await sequelize.sync({ force: true })
}

main()

const app = express()

app.use('/', (req, res) => { res.send('This is working') })

app.listen(3001, () => {
    console.log('Server is listening on port 3001');
})