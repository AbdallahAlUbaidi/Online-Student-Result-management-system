const express = require('express')
const router = express.Router();

const {errorReport , renderErrorPage} = require('../../errorReport')
const {showFlashMessage} = require('../../flashMessage')
const {parseGrades} = require('../../parseGrades');
const Grade = require('../../../models/Grade')
const Course = require('../../../models/Course')
const Student = require('../../../models/Student')
const Faculty = require('../../../models/Faculty')


//All roles aside from student

router.get('/:courseTitle/faculty' , async (req , res)=>{
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'evaluationScore' , 'midTermScore'] , req.params.courseTitle , res)
    res.json({fields , records})
})

router.get('/:courseTitle/branchHead' , async (req , res)=>{
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'preFinalScore'] , req.params.courseTitle , res)
    res.json({fields , records})
})

router.get('/:courseTitle/examCommittee' , async (req , res)=>{
    const {fields , records} = await parseGrades(['studentFullName' , 'gradeStatus' , 'preFinalScore' , 'finalExamScore' , 'totalScore'] , req.params.courseTitle , res)
    res.json({fields , records})
})

router.get('/student' , async (req , res)=>{

})

//Only faculty and exam committee
router.post(':course/:role/save' , async (req , res)=>{

})

//Only faculty
router.post(':course/submit' , (req , res)=>{

})

//Only branch head
router.post(':course/approve' , (req , res)=>{

})

//Only branch head
router.post(':course/reject' , (req , res)=>{

})

//Only exam committee
router.post(':course/publish' , (req , res)=>{
    
})





module.exports = router;
