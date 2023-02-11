const express = require('express')
const Student = require('../../../models/Student')
const router = express.Router()
const flashMessage = require('../../flashMessage')
const errorReport = require('../../errorReport')

router.get('/' ,flashMessage.setCachingToOff ,  (req , res)=>
{
    res.render('register/registerStudent' , {message:req.flash('message')})
})


router.post('/' , async(req , res)=>
{
    try{
        userId = req.auth.userId
        await Student.create({
            userInfo:userId.toLowerCase(),
            student_id:req.body.student_id.toLowerCase(),
            stage:req.body.stage.toLowerCase(),
            branch:req.body.branch.toLowerCase(),
            study:req.body.study.toLowerCase()
        })
        res.redirect('/testTokens') //For testing purposes in future will be course , dashboard or similer landing page
    }catch(err){
        const errorInfo = errorReport(err)
        if(errorInfo.statusCode === 500)
            res.status(errorInfo.statusCode).render('errorPages/serverError')
        res.status(errorInfo.statusCode).render('register/registerStudent' , {errors: errorInfo.errors}) 
    }
})


module.exports = router