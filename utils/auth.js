// const jwt = require('express-jwt')
// const jwksRsa = require('jwks-rsa')
const jwt = require('jsonwebtoken');
require('dotenv').config()

const timeForExpireToken = 3600

function auth(req, res, next) {
    // validation: is uuid? If true, then contintue || If false, then return status 401
    const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
    const isValidV4UUID = uuid => uuidV4Regex.test(uuid);

    // header has not valid x-api-key
    if (!req.header('x-api-key') || !isValidV4UUID(req.header('x-api-key'))) {
        return res.status(401).json({
            code: "API_KEY_INVALID",
            message: "API key missing or invalid"
        })
    }

    next()
}

function generateAccessToken(username) {
    const newAuthToken = jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: `${timeForExpireToken}s` })
    return {
        access_token: newAuthToken,
        token_type: 'bearer',
        expires_in: timeForExpireToken
      };
}

// // Middleware function - is token valid?
// const checkJwt = jwt({
//     secret: jwksRsa.expressJwtSecret({
//         cache: true,
//         rateLimit: true,
//         jwksRequestsPerMinute: 5,
//         jwksUri: 'https://blackman37.eu.auth0.com/.well-known/jwks.json'
//     }),
//     audience: 'https://applifting.app',
//     issuer: 'https://blackman37.eu.auth0.com/',
//     algorithms: ['RS256']
// })


module.exports = { auth, generateAccessToken }