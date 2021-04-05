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

function hasUserValidJwt(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    const unauthorizedSendJson = () => {
        res.status(403).json({
          code: 'UNAUTHORIZED',
          message: 'Access token is missing, invalid or expired'
        })
    }
  
    if (token == null) return unauthorizedSendJson()
  
    jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
  
  
      if(user) {
          req.user = user
          console.log(user)
      } else {
          console.log(error)
          return unauthorizedSendJson()
      }
  
      next()
    })
  }

module.exports = { auth, generateAccessToken, hasUserValidJwt }