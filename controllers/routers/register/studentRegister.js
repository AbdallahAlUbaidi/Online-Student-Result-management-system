const express = require('express')
const Student = require('../../../models/Student')
const router = express.Router()
const flashMessage = require('../../flashMessage')
const errorReport = require('../../errorReport')

router.get('/' ,flashMessage.setCachingToOff ,  (req , res)=>
{
    res.render('register/registerStudent' , {message:req.flash('message') , messageType:req.flash('messageType')})
})


router.post('/' , async(req , res)=>
{
    try{
        userId = req.auth.userId
        await Student.create({
            userInfo:userId,
            student_id:req.body.student_id,
            stage:req.body.stage,
            branch:req.body.branch,
            study:req.body.study
        })
        res.redirect('/courses') 
    }catch(err){
        const errorInfo = errorReport(err)
        if(errorInfo.statusCode === 500)
            res.status(errorInfo.statusCode).render('errorPages/serverError')
        else
            res.status(errorInfo.statusCode).render('register/registerStudent' , {errors: errorInfo.errors}) 
    }
})


module.exports = router