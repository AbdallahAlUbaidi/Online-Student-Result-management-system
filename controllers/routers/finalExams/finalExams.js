const express = require('express');
const Course = require('../../../models/Course');
const router = express.Router();

const {errorReport, renderErrorPage} = require('../../errorReport');


//Exam committee only
router.get('/' , async (req , res ) => {
    try{
        const finalExams = await Course.find();
        res.render('courses/examCommitteePages/finalExamsPage' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , finalExams});
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
});

router.get('/:courseTitle' , async (req , res) => {
    try{
        const courseTitle = req.params.courseTitle.replace(/-/gi , " ");
        const finalExam = await Course.findOne({courseTitle});
        if(!finalExam)
            renderErrorPage(res , 404);
        else
            res.render('courses/examCommitteePages/finalExamPage' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , finalExam});
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
})

module.exports = router;