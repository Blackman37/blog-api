const jwt = require('jsonwebtoken');
require('dotenv').config()
const { sequelize, User, Article, Comment } = require('../models')

const timeForExpireToken = 3600

async function hasValidApiKeyHeader(req, res, next) {
    // validation: is uuid? If true, then contintue || If false, then return status 401
    const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;
    const isValidV4UUID = uuid => uuidV4Regex.test(uuid);

    const unauthorizedApiKeySendJson = () => {
        res.status(401).json({
          code: 'API_KEY_INVALID',
          message: 'API key missing or invalid'
        })
    }

    // header has not valid x-api-key
    if (!req.header('x-api-key') || !isValidV4UUID(req.header('x-api-key'))) {
        return unauthorizedApiKeySendJson()
    }

    // find user with apiKey from header
    const user = await User.findOne({ where: { apiKey: req.header('x-api-key') } })

    // is existing user?
    if(!user) {
        return unauthorizedApiKeySendJson()
    }

    req.user = user
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

function hasValidJwt(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    const unauthorizedJwtSendJson = () => {
        res.status(403).json({
          code: 'UNAUTHORIZED',
          message: 'Access token is missing, invalid or expired'
        })
    }
  
    if (token == null) return unauthorizedJwtSendJson()
  
    jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
  
  
      if(user) {
          req.username = user
      } else {
          return unauthorizedJwtSendJson()
      }
  
      next()
    })
  }

module.exports = { hasValidApiKeyHeader, generateAccessToken, hasValidJwt }