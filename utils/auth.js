function auth (req, res, next) {
    // return res.json({ message: 'Invalid API key' })

    if(!req.header('x-api-key') || req.header('x-api-key') !== 'test-api-key') {
        // res.status(401)
        return res.status(401).json({ message: 'API key missing or invalid' })
    }

    next()
}

module.exports = { auth }