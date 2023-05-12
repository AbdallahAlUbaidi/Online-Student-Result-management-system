const express = require('express')
const Student = require('../../../models/Student')
const router = express.Router()
const flashMessage = require('../../flashMessage')
const {errorReport, renderErrorPage} = require('../../errorReport')

router.get('/' ,flashMessage.setCachingToOff ,  (req , res)=>
{
    res.render('register/registerStudent' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0]})
})


router.post('/' , async(req , res)=>
{
    try{
        userId = req.auth.userId
        const {student_id , studentFullName , stage , branch , study} = req.body
        await Student.create({userInfo:userId,studentFullName,student_id,stage,branch,study})
        res.redirect('/') 
    }catch(err){
        const errorInfo = errorReport(err)
        if(errorInfo.statusCode === 500)
            renderErrorPage(res , 500)
        else
            res.status(errorInfo.statusCode).render('register/registerStudent' , {errors: errorInfo.errors}) 
    }
})


module.exports = router