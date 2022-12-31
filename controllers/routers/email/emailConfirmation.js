const express = require('express')
const router = express.Router()


const user = require('../../../models/User')
const emailToken = require('../../AuthenticationTokens/emailToken')
const confirmationEmail = require('../../email/sendConfirmationEmail')
const errorReport = require('../../errorReport')
const flashMessage = require('../../flashMessage')

router.get('/' , flashMessage.setCachingToOff ,  confirmationEmail.verifyEmailCheckToken , async (req , res)=>
{
    const userInfo = await user.findOne({_id : req.userId})
    res.render('email/confirmEmail' , {message:req.flash('message') , emailAddress:userInfo.emailAddress})
})

router.get('/resendEmail' , confirmationEmail.verifyEmailCheckToken , flashMessage.setCachingToOff , async (req , res)=>
{
    
    const userInfo = await user.findOne({_id:req.userId})
    if(userInfo == undefined)
        flashMessage.showFlashMessage(404 , 'Could not find user account' , req , res)
        
    else if(userInfo.conformed == true)
        flashMessage.showFlashMessage(409 , 'Your Email is already verified' , req , res)
        
    else{
        confirmationEmail.sendConfirmationEmail(userInfo)
        flashMessage.showFlashMessage(200 , 'A new email has been send' , req , res)
    }

})

router.get('/modifyEmail' , confirmationEmail.verifyEmailCheckToken,  async (req , res)=>
{
    const userInfo = await user.findOne({_id: req.userId})
    if(userInfo == undefined)
        flashMessage.showFlashMessage(404 , 'Could not find user account' , req , res  , '/emailConfirmation')
    else if(userInfo.conformed == true)
        flashMessage.showFlashMessage(409 , 'Your Email is already verified' , req , res , '/emailConfirmation')
    else
        res.render('email/modifyEmail' , {emailAddress:userInfo.emailAddress , message: req.flash('message')[0]})
})

router.post('/modifyEmail' , confirmationEmail.verifyEmailCheckToken ,  async (req , res)=>
{
    try
    {
        const newUser = await user.updateUser({_id:req.userId} , {emailAddress : req.body.emailAddress})
        confirmationEmail.sendConfirmationEmail(newUser)
        flashMessage.showFlashMessage(200 , 'Email Updated Successfully a new verification email was sent to your new email address' , req , res  , '/emailConfirmation')
    }
    catch(err)
    {
        const error = errorReport(err)
        flashMessage.showFlashMessage(error.statusCode , error.errors.emailAddress , req ,res)
    }
})

router.get('/checkVerify' , confirmationEmail.verifyEmailCheckToken , flashMessage.setCachingToOff , async (req , res) =>
{
    const userInfo = await user.findOne({_id:req.userId})
    if(userInfo == undefined)
        flashMessage.showFlashMessage(404 , 'Could not find user account' , req , res)  //Might be changed into seperate HTML page
    else if(userInfo.conformed == false)
        flashMessage.showFlashMessage(409 , 'Email has yet to be verifyed' , req , res)
    else 
        flashMessage.showFlashMessage(200 , 'Email Verified' , req , res)

})

router.get('/:emailToken' , async (req , res)=>
{
   
    let userId = await emailToken.verifyEmailConfirmationToken(req.params.emailToken).userId
    await user.updateOne({_id:userId} , {conformed:true})
    res.status(200).json({message:'Your Email was verified successfully'})  //placeholder will have a seperate html page instead
})

module.exports = router