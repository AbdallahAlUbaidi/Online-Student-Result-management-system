const express = require('express')
const router = express.Router()

const errorReport = require('../errorReport')
const sendConfirmationEmail = require('../email/emailConfirmation').sendConfirmationEmail


const user = require('../../models/User')
const Student = require('../../models/Student')
const faculty = require('../../models/Faculty')


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
        res.status(201).send('User created successfully')
    }
    catch(error)
    {
        const errorInfo = errorReport(error)
        res.status(errorInfo.statusCode).send(errorInfo.errors)
    }
})





module.exports = router