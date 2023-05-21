const express = require('express')
const router = express.Router();

const {errorReport , renderErrorPage} = require('../../errorReport')
const {showFlashMessage} = require('../../flashMessage')
const {parseGrades , getGradesFields , gradeWritableField} = require('../../parseGrades');
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
    try{
        const studentId = req.info.roleInfo._id;
        const grades = await Grade.find({student:mongoose.Types.ObjectId(studentId) , gradeStatus:{$in:["published" , "pendingFinalExam"]}}).populate("course");
        let fields = ["courseTitle" , "preFinalScore" , "finalGrade"];
        let records = [];
        let labsTotalScoreArray = [];
        let labsPreFinalArray = [];
        let gradesByCourse = [];
        grades.forEach(grade => {
            const preFinalScore = grade.evaluationScore + grade.midTermScore;
            const totalScore = grade.finalExamScore + preFinalScore;
            const finalGrade = calculateFinalGrade(totalScore);
            const {courseType , courseTitle} = grade.course;
             let record = {}
             if(courseType === "practical"){
                 labsTotalScoreArray.push(totalScore);
                 labsPreFinalArray.push(preFinalScore);
                 return;
             }
             record.courseTitle = {value:courseTitle , isWritable:false};
             record.preFinalScore = {value:preFinalScore , isWritable:false};
             record.finalGrade = {value:finalGrade , isWritable:false};
             records.push(record);
        });
        if(labsTotalScoreArray.length !== 0){
            const labsTotalScore = Math.round(calculateAverage(labsTotalScoreArray));
            const labsPreFinalScore = Math.round(calculateAverage(labsPreFinalArray));
            const labsFinalGrade = calculateFinalGrade(labsTotalScore);
            records.push({
                 courseTitle:{value:"Labs" , isWritable:false},
                 preFinalScore:{value:labsPreFinalScore , isWritable:false},
                 finalGrade:{value:labsFinalGrade , isWritable:false}
            });
        }
        fields = getGradesFields(fields);
        res.status(200).json({
            fields,
            records,
            currentPage:1,
            totalPages:1
        });
    }catch(err){
        const {statusCode , errors , message } = errorReport(err);
        if(statusCode === 500)
            res.status(statusCode).json({message:"Server Error"});
        else
            res.status(statusCode).json({errors});
    }


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
        const courseTitle = req.params.courseTitle.trim().replace(/-/gi , " ");
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
        const courseTitle = req.params.courseTitle.trim().replace(/-/gi , " ");
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
router.post('/:courseTitle/finilize' , async (req , res)=>{
    try{
        const courseTitle = req.params.courseTitle.trim().replace(/-/gi , " ");
        const course = await Course.findOne({courseTitle});
        const {students} = req.body;
        let queries = [];
        students.forEach(student => {
            student = mongoose.Types.ObjectId(student)
            const query = Grade.updateOne(
                    {course:course._id , student , gradeStatus:"pendingFinalExam" , finalExamScore:{$exists:true}} ,
                    {gradeStatus:"finalized"}
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
            res.status(200).json({message:"There are no grades to finalize" , messageType:2});
        else
            res.status(200).json({results});
    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , messageType:0 , errors});
    }
})

router.post("/:courseTitle/publish" , async (req , res) => {
    try{
        const courseTitle = req.params.courseTitle.trim().replace(/-/gi , " ");
        const course = await Course.findOne({courseTitle});
        const {students} = req.body;
        let queries = [];
        students.forEach(student => {
            student = mongoose.Types.ObjectId(student)
            const query = Grade.updateOne(
                    {course:course._id , student , gradeStatus:"finalized"} ,
                    {gradeStatus:"published"}
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
            res.status(200).json({message:"There are no grades to finalize" , messageType:2});
        else
            res.status(200).json({results});
    }catch(err){
        const {statusCode , message , errors} = errorReport(err)
        res.status(statusCode).json({ message , messageType:0 , errors});
    }
})

//Branch Head only
router.get('/preFinalScorebook' , (req , res) => {
    res.render("courses/branchHeadPages/preFinalScorebook" , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0]});
});

//Branch Head Only
router.get('/preFinalScorebook/scores' , async (req , res) => {
    try{
        let filter = req.query.filter.student;
        filter = Object.fromEntries(
            Object.entries(filter).filter(([_, v]) => v)
          );
        const page = Number(req.query.page);
        const gradesPerPage = 5;
        let message = undefined;
        const result = await Student.aggregate([
            {
                $match: filter
            },
            {
            $group: {
                    _id: null,
                    count: { $sum: 1 },
                    students: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalStudents: "$count",
                    students: {
                    $slice: ["$students", gradesPerPage * (page - 1), gradesPerPage]
                    }
                }
            }
        ]);
        if(result.length === 0)
            message = "No valid grades was found";
        let totalStudents = result.length > 0 ? result[0].totalStudents : undefined;
        let studentsArray = result.length > 0? result[0].students : [];
        let totalPages = Math.ceil((totalStudents? totalStudents : 0) / gradesPerPage);
        let studentsScorebook = await getstudentsScorebook(studentsArray);
        let {records , fields} = parseStudentsPreFinalScorebook(studentsScorebook);
        fields = getGradesFields(fields);
        res.json({records , fields , message , totalPages , currentPage:page});
    }catch(err){
        console.log(err);
    }
});


async function getstudentsScorebook(studentsArray) {
    let queries = [];
    studentsArray.forEach(student => {
        const query = Grade.find({student:student._id} ,  { _id:false , student:false})
        .populate({
            path:"course",
            select:"_id courseTitle courseType"
        });
        queries.push(query)
    });
    let results = await Promise.allSettled(queries);
    for(i in results){
        results[i] = results[i].value;
    }
    results = results.map((result , i) => {
        result = {
            grades:result,
            student_id:studentsArray[i]._id,
            studentFullName:studentsArray[i].studentFullName
        }
        return result;
    })
    return results;
}

function parseStudentsPreFinalScorebook(studentsScorebook){
    let records = [];
    let fields = [];
    fields.push("studentFullName");
    studentsScorebook.forEach(scorebook => {
        const grades = scorebook.grades;
        let record = {};
        let studentFullName = {
            value:scorebook.studentFullName,
            isWriteable:false
        }
        record.studentId = scorebook.student_id;
        record.studentFullName = studentFullName;
        let scores = [];
        let normalizedScoresOrderedList = [];
        let totalScore = 0;
        let averageScore = 0;
        let standardDev = 0;
        grades.forEach(grade => {
            const {courseTitle , courseType} = grade.course;
            const gradeStatus = grade.gradeStatus;
            const maxScore = courseType === "theoretical"? 30 : 50;
            let preFinalScore = NaN;
            if(gradeStatus !== "notGraded")
                preFinalScore = grade.evaluationScore + grade.midTermScore;
            if(preFinalScore !== NaN){
                totalScore += preFinalScore / maxScore;
                normalizedScoresOrderedList.push(preFinalScore / maxScore);
                scores.push({
                    value:preFinalScore,
                    maxScore
                });
            }
            record[courseTitle] = {};
            record[courseTitle].value =  preFinalScore || "";
            record[courseTitle].isWriteable = gradeWritableField.scorebook(null , null);
            record[courseTitle].maxScore = maxScore;
            if(preFinalScore < (maxScore * 0.33))
                record[courseTitle].critical = true;
            else if(preFinalScore >= (maxScore * 0.9))
                record[courseTitle].excellent = true;
            else if(preFinalScore < (maxScore * 0.5))
                record[courseTitle].fail = true;
            if(!fields.includes(courseTitle))
                fields.push(courseTitle);
        });
        // normalizedScoresOrderedList = normalizedScoresOrderedList.sort((a, b) =>  a - b);
        // const {Q1 , Q3 , IQR} = calculateIQR(normalizedScoresOrderedList);
        // record.lowerBound = Q1 - (1.5 * IQR);
        // record.upperBound = Q3 + (1.5 * IQR);
        record.averageScore = totalScore / scores.length;
        let differencesTotal = 0;
        scores.forEach(score => {
            differencesTotal += Math.abs(record.averageScore - (score.value / score.maxScore));
        });
        record.standardDev = differencesTotal / scores.length;
        records.push(record);

        records.forEach(record => {
            const {averageScore , standardDev} = record;
            for(course in record){
                if(course === "studentFullName" || course === "studentId" || course === "averageScore" || course === "standardDev")
                    continue;
                const score = record[course].value;
                const maxScore = record[course].maxScore;
                const normalizedScore = score / maxScore;

                if(normalizedScore > averageScore + (1.5 * standardDev))
                    record[course].scoreStatus = 1;
                else if(normalizedScore < averageScore - (1.5 * standardDev))
                    record[course].scoreStatus = 0;
                else if(record[course].critical)
                    record[course].scoreStatus = 2;
                else if(record[course].excellent)
                    record[course].scoreStatus = 3;
                else if(record[course].fail)
                    record[course].scoreStatus = 4;
                else
                    record[course].scoreStatus = undefined;
            }
        })
        
    });
    return {records , fields};
}

function calculateMedian(numArray){
    numArray = numArray.sort((a , b) => a-b);
    const midPoint = Math.floor(numArray.length / 2);
    const median = numArray.length % 2 === 1?
    numArray[midPoint] :
    (numArray[midPoint - 1] + numArray[midPoint + 1]) / 2;
    return median;
}

function calculateIQR(numArray) {
    numArray = numArray.sort((a , b) => a-b);
    let q1_pos = Math.floor(numArray.length / 4);
    let q3_pos = Math.ceil(numArray.length * (3 / 4));
    return {Q1:numArray[q1_pos] , Q3:numArray[q3_pos] , IQR:numArray[q3_pos] - numArray[q1_pos]};
}

function calculateFinalGrade(totalScore) {
    const grades = ['Fail' , 'Pass' , 'Average' , 'Good' , 'Very Good' , 'Excellent'];
    const gradesIndex = totalScore === 100 ? 5 : Math.floor(totalScore / 10) - 4;
    return grades[gradesIndex];
}

function calculateAverage(arr){
    let avg = 0;
    arr.forEach(e => avg += e)
    return avg / arr.length;
}
module.exports = router;
