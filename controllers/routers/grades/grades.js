const express = require('express')
const router = express.Router();

const {errorReport , renderErrorPage} = require('../../errorReport')
const {showFlashMessage} = require('../../flashMessage')
const {parseGrades} = require('../../parseGrades');
const Grade = require('../../../models/Grade')
const Course = require('../../../models/Course')
const Student = require('../../../models/Student')
const Faculty = require('../../../models/Faculty');
const { updateOne } = require('../../../models/Faculty');
const mongoose = require("mongoose");


//All roles aside from student

router.get('/:courseTitle/faculty' , async (req , res)=>{
    const {fields , records , message , totalPages , currentPage} = await parseGrades(['studentFullName' , 'gradeStatus' , 'evaluationScore' , 'midTermScore'] , req.params.courseTitle , res , 'faculty' , req.query.page , req.query.filter);
    res.json({fields , records , message , totalPages , currentPage});
})

router.get('/:courseTitle/branchHead' , async (req , res)=>{
    const {fields , records , message , totalPages , currentPage} = await parseGrades(['studentFullName' , 'gradeStatus' , 'preFinalScore'] , req.params.courseTitle , res , 'branchHead' , req.query.page , req.query.filter)
    res.json({fields , records  , message , totalPages , currentPage});
})

router.get('/:courseTitle/examCommittee' , async (req , res)=>{
    const {fields , records , message , totalPages , currentPage} = await parseGrades(['studentFullName' , 'gradeStatus' , 'finalExamScore'  , 'totalScore'] , req.params.courseTitle , res , 'examCommittee' , req.query.page , req.query.filter)
    res.json({fields , records , message , totalPages , currentPage});
})

router.get('/student' , async (req , res)=>{

})

//Only faculty and exam committee
router.post('/:courseTitle/save' , async (req , res)=>{
    const {role} = req.query;
    const gradeStageRequirement = role === 'faculty'  ? 'notGraded' : 'pendingFinalExam' //Temprary
    let {courseTitle} = req.params;
    courseTitle = courseTitle.split('-').join(' ');
    const course = await Course.findOne({courseTitle})
    const courseId = course._id;
    const updatedRecordsArray = req.body;
    let operations = [];
    const getUpdatedFields = (record)=>{
        const fields = Object.keys(record);
        let updateObj = {};
        fields.forEach(field => {
            if(field !== 'studentId'){
                updateObj['$set'] = updateObj['$set'] || {};
                updateObj['$set'][field] = record[field];
        }
        });
        return updateObj;
    }
    updatedRecordsArray.forEach(async record =>{
        const updatedFields = getUpdatedFields(record);
        if(Object.keys(updatedFields).length !== 0)
            operations.push(Grade.updateOne(
                {student:record.studentId , course:courseId , gradeStatus:gradeStageRequirement},
                updatedFields,
                {runValidators: true}
            ));
    })
    try{
        let results;
        let errors ={
            student:null,
            reason:null
        };
        if(operations.length !== 0){            
            results = await Promise.allSettled(operations.map((p,index)=>p.catch(err=> Promise.reject({student:p._conditions.student , err}))));
            errors = results.map((r , index)=>{
                if(r.status !== "fulfilled"){
                    let error = {};
                    error.student = r.reason.student;
                    error.reason = {
                        message: errorReport(r.reason.err).message,
                        errors: errorReport(r.reason.err).errors
                    }
                    return error;
                }
                }).filter(err => err);
                results = results.map((r,index)=>{
                    if(r.status === 'fulfilled')
                        return r.value;
                }).filter(r => r);
                if(errors.length > 0)
                    res.status(400).json({errors});
                else
                    res.status(200).json({results});
            }else{
                res.status(200).json({message:"There are no grades to save or cannot be saved"});
            }

    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , errors });
    }
})

//Only faculty
router.post('/:courseTitle/submit' , async (req , res)=>{
    try{
        let {courseTitle} = req.params;
        courseTitle = courseTitle.split('-').join(' ');
        const course = await Course.findOne({courseTitle})
        const courseId = course._id;
        const submitedRecords = req.body;
        let bulkOperations = [];
        let invalidGradesCount = 0;
        for( i in submitedRecords ) {
            const record = submitedRecords[i];
            const grade = await Grade.findOne({course:courseId , student:record.studentId , evaluationScore:{$exists:true} , midTermScore:{$exists:true}});
            if(!grade){
                invalidGradesCount++;
                continue;
            }
            bulkOperations.push({
                updateOne:{
                    filter:{course:courseId , student:record.studentId , gradeStatus:'notGraded'},
                    update:{gradeStatus:'pendingApproval'}
                }
            })
        }
        const {result} = await Grade.bulkWrite(bulkOperations);
            if(!result.ok)
                res.status(500).json({message:"Something went wrong while submitting grades"});
            else if(invalidGradesCount > 0)
                res.status(200).json({message:`${invalidGradesCount} of the grades you are trying to submit ${invalidGradesCount === 1 ? "is" : "are" } invalid` , messageType: 2});
            else{
                res.status(200).json({message:"Grades submitted successfully" , messageType: 1});
            }
    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , errors});
    }
})

//Only branch head
router.post('/:courseTitle/approve' , async (req , res)=>{
    try{
        const courseTitle = req.params.courseTitle.trim().replace(/-/i , " ");
        const course = await Course.findOne({courseTitle});
        const {students} = req.body;
        let queries = [];
        students.forEach(student => {
            student = mongoose.Types.ObjectId(student)
            const query = Grade.updateOne(
                    {course:course._id , student , gradeStatus:"pendingApproval"} ,
                    {gradeStatus:"pendingFinalExam"}
                 );
            queries.push(query);
        });
        let results = await Promise.allSettled(queries);
        let errors = results.map(r => r.status === "rejected"? r.reason: null).filter( r => r);
        results = results.map(r => {
            return r.status === "fulfilled" ? r.value : null;
        }).filter(result => result && result.modifiedCount !== 0);
        if(errors.length > 0)
            res.status(400).json({errors});
        else if(results.length == 0)
            res.status(200).json({message:"There are no grades to approve" , messageType:2});
        else
            res.status(200).json({results});
    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , messageType:0 , errors});
    }
})

//Only branch head
router.post('/:courseTitle/reject' , async (req , res)=>{
    try{
        const courseTitle = req.params.courseTitle.trim().replace(/-/i , " ");
        const course = await Course.findOne({courseTitle});
        const {students} = req.body;
        let queries = [];
        students.forEach(student => {
            student = mongoose.Types.ObjectId(student)
            const query = Grade.updateOne(
                    {course:course._id , student , gradeStatus:"pendingApproval"} ,
                    {gradeStatus:"notGraded"}
                 );
            queries.push(query);
        });
        let results = await Promise.allSettled(queries);
        let errors = results.map(r => r.status === "rejected"? r.reason: null).filter( r => r);
        results = results.map(r => {
            return r.status === "fulfilled" ? r.value : null;
        }).filter(result => result && result.modifiedCount !== 0);
        if(errors.length > 0)
            res.status(400).json({errors});
        else if(results.length == 0)
            res.status(200).json({message:"There are no grades to reject" , messageType:2});
        else
            res.status(200).json({results});
    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , messageType:0 , errors});
    }
})

//Only exam committee
router.post('/:course/publish' , (req , res)=>{
    
})





module.exports = router;
