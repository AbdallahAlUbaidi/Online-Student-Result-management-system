const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const OAuth2 = google.auth.OAuth2
const OAuth2_client = new OAuth2(process.env.CLIENT_ID , process.env.CLIENT_SECRET)
OAuth2_client.setCredentials({refresh_token:process.env.CLIENT_REFRESH_TOKEN})

const errorReport = require('../errorReport')
const user = require('../../models/User')

router.get('/:emailToken' , async (req , res)=>
{
    let userId = await jwt.verify(req.params.emailToken , process.env.EMAIL_TOKEN_SECRET)
    const newUser = await user.updateOne({_id:userId} , {conformed:true})
    res.send(newUser)
})


function generateConfirmationLink(user)
{
    let token = jwt.sign( user._id.toString(), process.env.EMAIL_TOKEN_SECRET)
    return `${process.env.URL}/emailConfirmation/${token}`
}

function sendConfirmationEmail(user)
{
    const accessToken = OAuth2_client.getAccessToken()
    let mailTransporter = nodemailer.createTransport(
        {
            service:'gmail',
            auth:{
                user:process.env.EMAIL,
                pass:process.env.EMAIL_PASSWORD,
                type:'OAUTH2',
                clientId:process.env.CLIENT_ID,
                clientSecret:process.env.CLIENT_SECRET,
                refreshToken:process.env.CLIENT_REFRESH_TOKEN,
                accessToken:accessToken
            }
        })
    let mailOptions = {
        from:process.env.EMAIL,
        to:user.emailAddress,
        subject:"Confirm Your Email Address",
        text:`Please click on the following link to confirm your email:\n${generateConfirmationLink(user)}\n to receive another link login to your account and click resend confirmation email`
    }
    mailTransporter.sendMail(mailOptions , (err)=>
    {if(err)console.log(err)})
}   


module.exports = {router , sendConfirmationEmail}