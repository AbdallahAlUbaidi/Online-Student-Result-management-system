const express = require('express');
const router = express.Router();
const Faculty = require('../../../models/Faculty');
const {errorReport , renderErrorPage} = require('../../errorReport');

router.get('/' , async (req , res) => {
    try{
        const {roleInfo , userInfo} = req.info;
        const {branch} = req.info.roleInfo;
        let facultyMembers = await Faculty.find({branch}).populate("userInfo","_id username");
        const branchHead = facultyMembers.filter(fm => fm.id_num == roleInfo.id_num)[0];
        facultyMembers = facultyMembers.filter(fm => fm.id_num !== roleInfo.id_num);
        res.render('facultyMembers/facultyMembersPage' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , facultyMembers , branchHead});
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
});

router.get('/:facultyId' , async (req , res) => {
    try{
        const facultyMember = await Faculty.findOne({id_num:req.params.facultyId}).populate("courses");
        res.render('courses/branchHeadPages/facultyCourses' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , courses:facultyMember.courses , facultyMember});
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }

});

router.get("/:facultyId/:courseTitle" , async (req , res) => {
    try{
        const facultyMember = await Faculty.findOne({id_num:req.params.facultyId}).populate("courses");
        const courseTitle =  req.params.courseTitle.replace(/-/gi , " ");
        const course = facultyMember.courses.filter(course => course.courseTitle === courseTitle)[0];
        res.render('courses/branchHeadPages/facultyCourse' , {message:req.flash("message")[0] , messageType:req.flash("messageType")[0] , course , facultyMember});
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
})

module.exports = router;