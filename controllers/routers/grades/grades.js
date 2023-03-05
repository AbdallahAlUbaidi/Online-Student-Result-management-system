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
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'evaluationScore' , 'midTermScore'] , req.params.courseTitle , res , 'faculty')
    res.json({fields , records})
})

router.get('/:courseTitle/branchHead' , async (req , res)=>{
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'preFinalScore'] , req.params.courseTitle , res , 'branchHead')
    res.json({fields , records})
})

router.get('/:courseTitle/examCommittee' , async (req , res)=>{
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'finalExamScore'  , 'totalScore'] , req.params.courseTitle , res , 'examCommittee')
    res.json({fields , records})
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
    let bulkOperations = [];
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
            bulkOperations.push({
                updateOne:{
                    filter:{student:record.studentId , course:courseId , gradeStatus:gradeStageRequirement},
                    update:updatedFields
                }
            })
    })
    try{
        if(bulkOperations.length !== 0)
             await Grade.bulkWrite(bulkOperations);
        res.sendStatus(200);
    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , errors});
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
