const express = require('express')
const router = express.Router()

const {errorReport , renderErrorPage} = require('../../errorReport')
const { showFlashMessage } = require('../../flashMessage')
const {generateEmailCheckToken , verifyEmailCheckToken , verifyEmailConfirmationToken} = require('../../AuthenticationTokens/emailToken')
const sendPasswordRecoveryEmail = require('../../email/sendPasswordRecoveryEmail')

const User = require('../../../models/User')


router.get('/' , (req , res) =>{
    res.render('passwordRecovery/retrievePassword' , {message: req.flash('message')[0] , messageType:req.flash('messageType')[0]})
})

router.get('/recoveryEmail' , verifyPasswordRecoveryToken , async (req , res)=>{
    const {emailAddress} = await User.findOne({_id:req.userId})
    res.render('passwordRecovery/retrievePasswordEmailSent' , {emailAddress , message:req.flash('message')[0] , messageType:req.flash('messageType')[0]})
})

router.post('/' , async (req , res)=>{
    try{
        const {emailAddress , username} = req.body;
        const user = await User.findOne({emailAddress , username})
        if(!user)
            showFlashMessage(404 , 'Could not find a user with specifyed email and username' , req , res , '0')
        else{
            await sendPasswordRecoveryEmail(user)
            res.cookie('passwordRecovryToken' , `bearer ${generateEmailCheckToken(user)}` , {path:'/login/retrievePassword' , httpOnly:true})
            res.redirect('/login/retrievePassword/recoveryEmail')
        }
    }catch(err){
        const errorInfo = errorReport(err)
        if(errorInfo.statusCode === 500)
            renderErrorPage(res , 500)
        else
            showFlashMessage(err.statusCode , err.message , req , res , '0')
    }
})

router.get('/resendEmail' , verifyPasswordRecoveryToken , async (req , res)=>{
    const user = await User.findOne({_id:req.userId})
    if(!user)
        showFlashMessage(404 , 'Could not find user account' , req , res , '0')
    else{
        await sendPasswordRecoveryEmail(user)
        res.cookie('passwordRecovryToken' , `bearer ${generateEmailCheckToken(user)}` , {path:'/login/retrievePassword' , httpOnly:true})
        showFlashMessage(200 , 'A new email was sent' , req , res , '1')
    }

})


router.get('/:token' , async(req , res)=>{
    res.cookie('resetPassword' , req.params.token , {httpOnly:true , path:`/login/retrievePassword/${req.params.token}`})
    res.render('passwordRecovery/enterNewPassword' , {token:req.params.token})
})

router.post('/:token'  , async (req , res)=>{
    const {password, confirmPassword} = req.body
    const {userId} = await verifyEmailConfirmationToken(req.params.token)
    try{
        await User.updatePassword({_id:userId} , password , confirmPassword)
        res.status(200).json({message:'Your password was updated successfully'})  //Placeholder will have a seprate page
    }catch(err){
        const {statusCode , errors , message} = errorReport(err)
        if(statusCode === 500)
            renderErrorPage(res , 500)
        else if(message)
            showFlashMessage(statusCode , message , req ,res , '0')
        else
            res.render('passwordRecovery/enterNewPassword' , {errors})
            
    }
})

function verifyPasswordRecoveryToken(req , res , next){
    const cookie = req.cookies.passwordRecovryToken
    if(!cookie){renderErrorPage(res , 401); return;}
    const token = cookie.split(' ')[1]
    try{req.userId = verifyEmailCheckToken(token).userId}
    catch(err){
        const {statusCode , message} = err
        if(statusCode === 500)
            renderErrorPage(res , 500)
        else
            showFlashMessage(statusCode , message , req ,res ,'0')
    }
    if(!req.userId)
        renderErrorPage(res , 401)
    else
        next()
}

module.exports = router