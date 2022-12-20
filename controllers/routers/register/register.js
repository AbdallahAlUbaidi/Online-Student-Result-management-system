const express = require('express')
const router = express.Router()

const errorReport = require('../../errorReport')
const sendConfirmationEmail = require('../../email/emailConfirmation').sendConfirmationEmail
const emailToken = require('../../AuthenticationTokens/emailToken')



const user = require('../../../models/User')
const Student = require('../../../models/Student')
const faculty = require('../../../models/Faculty')


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
        res.cookie('Authorization' , `bearer ${emailToken.generateEmailCheckToken(newUser)}` , {path:'/emailConfirmation' , httpOnly:true})
        res.cookie('message' , '' , {path:'/emailConfirmation'})
        res.cookie('msgType' , '' , {path:'/emailConfirmation'})
        res.status(201).redirect('/emailConfirmation')
    }
    catch(error)
    {
        const errorInfo = errorReport(error)
        res.status(errorInfo.statusCode).render( 'register/register', {errors: errorInfo.errors})
    }
})




module.exports = router