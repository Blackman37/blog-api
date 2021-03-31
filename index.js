const express = require('express')
const { sequelize, User, Article, Comment } = require('./models')

const app = express()
app.use(express.json())


app.post('/tenants', async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.create({ username, password })

        return res.status(201).json(user)
    } catch (err) {
        console.log(err)

        return res.status(500).json(err)
    }
})


app.get('/tenants/:tenantId', async (req, res) => {
    const { tenantId } = req.params

    try {
        const user = await User.findOne({ where: { tenantId } })

        return res.json(user)
    } catch (err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.post('/articles', async (req, res) => {
    const { title, perex } = req.body

    try {
        const article = await Article.create({ title, perex })

        return res.status(201).json(article)
    } catch (err) {
        console.log(err)

        return res.status(400).json(err)
    }
})

app.get('/articles/:articleId', async (req, res) => {
    const { articleId } = req.params

    try {
        const article = await Article.findOne({ where: { articleId } })

        return res.json(article)
    } catch (err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.get('/articles', async (req, res) => {
    try {
        const { offset = 0, limit = 0 } = req.query

        let articles

        if (limit > 0) {
            articles = await Article.findAndCountAll({
                limit: limit,
                offset: offset,
            })

        } else {
            articles = await Article.findAndCountAll()
        }

        return res.json(articles)
    } catch (err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.delete('/articles/:articleId', async (req, res) => {
    const { articleId } = req.params

    try {
        const article = await Article.findOne({ where: { articleId } })

        await article.destroy()

        return res.json({ message: 'Article deleted!' })
    } catch (err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.patch('/articles/:articleId', async (req, res) => {
    const { articleId } = req.params
    const { title, perex } = req.body

    try {
        const article = await Article.findOne({ where: { articleId } })

        if (perex) {
            article.perex = perex
        }

        if (title) {
            article.title = title
        }

        await article.save()

        return res.json(article)
    } catch (err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.post('/comments', async (req, res) => {
    const { tenantId, content, articleId } = req.body

    try {
        const user = await User.findOne({ where: { tenantId: tenantId }})
        const article = await Article.findOne({ where: { articleId } })
        const comment = await Comment.create({ content, userId: user.id, articleId: article.id })

        const articleWithAuthor = Object.assign( comment.toJSON(), { author: user.toJSON().username }, { articleId: article.toJSON().articleId })

        return res.status(201).json(articleWithAuthor)
    } catch (err) {
        console.log(err)

        return res.status(400).json(err)
    }
})

app.post('/comments/:commentId/vote/up', async (req, res) => {
    const { commentId } = req.params

    try {
        await Comment.increment('score', { where: { commentId } });

        const comment = await Comment.findOne({ where: { commentId } })
        const user = await User.findOne({ where: { id: comment.userId }})

        const articleWithAuthor = Object.assign( comment.toJSON(), { author: user.toJSON().username })

        return res.json(articleWithAuthor)
 
    } catch (err) {
        
    }
})

app.post('/comments/:commentId/vote/down', async (req, res) => {
    const { commentId } = req.params

    try {
        await Comment.decrement('score', { where: { commentId } });

        const comment = await Comment.findOne({ where: { commentId } })
        const user = await User.findOne({ where: { id: comment.userId }})

        const articleWithAuthor = Object.assign( comment.toJSON(), { author: user.toJSON().username })

        return res.json(articleWithAuthor)
 
    } catch (err) {
        
    }
})

// Routes for images are not complete. I add only notes how to do it
app.get('/images/:imageId', async (req, res) => {

    // Here will be a new table and imageID from params
    // As first will read from table Image name of concrete image file (now doesn't exists table)
    // then send a file from route below (__dirname + '/images/' + nameOfFileFromTable)
    // res.sendFile(__dirname + '/images/image1.png')

})

app.post('/images/:imageId', async (req, res) => {

    // Here will write to table images a new row. This row will have a imageId and imageName - both in uuid
    // as next the file will save via fs library with new name (generated uuid) - because older files could be overwites
    // Last step will be load file and send via res.sendFile

})

app.delete('/images/:imageId', async (req, res) => {

    // Similar as post route, only as first should delete a file and then will delete from table

})

app.listen({ port: 3001 }, async () => {
    console.log('Server is listening on http://localhost:3001')

    await sequelize.authenticate()
    console.log('Database synced!')
})