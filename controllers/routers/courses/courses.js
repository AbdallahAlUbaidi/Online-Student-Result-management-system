const express = require('express')
const router = express.Router()
const errorReport = require('../../errorReport')

const Course = require('../../../models/Course')

router.get('/' , async(req , res)=>
{
    res.render('courses/courses' , {courses:req.info.roleInfo.courses})
})

router.get('/createCourse' , (req , res)=>{
    res.render('courses/createCourse')
})

router.post('/createCourse' , async(req , res )=>{
    try{
        await Course.create({courseTitle:req.body.courseTitle , stage:req.body.stage , branch:req.body.branch})
        res.redirect('/courses')
    }catch(err){
        const errorInfo = errorReport(err)
        res.render('courses/createCourse' , {errors:errorInfo.errors})
    }
})

router.get('/:courseTitle' , (req , res)=>{
    const coursesArray = req.info.roleInfo.courses
    const courseIndex = coursesArray.findIndex(courseObject => courseObject.courseTitle.replace(/\s/gm , '-') == req.params.courseTitle)
    if( courseIndex < 0)
        res.render('errorPages/notFound' , {error:'Could not find the course'})
    else
        res.json({course:coursesArray[courseIndex]})  //Placeholder
})



module.exports = router