const express = require('express')
const { sequelize, User, Article } = require('./models')



const app = express()
app.use(express.json())


app.post('/tenants', async (req, res) => {
    const { username, password } = req.body

    try{
        const user = await User.create({ username, password })

        return res.status(201).json(user)
    } catch(err) {
        console.log(err)

        return res.status(500).json(err)
    }
})


app.get('/tenants/:tenantId', async (req, res) => {
    const tenantId = req.params.tenantId

    try{
        const user = await User.findOne({ 
            where: { tenantId }
        })

        return res.json(user)
    } catch(err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.post('/articles', async (req, res) => {
    const { tenantId, title, perex } = req.body

    try {
        const user = await User.findOne({ where: { tenantId: tenantId }})

        const article = await Article.create({ title, perex, userId: user.id })

        return res.status(201).json(article)
    } catch(err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong '})
    }
})

app.listen({ port: 3001 }, async () => {
    console.log('Server is listening on http://localhost:3001')

    await sequelize.authenticate()
    console.log('Database synced!')
})