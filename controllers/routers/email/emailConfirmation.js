const express = require('express')
const router = express.Router()


const user = require('../../../models/User')
const emailToken = require('../../AuthenticationTokens/emailToken')
const confirmationEmail = require('../../email/sendConfirmationEmail')
const {errorReport, renderErrorPage} = require('../../errorReport')
const flashMessage = require('../../flashMessage')

router.get('/' , flashMessage.setCachingToOff ,  confirmationEmail.verifyEmailCheckToken , async (req , res)=>
{
    const userInfo = await user.findOne({_id : req.userId})
    res.render('email/confirmEmail' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , emailAddress:userInfo.emailAddress})
})

router.get('/resendEmail' , confirmationEmail.verifyEmailCheckToken , flashMessage.setCachingToOff , async (req , res)=>
{
    
    const userInfo = await user.findOne({_id:req.userId})
    if(userInfo == undefined)
        flashMessage.showFlashMessage(404 , 'Could not find user account' , req , res , '0')
        
    else if(userInfo.conformed == true)
        flashMessage.showFlashMessage(409 , 'Your Email is already verified' , req , res)
        
    else{
        confirmationEmail.sendConfirmationEmail(userInfo)
        flashMessage.showFlashMessage(200 , 'A new email has been send' , req , res , '1')
    }

})

router.get('/modifyEmail' , confirmationEmail.verifyEmailCheckToken,  async (req , res)=>
{
    
    const userInfo = await user.findOne({_id: req.userId})
    if(userInfo == undefined)
        flashMessage.showFlashMessage(404 , 'Could not find user account' , req , res , '0'  , '/emailConfirmation')
    else if(userInfo.conformed == true)
        flashMessage.showFlashMessage(409 , 'Your Email is already verified' , req , res , '0' ,  '/emailConfirmation')
    else
        res.render('email/modifyEmail' , {emailAddress:userInfo.emailAddress , message: req.flash('message')[0] , messageType:req.flash('messageType')[0]})
})

router.post('/modifyEmail' , confirmationEmail.verifyEmailCheckToken ,  async (req , res)=>
{
    try
    {
        const updateQuery = await user.updateUser({_id:req.userId} , {emailAddress : req.body.emailAddress})
        if (!(updateQuery.acknowledged && updateQuery.modifiedCount === 1))
            throw new Error('Could not found user account')
        const newUser = await user.findById({_id:req.userId})
        confirmationEmail.sendConfirmationEmail(newUser)
        flashMessage.showFlashMessage(200 , 'Email Updated Successfully a new verification email was sent to your new email address' , req , res , '1' , '/emailConfirmation')
    }
    catch(err)
    {
        const error = errorReport(err)
        flashMessage.showFlashMessage(error.statusCode , error.errors.emailAddress , req ,res , '0')
    }
})

router.get('/checkVerify' , confirmationEmail.verifyEmailCheckToken , flashMessage.setCachingToOff , async (req , res) =>
{
    const userInfo = await user.findOne({_id:req.userId})
    if(userInfo == undefined)
        flashMessage.showFlashMessage(404 , 'Could not find user account' , req , res , '0') 
    else if(userInfo.conformed == false)
        flashMessage.showFlashMessage(409 , 'Email has yet to be verifyed' , req , res , '0')
    else 
        flashMessage.showFlashMessage(200 , 'Email Verified' , req , res , '1' ,  '/login')

})

router.get('/:emailToken' , async (req , res)=>
{
   
    const tokenInfo = emailToken.verifyEmailConfirmationToken(req.params.emailToken);
    if(tokenInfo.statusCode)
        renderErrorPage(res , 401)
    else
    {
        let userId = await tokenInfo.userId
        await user.updateOne({_id:userId} , {conformed:true})
        res.status(200).json({message:'Your Email was verified successfully'})  //placeholder will have a seperate html page instead
    }
})

module.exports = router