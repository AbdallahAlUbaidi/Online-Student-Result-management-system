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
    sendEmail(user , 'Confirm Your Email to complete your register' , `
        <p style="font-size: 16px; margin-bottom: 20px;">
        Please click on the following link to confirm your email:
        <br>
            <div style="display:flex;justify-content:center;align-items:center;marign:10px auto;"> <a href="${generateConfirmationLink(user)}" style="color: #fff; text-decoration: none; padding:10px; background-color:#3e52d5;margin:auto;">Confirm Email</a> </div>
        <br>

        </p>
        <p style="font-size: 14px;">
            To receive another link, login to your account and click "Resend Confirmation Email".
        </p>
    `)
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