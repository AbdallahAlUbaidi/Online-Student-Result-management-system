const {errorReport, renderErrorPage} = require('./errorReport')


const Grade = require('../models/Grade')
const Course = require('../models/Course')


const gradeWritableField = {
    faculty:(gradeStatus , field) =>{
        const writableFields = ['evaluationScore' , 'midTermScore']
        if(gradeStatus === 'notGraded' && writableFields.includes(field))
            return true;
        return false;
    },
    branchHead:(gradeStatus , field) =>{
        return false;
    },
    examCommittee:(gradeStatus , field) =>{
        if(gradeStatus === 'pendingFinalExam' && field === 'finalExamScore' )
            return true;
        return false;
    },
    student:(gradeStatus , field) =>{
        return false;
    }


}

const displayNameMap = {
    studentFullName:'Student Full Name',
    evaluationScore:'Evaluation Score',
    midTermScore:'Mid Term Score',
    finalExamScore:'Final Exam Score',
    preFinalScore:'Pre Final Score',
    finalGrade:'Final Grade',
    gradeStatus:'Grade Status',
    totalScore:'Total Score'
}


function getGradesRecords(grades , fields){
    let records = [];
    grades.forEach(async function(grade){

        let newRecord = {};
        newRecord.studentFullName = {};
        newRecord.studentFullName.value = grade.student.studentFullName;
        newRecord.studentFullName.isWritable = false;
        fields.forEach(field =>{
            newRecord[field] = {};
            newRecord[field].value =  grade[field];
            newRecord[field].isWritable = gradeWritableField.faculty(grade.gradeStatus , field);
        })
        records.push(newRecord);
    })
    return records;
}

function getGradesFileds(fieldNames){
    let fields = [];
    let studentNameField = {};
    studentNameField.name = 'studentFullName';
    studentNameField.displayName = displayNameMap.studentFullName;
    fields.push(studentNameField);
    fieldNames.forEach(field =>{
        let newField = {};
        newField.name = field;
        newField.displayName = displayNameMap[field];
        fields.push(newField)
    })
    return fields;
}

async function parseGrades(fieldsNames , courseTitle , res){
    try{
        courseTitle = courseTitle.split('-').join(' ');
        const course = await Course.findOne({courseTitle}) //Temprary way to get course
        courseId = course._id
       
        const grades = await Grade.find({course:courseId})
        .select(fieldsNames
        .concat(['student'])
        .join(' '))
        .populate({
            path:'student',
            select:'studentFullName'
        })
        const records = getGradesRecords(grades , fieldsNames);
        const fields = getGradesFileds(fieldsNames)
        return {fields , records};
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
}


module.exports = {parseGrades , getGradesRecords , getGradesFileds , displayNameMap  , gradeWritableField}