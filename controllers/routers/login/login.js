const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const user = require('../../../models/User')
const accessToken = require('../../AuthenticationTokens/accessToken')
const refreashToken = require('../../AuthenticationTokens/refreashToken')
const emailToken = require('../../AuthenticationTokens/emailToken')
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
    // console.log(await checkCredentials(userInfo , req.body.password))
    if(! await checkCredentials(userInfo , req.body.password))
        flashMessage.showFlashMessage(401 , 'Wrong Credentials' , req , res)
    else if(!userInfo.conformed)
    {
        confirmationEmail.sendConfirmationEmail(userInfo)
        res.cookie('Authorization' , `bearer ${emailToken.generateEmailCheckToken(userInfo)}` , {path:'/emailConfirmation' , httpOnly:true})
        res.status(201).redirect('/emailConfirmation')
    }
    else
    {
            generateTokens(userInfo , res).then(tokens =>{
            res.send('Login Successful') //Placeholder
        })
    }
})

async function checkCredentials(userInfo , password)
{
    if(!userInfo)
        return false
    const passwordValid = await bcrypt.compare(password , userInfo.password)
    if(!passwordValid)
        return false
    return true
}

async function generateTokens(userInfo ,  res)
{
    const refreash_token = await refreashToken.createRefreashToken(userInfo)
    const access_token = await accessToken.generateAccessToken(refreash_token , "2h")
    res.cookie('Refreash_Token' , `bearer ${refreash_token}` , {httpOnly:true}) //Place holder will be stored differently
    res.cookie('Authorization' , `bearer ${access_token}` , {httpOnly:true})
    return {refreash_token , access_token}

}
module.exports = router