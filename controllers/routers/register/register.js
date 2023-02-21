const express = require('express')
const router = express.Router()

const {errorReport, renderErrorPage} = require('../../errorReport')
const {sendConfirmationEmail} = require('../../email/sendConfirmationEmail')
const emailToken = require('../../AuthenticationTokens/emailToken')

const user = require('../../../models/User')


router.get('/' , (req , res)=>
{
    res.render('register/register')
})

router.post('/' , async(req , res)=>
{
    try
    {  
        const newUser = await user.createNewUser(req.body.username , req.body.emailAddress , req.body.password , req.body.role)
        sendConfirmationEmail(newUser)
        res.cookie('emailToken' , `bearer ${emailToken.generateEmailCheckToken(newUser)}` , {path:'/emailConfirmation' , httpOnly:true})
        res.status(201).redirect('/emailConfirmation')
    }
    catch(error)
    {       
        const errorInfo = errorReport(error)
        if(errorInfo.statusCode === 500)
            renderErrorPage(res , 500)
        res.status(errorInfo.statusCode).render( 'register/register', {errors: errorInfo.errors})
    }
})




module.exports = router