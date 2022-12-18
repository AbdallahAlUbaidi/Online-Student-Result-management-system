const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


const user = require('../../models/User')
const sendEmail = require('./sendEmail')
const emailToken = require('../AuthenticationTokens/emailToken')
const errorReport = require('../errorReport')

router.get('/' , (req , res)=>
{
    res.render('confirmEmail')
})

router.get('/resendEmail' , verifyEmailCheckToken , async (req , res)=>
{
    
    const userInfo = await user.findOne({_id:req.userId})
    if(userInfo == undefined)
        res.status(404).json({message:"Could not find user account"})
    else if(userInfo.conformed == true)
        res.status(409).json({message:'Your Email is already verified'})
    else
    {
        sendConfirmationEmail(userInfo)
        res.status(200).json({message:'A new email has been send'})
    }

})

router.get('/checkVerify' , verifyEmailCheckToken , async (req , res) =>
{
    const userInfo = await user.findOne({_id:req.userId})
    if(userInfo == undefined)
        res.status(404).json({message:"Could not find user account"})
    else if(userInfo.conformed == false)
        res.status(409).json({message:'Email has yet to be verifyed'})
    else 
        res.status(200).json({message:"Email Verified"})
})

router.get('/:emailToken' , async (req , res)=>
{
   
    let userId = await emailToken.verifyEmailConfirmationToken(req.params.emailToken).userId
    const newUser = await user.updateOne({_id:userId} , {conformed:true})
    res.status(200).json({message:'Your Email was verified successfully'})
})


function generateConfirmationLink(user)
{
    let token = emailToken.generateEmailConfirmationToken(user)
    return `${process.env.URL}/emailConfirmation/${token}`
}

function sendConfirmationEmail(user)
{
    sendEmail(user , 'Confirm Your Email to complete your register' , `Please click on the following link to confirm your email:\n${generateConfirmationLink(user)}\n to receive another link login to your account and click resend confirmation email`)
}   

function verifyEmailCheckToken(req , res , next)
{

    const cookie = req.cookies.Authorization
    if(cookie == undefined)
    {   
        res.status(401).json({message:'Autherization faild'}) 
        return
    }
    const token = cookie.split(' ')[1]
    try{req.userId = emailToken.verifyEmailCheckToken(token).userId}
    catch(err){
        error = errorReport(err)
        res.status(error.statusCode).json({message:error.message})
    }
    if(req.userId == undefined)
        res.status(401).json({message:'Unautherized Access'})
    next()
}

module.exports = {router , sendConfirmationEmail}