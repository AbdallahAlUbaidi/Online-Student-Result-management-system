const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const user = require('../../../models/User')
const accessToken = require('../../AuthenticationTokens/accessToken')
const refreashToken = require('../../AuthenticationTokens/refreashToken')
const flashMessage = require('../../flashMessage')
const confirmationEmail = require('../../email/sendConfirmationEmail')

const errorReport = require('../../errorReport')

router.get('/' , (req , res)=>
{
    res.render('login/login' , {message:req.flash('message')})
})

router.post('/' , async (req , res)=>
{
    const userInfo = await user.findOne({emailAddress:req.body.emailAddress});
    if(!checkCredentials(userInfo , req.body.password))
        flashMessage.showFlashMessage(401 , 'Wrong Credentials' , req , res)
    if(!userInfo.conformed)
    {
        confirmationEmail.sendConfirmationEmail(userInfo)
        res.cookie('Authorization' , `bearer ${emailToken.generateEmailCheckToken(userInfo)}` , {path:'/emailConfirmation' , httpOnly:true})
    }
    const refreash_token = res.cookie('Refreash_Token' , `bearer ${refreashToken.createRefreashToken(userInfo)}` , {httpOnly:true}) //Place holder will be stored differently
    res.cookie('Authorization' , `bearer ${accessToken.generateAccessToken(refreash_token , "2h")}` , {httpOnly:true})
    res.send('Login Successful') //Placeholder
})

function checkCredentials(userInfo , password)
{
    if(!userInfo)
        return false
    const passwordValid = bcrypt.compare(password , userInfo.password)
    if(!passwordValid)
        return false
    return true
}

module.exports = router