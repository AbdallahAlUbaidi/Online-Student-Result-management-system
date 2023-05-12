const express = require('express')

const Faculty = require('../../../models/Faculty')
const flashMessage = require('../../flashMessage')
const {errorReport, renderErrorPage} = require('../../errorReport')
const router = express.Router()
// const mainPage = {
//     faculty:"/courses",
//     branchHead:"/facultyMembers",
//     examCommittee:"/courses" //Temp
// }
router.get('/' , flashMessage.setCachingToOff , (req , res)=>
{
    res.render('register/facultyRegister' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0]})
})

router.post('/' ,flashMessage.setCachingToOff, async(req , res)=>
{
    try{
        const userId = req.auth.userId
        const {id_num , department , specialty , branch} = req.body
        await Faculty.create({userInfo:userId,id_num,department,specialty , branch})
        res.redirect('/')
    }catch(err){
        const errorInfo = errorReport(err)
        if(errorInfo.statusCode === 500)
            renderErrorPage(500)
        else if(errorInfo.errors.userInfo)
            flashMessage.showFlashMessage(errorInfo.statusCode , errorInfo.errors.userInfo , req , res , '0')
        else
            res.status(errorInfo.statusCode).render('register/facultyRegister' , {errors: errorInfo.errors}) 
    }
})

module.exports = router