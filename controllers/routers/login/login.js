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
const { renderErrorPage } = require('../../errorReport')
const secure = Boolean(parseInt(process.env.HTTPS));;
const mainPage = {
    faculty:"/courses",
    branchHead:"/facultyMembers",
    examCommittee:"/courses", //Temp
    student:"/myGrades" //Temp  
}

router.get('/'  , (req , res)=>
{
    res.render('login/login' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0]})
})

router.post('/'  ,async (req , res)=>
{ 
    const userInfo = await user.findOne({emailAddress:req.body.emailAddress});
    if(! await checkCredentials(userInfo , req.body.password))
        flashMessage.showFlashMessage(401 , 'Invalid Email or password' , req , res , '0')
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
            renderErrorPage(500)
        if(!role_info.roleInfo)
            res.redirect(role_info.mainRole.registerLink)
        else
            res.redirect(mainPage[role_info.roles[0]]);
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
        sameSite: secure ? 'None': "Lax", secure, 
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_PERIOD) * 24 * 60 * 60 * 1000 })
    res.cookie('Authorization' , `bearer ${access_token}` , { httpOnly: true, 
        sameSite: secure ? 'None': "Lax", secure, 
        maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_PERIOD) * 60 * 60 * 1000 })
    return {refreash_token: refresh_token , access_token}

}
module.exports = router