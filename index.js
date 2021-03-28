const express = require('express')
const { sequelize, User } = require('./models')



const app = express()
app.use(express.json())


app.post('/tenants', async(req, res) => {
    const { username, password } = req.body

    try{
        const user = await User.create({ username, password })

        return res.json(user)
    } catch(err) {
        console.log(err)

        return res.status(500).json(err)
    }
})


app.listen({ port: 3001 }, async () => {
    console.log('Server is listening on http://localhost:3001')

    await sequelize.sync({ force: true })
    console.log('Database synced!')
})