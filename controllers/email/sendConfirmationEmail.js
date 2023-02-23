const emailToken = require('../AuthenticationTokens/emailToken')
const sendEmail = require('./sendEmail')
const {errorReport, renderErrorPage} = require('../errorReport')
const { showFlashMessage } = require('../flashMessage')



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
    const cookie = req.cookies.emailToken
    if(cookie == undefined){renderErrorPage(res , 401);return;}
    const token = cookie.split(' ')[1]
    try{req.userId = emailToken.verifyEmailCheckToken(token).userId}
    catch(err){
        const {message , statusCode} = errorReport(err)
        if(statusCode === 500)
            renderErrorPage(res , 500);
        else
            showFlashMessage(statusCode , message , req , res , '0');
    }
    if(req.userId == undefined)
        renderErrorPage(res , 401)
    else
        next()
}



module.exports = {sendConfirmationEmail , verifyEmailCheckToken}