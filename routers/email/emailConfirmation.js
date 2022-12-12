const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


const user = require('../../models/User')
const sendEmail = require('./sendEmail')

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
    sendEmail(user , 'Confirm Your Email to complete your register' , `Please click on the following link to confirm your email:\n${generateConfirmationLink(user)}\n to receive another link login to your account and click resend confirmation email`)
}   


module.exports = {router , sendConfirmationEmail}