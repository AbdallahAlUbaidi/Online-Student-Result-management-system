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


//All roles aside from student

router.get('/:courseTitle/faculty' , async (req , res)=>{
    const {fields , records , message} = await parseGrades(['studentFullName' , 'gradeStatus' , 'evaluationScore' , 'midTermScore'] , req.params.courseTitle , res , 'faculty');
    res.json({fields , records , message});
})

router.get('/:courseTitle/branchHead' , async (req , res)=>{
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'preFinalScore'] , req.params.courseTitle , res , 'branchHead')
    res.json({fields , records , message});
})

router.get('/:courseTitle/examCommittee' , async (req , res)=>{
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'finalExamScore'  , 'totalScore'] , req.params.courseTitle , res , 'examCommittee')
    res.json({fields , records , message});
})

router.get('/student' , async (req , res)=>{

})

//Only faculty and exam committee
router.post('/:courseTitle/save' , async (req , res)=>{
    const {role} = req.info.userInfo;
    const gradeStageRequirement = role === 'faculty' ? 'notGraded' : 'pendingFinalExam' //Temprary
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
        if(operations.length !== 0)
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

    }catch(err){
        console.log(err) //Debug
        const {statusCode , message , errors} = errorReport(err)
        console.log({ message , errors , student:err.student}); //Debug
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
        submitedRecords.forEach(record =>{
            bulkOperations.push({
                updateOne:{
                    filter:{course:courseId , student:record.studentId , gradeStatus:'notGraded'},
                    update:{gradeStatus:'pendingApproval'}
                }
            })
        })
        await Grade.bulkWrite(bulkOperations);
        res.sendStatus(200);
    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , errors});

    }
})

//Only branch head
router.post('/:courseTitle/approve' , (req , res)=>{

})

//Only branch head
router.post('/:courseTitle/reject' , (req , res)=>{

})

//Only exam committee
router.post(':course/publish' , (req , res)=>{
    
})





module.exports = router;
