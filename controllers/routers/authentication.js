const express = require('express')
const accessToken = require('../AuthenticationTokens/accessToken')
const refreshToken = require('../AuthenticationTokens/refreshToken')
const router = express.Router()


router.get('/' , (req , res ) =>
{
    res.redirect('back')
})


module.exports = router