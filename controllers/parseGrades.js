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


async function getGradesRecords(grades , fields , role){
    let records = [];
    grades.forEach(async function(grade){
        let newRecord = {};
        newRecord.studentId = grade.student._id; //Tempary will be hashed and mapped into a cash
        fields.forEach(async field =>{
            newRecord[field] = {};
            if(field === 'studentFullName')
                newRecord[field].value =  grade.student[field];
            else
                newRecord[field].value =  await grade[field];
            newRecord[field].isWritable = gradeWritableField[role](grade.gradeStatus , field);
        })
        records.push(newRecord);
    })
    return records;
}

function getGradesFields(fieldNames){
    let fields = [];
    fieldNames.forEach(field =>{
        let newField = {};
        newField.name = field;
        newField.displayName = displayNameMap[field];
        fields.push(newField)
    })
    return fields;
}

async function parseGrades(fieldsNames , courseTitle , res , role){
    try{
        courseTitle = courseTitle.split('-').join(' ');
        const course = await Course.findOne({courseTitle}) //Temprary way to get course
        courseId = course._id
        const grades = await Grade.find({course:courseId})
        .select(fieldsNames.slice(1)
        .concat(['student'])
        .join(' '))
        .populate({
            path:'student',
            select:'studentFullName'
        })
        const x = await Grade.find({course:courseId}).select('totalScore')
        console.log(x)
        const records = await getGradesRecords(grades , fieldsNames , role);
        const fields = getGradesFields(fieldsNames)
        return {fields , records};
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
}


module.exports = {parseGrades , getGradesRecords , getGradesFileds: getGradesFields , displayNameMap  , gradeWritableField}