const express = require('express')
const { generateAccessToken } = require('../AuthenticationTokens/accessToken')
const router = express.Router()


router.get('/token' , (req , res ) =>
{
    res.json({token:generateAccessToken(req.body.token , process.env.TOKEN_EXPIRATION_PERIOD)})
})


module.exports = router