const emailToken = require('../AuthenticationTokens/emailToken')
const sendEmail = require('./sendEmail')
const errorReport = require('../errorReport')



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
        res.status(error.statusCode).json({message:error.message})   //Place holder will have a seperate html page
    }
    if(req.userId == undefined)
        res.status(401).json({message:'Unautherized Access'})   //Place holder will have a seperate html page
    next()
}



module.exports = {sendConfirmationEmail , verifyEmailCheckToken}