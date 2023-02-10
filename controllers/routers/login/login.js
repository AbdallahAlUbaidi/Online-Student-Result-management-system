const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const user = require('../../../models/User')
const accessToken = require('../../AuthenticationTokens/accessToken')
const refreshToken = require('../../AuthenticationTokens/refreshToken')
const emailToken = require('../../AuthenticationTokens/emailToken')
const flashMessage = require('../../flashMessage')
const confirmationEmail = require('../../email/sendConfirmationEmail')
const roleInfo = require('../../roleInfo')

router.get('/' , (req , res)=>
{
    res.render('login/login' , {message:req.flash('message')})
})

router.post('/' , async (req , res)=>
{ 
    const userInfo = await user.findOne({emailAddress:req.body.emailAddress});
    if(! await checkCredentials(userInfo , req.body.password))
        flashMessage.showFlashMessage(401 , 'Wrong Credentials' , req , res)
    else if(!userInfo.conformed)
    {
        confirmationEmail.sendConfirmationEmail(userInfo)
        res.cookie('Email_token' , `bearer ${emailToken.generateEmailCheckToken(userInfo)}` , {
            path:'/emailConfirmation' , 
            httpOnly:true
        })
        res.status(201).redirect('/emailConfirmation')
    }
    else
    {
        
        await generateTokensCookies(userInfo , res)
        const role_info = await roleInfo.getRoleInfo(userInfo._id , userInfo)
        if(role_info.error)
            res.render('errorPages/serverError' , {error:role_info.error.errors.ServerError})
        if(!role_info.roleInfo)
            res.redirect(role_info.role.registerLink)
        else
        {
            res.send('Login Successful')
        }
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

async function generateTokensCookies(userInfo ,  res)
{
    const refresh_token = await refreshToken.generateToken(userInfo)
    const access_token = await accessToken.generateToken(refresh_token , process.env.ACCESS_TOKEN_EXPIRATION_PERIOD)
    res.cookie('Refreash_Token' , `bearer ${refresh_token}` , { 
        httpOnly: true, 
        sameSite: 'None', secure: true, 
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_PERIOD) * 24 * 60 * 60 * 1000 })
    res.cookie('Authorization' , `bearer ${access_token}` , { httpOnly: true, 
        sameSite: 'None', secure: true, 
        maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_PERIOD) * 60 * 60 * 1000 })
    return {refreash_token: refresh_token , access_token}

}
module.exports = router