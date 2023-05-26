const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {errorReport, renderErrorPage} = require('../../errorReport');
const { uploadImage } = require('../../imageUpload');
const {imageResize , renameImageDirectory , deleteImageDirectory} = require('../../imageResize');
const {showFlashMessage , setCachingOff} = require('../../flashMessage');
const Course = require('../../../models/Course');
const Faculty = require('../../../models/Faculty');
const { validateAccess } = require('../../accessControl');

const rolesMap = {
    faculty:{
        coursesPageView:'courses/facultyPages/coursesPage',
        coursePageView:'courses/facultyPages/coursePage'
    },
    branchHead:{
        coursesPageView:'courses/branchHeadPages/myCoursesPage',
        coursePageView:'courses/branchHeadPages/myCoursePage'
    },
    examCommittee:{
        coursesPageView:'courses/examCommitteePages/myCoursesPage',
        coursePageView:'courses/examCommitteePages/myCoursePage'
    }
}

router.get('/' , validateAccess(["faculty"] , false , "page") , async(req , res)=> {   
    const {userInfo , roleInfo} = req.info
    const {roles} = userInfo;
    const {courses} = roleInfo;
    res.render( rolesMap[roles[0]].coursesPageView , {courses , role , message:req.flash('message')[0] , messageType:req.flash('messageType')[0]});
})

router.get('/create' , validateAccess(["faculty"] , false , "page") , (req , res)=>{
    res.render('courses/createCourse' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0]})
})

router.post('/create' , validateAccess(["faculty"] , false , "page") , uploadImage , async(req , res )=>{
    const {roleInfo , role} = req.info;
    try{
        const {courseTitle , stage , courseType , bothBranches} = req.body;
        const branch = bothBranches? 'both branches': roleInfo.branch;
        if(req.file)
            await imageResize(res , req , req.file.buffer , courseTitle);
        await Course.createCourse(courseTitle , stage , branch , courseType , roleInfo);
        res.redirect('/courses')
    }catch(err){
        const {errors} = errorReport(err)
        res.render( 'courses/createCourse' , {errors})
    }
})

router.get('/:courseTitle' , validateAccess(["faculty"] , true , "page") , (req , res)=>{
    const {roleInfo , userInfo , roles} = req.info;
    const {role} = userInfo;
    const {courses} = roleInfo;
    const courseIndex = courses.findIndex(courseObject => courseObject.courseTitle.replace(/\s/gm , '-') == req.params.courseTitle)
    if( courseIndex < 0)
        renderErrorPage(res , 404)
    else
        res.render( rolesMap[roles[0]].coursePageView , {course:courses[courseIndex] , role:roles[0] , message:req.flash('message')[0] , messageType:req.flash('messageType')[0]});
})



router.get('/:courseTitle/edit' , validateAccess(["faculty"] , true , "page") , async (req , res) => {
    const courseTitle = req.params.courseTitle.replace(/-/gm, ' ');;
    const courseURL = req.params.courseTitle;
    const {stage , branch , courseType} = req.course;
    res.render('courses/editCourse' , {courseTitle , stage , courseType ,  bothBranches: branch === 'both branches' , courseURL});
})

router.post('/:courseTitle/edit' , validateAccess(["faculty"] , true , "page") , uploadImage , async (req , res) => {
    try{
        const newCourse = req.body;
        const {roleInfo , role} = req.info;
        newCourse.branch = newCourse.bothBranches? 'both branches': roleInfo.branch;
        const currentCourseTitle = req.params.courseTitle.replace(/-/g, ' ');;
        const courseQuery = await Course.find({courseTitle:currentCourseTitle} , { courseTitle:1 , stage:1 , branch:1 , courseType:1});
        const currentCourse = courseQuery[0];
        const fields = Object.keys(currentCourse._doc)
        const updatedFields = {};
        fields.forEach(field =>{
            if(currentCourse[field] !== newCourse[field]){
                updatedFields[field] = newCourse[field];
            }
        });
        const newCourseTitle = updatedFields.courseTitle? updatedFields.courseTitle : currentCourseTitle;
        const newCourseURL = updatedFields.courseTitle? updatedFields.courseTitle.replace(/\s/gm , '-') : req.params.courseTitle;
        let queryResult = {};
        if(updatedFields.stage || updatedFields.branch || updatedFields.courseType) {
            await Course.deleteRelatedData(currentCourse);
            queryResult = await Course.updateOne({courseTitle:currentCourseTitle} , updatedFields , {runValidators:true});
            const newCourseObj = await Course.findOne({courseTitle:newCourseTitle});
            await Course.updateRelatedData(newCourseObj);
        }else
            queryResult = await Course.updateOne({courseTitle:currentCourseTitle} , updatedFields , {runValidators:true});

        if(req.file){
            const dir = path.join(__dirname , '..' , '..' , '..' ,  "public" , "images" , 'courseImages' , currentCourseTitle);
            fs.rmSync(dir, { recursive: true, force: true });
            await imageResize(res , req , req.file.buffer , newCourseTitle);
            req.newImage = true;
        }else{
            renameImageDirectory(currentCourseTitle , newCourseTitle);
        }
        if(queryResult.acknowledged){
            showFlashMessage(200 , "Course Edited Successfully" , req , res , 1 , `/courses/${newCourseURL}`);
        }else{
            if(!req.newImage){
                showFlashMessage(200 , "No changes were made to the course information" , req , res , 2 , `/courses/${newCourseURL}`);
            }else{
                showFlashMessage(200 , "Course Image was updated successfully" , req , res , 1 , `/courses/${newCourseURL}`);
            }
        }
    }catch(err){
        const {statusCode , errors} = errorReport(err);
        if(statusCode in [500 , 404 , 401]){
            renderErrorPage(res , statusCode);
        }else{
            res.render( 'courses/editCourse' , {errors , courseURL:req.params.courseTitle.replace(/\s/gm , "-")});
        }
    }
})

router.get('/:courseTitle/delete' , validateAccess(["faculty"] , true , "page") , async ( req , res ) => {
    const {roleInfo} = req.info;
    try{
        const courseTitle = req.params.courseTitle.replace(/-/gm, ' ');
        const course = req.course;
        const queryResult = await Course.deleteOne({courseTitle});

        if(!queryResult.acknowledged){
            showFlashMessage(500 , "An error occured while deleting the course" , req , res , 0);
        }else{
            if(queryResult.deletedCount === 1){
                const dir = path.join(__dirname , '..' , '..' , '..' ,  "public" , "images" , 'courseImages' , courseTitle);
                fs.rmSync(dir, { recursive: true, force: true });
                await Course.deleteRelatedData(course , roleInfo);
                showFlashMessage(200 , "Course was deleted successfully" , req , res , 1 , `/courses`);
            }else{
                showFlashMessage(404 , "Could not find the course" , req , res , 0 , `/courses`);
            }
        }
    }catch(err){
        const {statusCode} = errorReport(err);
        renderErrorPage(res , statusCode);
    }
})
module.exports = router