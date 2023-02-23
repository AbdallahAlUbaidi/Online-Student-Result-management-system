const sendEmail = require('./sendEmail')
const emailToken = require('../AuthenticationTokens/emailToken')
const { errorReport, renderErrorPage } = require('../errorReport')
const { showFlashMessage } = require('../flashMessage')

async function sendPasswordRecoveryEmail(user){
    try{
        const token = await emailToken.generateEmailConfirmationToken(user)
        sendEmail(user , 'Password recovery' , `It seems that you are trying to recover the password of your account \n in order to continue the process please click on the following link:\n
        http://:${process.env.URL}/login/retrievePassword/${token}\n
        if it was not you how made password recovery request, we recommend you change the email you are using for your account and your password`)
    }catch(err){
        const {statusCode , message} = errorReport(err)
        if(statusCode === 500)
            renderErrorPage(res , 500)
        else
            throw err
    }
}   

module.exports = sendPasswordRecoveryEmail