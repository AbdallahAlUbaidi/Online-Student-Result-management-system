const express = require('express')
const router = express.Router()
const {errorReport, renderErrorPage} = require('../../errorReport')

const Course = require('../../../models/Course')
const Faculty = require('../../../models/Faculty')

const rolesMap = {
    faculty:{
        coursesPageView:'courses/facultyPages/coursesPage',
        coursePageView:'courses/facultyPages/coursePage'
    },
    branchHead:{
        coursesPageView:'courses/branchHeadPages/coursesPage',
        coursePageView:'courses/branchHeadPages/coursePage'
    },
    examCommittee:{
        coursesPageView:'courses/examCommiteePages/coursesPage',
        coursePageView:'courses/examCommiteePages/coursePage'
    }
}

router.get('/' , async(req , res)=>
{
    const {userInfo , roleInfo} = req.info
    const {role} = userInfo;
    const {courses} = roleInfo
    res.render( rolesMap[role].coursesPageView , {courses , role})
})

router.get('/createCourse' , (req , res)=>{
    res.render('courses/createCourse')
})

router.post('/createCourse' , async(req , res )=>{
    const {roleInfo , role} = req.info;

    try{
        const {courseTitle , stage , courseType , bothBranches} = req.body;
        const branch = bothBranches? 'both branches': roleInfo.branch;
        await Course.createCourse(courseTitle , stage , branch , courseType , roleInfo);
        res.redirect('/courses')
    }catch(err){
        const {errors} = errorReport(err)
        res.render( rolesMap[role] , {errors})
    }
})

router.get('/:courseTitle' , (req , res)=>{
    const {roleInfo , userInfo} = req.info;
    const {role} = userInfo;
    const {courses} = roleInfo
    const courseIndex = courses.findIndex(courseObject => courseObject.courseTitle.replace(/\s/gm , '-') == req.params.courseTitle)
    if( courseIndex < 0)
        renderErrorPage(res , 404)
    else
        res.render( rolesMap[role].coursePageView , {course:courses[courseIndex] , role})  //Placeholder
})



module.exports = router