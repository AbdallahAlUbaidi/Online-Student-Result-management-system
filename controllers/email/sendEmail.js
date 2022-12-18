const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const OAuth2 = google.auth.OAuth2
const OAuth2_client = new OAuth2(process.env.CLIENT_ID , process.env.CLIENT_SECRET)
OAuth2_client.setCredentials({refresh_token:process.env.CLIENT_REFRESH_TOKEN})

const errorReport = require('../errorReport')

function createMailTransporter()
{
    let auth = {
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD,
        type:'OAUTH2',
        clientId:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        refreshToken:process.env.CLIENT_REFRESH_TOKEN,
        accessToken:OAuth2_client.getAccessToken()
    }

    return nodemailer.createTransport({
        service:'gmail',
        auth
    })
}



function sendEmail(user , subject , message)
{
    let mailTransporter = createMailTransporter()
    let mailOptions = {
        from:process.env.EMAIL,
        to:user.emailAddress,
        subject,
        text:message
    }
    mailTransporter.sendMail(mailOptions , (err)=>
    {if(err)errorReport(err)})
}   


module.exports = sendEmail