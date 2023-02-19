const express = require('express')
const Student = require('../../../models/Student')
const router = express.Router()
const flashMessage = require('../../flashMessage')
const errorReport = require('../../errorReport')

router.get('/' ,flashMessage.setCachingToOff ,  (req , res)=>
{
    res.render('register/registerStudent' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0]})
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