const express = require('express')
const request = require('request')
require('dotenv').config()
const { sequelize, User, Article, Comment } = require('./models')
const { auth, generateAccessToken, hasUserValidJwt } = require('./utils/auth')

const app = express()
const PORT = process.env.PORT || 3001
app.use(express.json())

app.post('/login', auth, async (req, res) => {
    const { username, password } = req.body

    try {
        // find user with apiKey from header
        const user = await User.findOne({ where: { apiKey: req.header('x-api-key') } })

        // is existing user?
        if(!user) {
            return res.status(401).json({ message: 'API key missing or invalid' })
        }

        if (user.username === username && user.password === password) {
        const wholeToken = generateAccessToken({ username: username })

        return res.status(201).json(wholeToken)
        } else {
            return res.status(400).json({
                code: "INVALID_CREDENTIALS",
                message: "Password is invalid"
            })
        }        
    } catch (error) {
        return res.send(error)
    }
})

app.post('/tenants', async (req, res) => {
    const { username, password } = req.body

    // write to db new user
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

    // get user from db with concrete ID
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

    // create article to db with params from body
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

    // get concrete article
    try {
        const article = await Article.findOne({ where: { articleId } })

        return res.json(article)
    } catch (err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.get('/articles', hasUserValidJwt, async (req, res) => {
    try {
        const { offset = 0, limit = 0 } = req.query

        let articles

        // PAGINATION
        // If exist limit from user, use them
        if (limit > 0) {
            articles = await Article.findAndCountAll({
                limit: limit,
                offset: offset,
            })
        
        // Else return all articles without pagination
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

    // Find concrete article and destry him
    try {
        const article = await Article.findOne({ where: { articleId } })

        await article.destroy()

        return res.status(204).json({ message: 'Article deleted!' })
    } catch (err) {
        console.log(err)

        return res.status(500).json({ error: 'Something went wrong' })
    }
})

app.patch('/articles/:articleId', async (req, res) => {
    const { articleId } = req.params
    const { title, perex } = req.body

    // Find concrete article, take non empty value and update them
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

    // 3 query to db - it is helpfull query. As first I have tenant id, then I have article id and last create new comment with this data
    try {
        const user = await User.findOne({ where: { tenantId } })
        const article = await Article.findOne({ where: { articleId } })
        const comment = await Comment.create({ content, userId: user.id, articleId: article.id })

        // response is with author and article ID
        const articleWithAuthor = Object.assign(comment.toJSON(), { author: user.toJSON().username }, { articleId: article.toJSON().articleId })

        return res.status(201).json(articleWithAuthor)
    } catch (err) {
        console.log(err)

        return res.status(400).json(err)
    }
})

app.post('/comments/:commentId/vote/up', async (req, res) => {
    const { commentId } = req.params

    // Increase score by 1 
    try {
        await Comment.increment('score', { where: { commentId } });

        const comment = await Comment.findOne({ where: { commentId } })
        const user = await User.findOne({ where: { id: comment.userId } })
        
        // add more rows with information to final JSON, from other tables
        const articleWithAuthor = Object.assign(comment.toJSON(), { author: user.toJSON().username })

        return res.status(201).json(articleWithAuthor)

    } catch (err) {

    }
})

app.post('/comments/:commentId/vote/down', async (req, res) => {
    const { commentId } = req.params

    // Decrease score by 1
    try {
        await Comment.decrement('score', { where: { commentId } });

        const comment = await Comment.findOne({ where: { commentId } })
        const user = await User.findOne({ where: { id: comment.userId } })

        // add more rows with information to final JSON, from other tables
        const articleWithAuthor = Object.assign(comment.toJSON(), { author: user.toJSON().username })

        return res.status(201).json(articleWithAuthor)

    } catch (err) {

    }
})

// Routes for images are not complete. I add only notes how to do it. All routes will work with binary files
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

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`)

    await sequelize.authenticate()
    console.log('Database synced!')
})