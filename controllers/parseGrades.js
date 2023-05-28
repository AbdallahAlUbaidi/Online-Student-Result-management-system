const {errorReport, renderErrorPage} = require('./errorReport')


const Grade = require('../models/Grade')
const Course = require('../models/Course')
const e = require('connect-flash')


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
    },
    scorebook:(gradeStatus , field) => {
      return false;
    }


}

const displayedRecordsBasedOnStatus = {
  faculty:gradeStatus => true,
  branchHead:gradeStatus => gradeStatus != "notGraded",
  examCommittee:gradeStatus => !(gradeStatus in ['notGraded' , "pendingApproval"]),
  student:gradeStatus => false
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
    for(j in grades){
        let grade = grades[j];
        let newRecord = {};
        newRecord.studentId = grade.student._id; //Tempary will be hashed and mapped into a cash
        for(i in fields){
            let field = fields[i]
            newRecord[field] = {};
            if(field === 'studentFullName')
                newRecord[field].value =  grade.student[field];
            else
                newRecord[field].value =  await grade[field];
            newRecord[field].isWritable = gradeWritableField[role](grade.gradeStatus , field);
        }
        if(displayedRecordsBasedOnStatus[role](grade.gradeStatus))
          records.push(newRecord);

    }
    return records;
}

function getGradesFields(fieldNames){
    let fields = [];
    fieldNames.forEach(field =>{
        let newField = {};
        newField.name = field;
        newField.displayName = displayNameMap[field] || field;
        fields.push(newField)
    })
    return fields;
}

async function parseGrades(fieldsNames , courseTitle , res , req , role , page , filter){
    try{
        const gradesPerPage = 5;
        courseTitle = courseTitle.split('-').join(' ');
        const course = req.course;
        const courseId = course._id;
        let totalPages;
        let grades;
        let studentsFilter = Object.fromEntries(Object.entries(filter.student).filter(([_ , v]) => v).map(([k , v]) => [`student.${k}` , new RegExp(v , "ui")]));
        delete filter.student;
        filter = Object.fromEntries(Object.entries(filter).filter(([_ , v]) => v ));
        filter.course = courseId;
        const pipeline = [
          {
            $match: filter
          },
          {
            $addFields: {
              preFinalScore: { $add: ["$evaluationScore", "$midTermScore"] },
              totalScore: { $add: ["$evaluationScore", "$midTermScore", "$finalExamScore"] }
            }
          },
          {
            $lookup: {
              from: 'students',
              localField: 'student',
              foreignField: '_id',
              as: 'student'
            }
          },
          {
            $unwind: '$student'
          },
          {
            $match: studentsFilter
          },
          {
            $project: {
              _id: 1,
              course:1,
              student: {
                _id:1,
                studentFullName: 1,
                branch: 1
              },
              gradeStatus: 1,
              evaluationScore: 1,
              midTermScore: 1,
              finalExamScore: 1,
              preFinalScore: 1,
              totalScore: 1
            }
          },
          {
            $facet: {
              grades: [],
              count: [
                { $count: "total" }
              ]
            }
          }
        ];
        if(page > 0){
          pipeline[pipeline.length - 1].$facet.grades = [
            { $skip: gradesPerPage * (page - 1) },
            { $limit: gradesPerPage }
          ];
        }
        const result = await Grade.aggregate(pipeline).exec();
        grades = result[0].grades;
        const totalGrades = result[0].count[0];
        totalPages = Math.ceil((totalGrades? totalGrades.total : 0) / gradesPerPage);

        if(grades.length === 0){
            return {message:"No valid grades was found"};
        }
        const records = await getGradesRecords(grades , fieldsNames , role);
        const fields = getGradesFields(fieldsNames)
        return {fields , records , totalPages , currentPage:page};
    }catch(err){
        const {errors , statusCode , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , 500);
    }
}


module.exports = {parseGrades , getGradesRecords , getGradesFields , displayNameMap  , gradeWritableField}