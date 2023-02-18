const express = require('express')

const Faculty = require('../../../models/Faculty')
const flashMessage = require('../../flashMessage')
const errorReport = require('../../errorReport')
const router = express.Router()

router.get('/' , flashMessage.setCachingToOff , (req , res)=>
{
    res.render('register/facultyRegister' , {message:req.flash('message')})
})

router.post('/' ,flashMessage.setCachingToOff, async(req , res)=>
{
    try{
        const userId = req.auth.userId
        await Faculty.create({
            userInfo:userId,
            id_num:req.body.id_num,
            department:req.body.department,
            specialty:req.body.specialty
        })
        res.redirect('/courses')
    }catch(err){
        const errorInfo = errorReport(err)
        if(errorInfo.statusCode === 500)
            res.status(errorInfo.statusCode).render('errorPages/serverError')
        else if(errorInfo.errors.userInfo)
            flashMessage.showFlashMessage(errorInfo.statusCode , errorInfo.errors.userInfo , req , res)
        else
            res.status(errorInfo.statusCode).render('register/facultyRegister' , {errors: errorInfo.errors}) 
    }
})

module.exports = router