const express = require('express')
const router = express.Router()

const user = require('../../../models/User')
const accessToken = require('../../AuthenticationTokens/accessToken')
const refreashToken = require('../../AuthenticationTokens/refreashToken')

const errorReport = require('../../errorReport')

router.get('/' , (req , res)=>
{
    res.render('login/login')
})

