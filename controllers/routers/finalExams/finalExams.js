const express = require('express');
const Course = require('../../../models/Course');
const router = express.Router();

const {errorReport, renderErrorPage} = require('../../errorReport');
const {validateAccess} = require("../../accessControl");

//Exam committee only
router.get('/' , validateAccess(["examCommittee"] , false , "page") , async (req , res ) => {
    try{
        const {username , profileImg} = req.info.userInfo;
        const finalExams = await Course.find();
        res.render('courses/examCommitteePages/finalExamsPage' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , finalExams , username , profileImg});
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
});

router.get('/:courseTitle' , validateAccess(["examCommittee"] , false , "page") , async (req , res) => {
    try{
        const {username , profileImg} = req.info.userInfo;
        const courseTitle = req.params.courseTitle.replace(/-/gi , " ");
        const finalExam = req.course;
        if(!finalExam)
            renderErrorPage(res , 404);
        else
            res.render('courses/examCommitteePages/finalExamPage' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , finalExam , username , profileImg});
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
})

module.exports = router;