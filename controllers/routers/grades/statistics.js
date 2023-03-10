const express = require('express')
const router = express.Router();
const Grade = require('../../../models/Grade')
const Course = require('../../../models/Course')
const mongoose = require('mongoose')
const {errorReport} = require('../../errorReport');

router.get('/' , (req , res) => {
  res.render('courses/facultyPages/statisticsPage' , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0]});
})

//http://localhost/statistics/PHP-Lab/faculty
router.get('/:courseTitle/faculty', async (req, res) => {
    const { courseTitle } = req.params;
    const courseTitleFormatted = courseTitle.split('-').join(' ');
  
    const course = await Course.findOne({ courseTitle: courseTitleFormatted });
    const courseIdFromDB = course._id;
  
    const pipeline = [
      {
        $match: {
          course: mongoose.Types.ObjectId(courseIdFromDB),
          midTermScore:{$nin:[undefined , NaN , null]},
          evaluationScore:{$nin:[undefined , NaN , null]}
        },
      },
      {
        $addFields: {
          preFinalScore: {
            $cond: {
              if: { $eq: ["$midTermScore", "ABSENT"] },
              then: "$evaluationScore",
              else: { $sum: ["$evaluationScore", "$midTermScore"] },
            },
          },
          maxMidTermScore: {$cond:{
            if:{$eq:[course.courseType , 'theoretical']},
            then:20,
            else:30
          }},
          maxPreFinalScore: {$cond:{
            if:{$eq:[course.courseType , 'theoretical']},
            then:30,
            else:50
          }},
          midTermScoreFail:{$lt:['$midTermScore' , {$multiply:[0.5 , '$maxMidTermScore']}]},
          preFinalScoreFail:{$lt:['$preFinalScore' , {$multiply:[0.5 , '$maxPreFinalScore']}]},
          midTermScoreCriticalFail:{$lt:['$midTermScore' , {$multiply:[0.33 , '$maxMidTermScore']}]},
          preFinalScoreCriticalFail:{$lt:['$preFinalScore' , {$multiply:[0.33 , '$maxPreFinalScore']}]},

        },
      },
      {
        $group: {
          _id: "$course",
          midTermExamScoreMean: { $avg: "$midTermScore" },
          preFinalScoreMean: { $avg: "$preFinalScore" },
          midTermExamScoreStdDev: { $stdDevPop: "$midTermScore" },
          preFinalScoreStdDev: { $stdDevPop: "$preFinalScore" },
          // midExamAbsences: {
          //   $sum: {
          //     $cond:{ 
          //       if:{ $eq: ["$midExamScore", "ABSENT"] },
          //       then:1,
          //       else:0,
          //     }
          //   },
          // },
          midTermScores: { $push: "$midTermScore" },
          preFinalScores: { $push: "$preFinalScore" },
        },
      },
      {
        $project: {
          _id: 0,
          midTermExamScoreMean: 1,
          preFinalScoreMean: 1,
          midTermExamScoreStdDev: 1,
          preFinalScoreStdDev: 1,
          midExamAbsences: 1,
          midTermScores: 1,
          preFinalScores: 1,
        },
      },
    ];

    try {
      const result = await Grade.aggregate(pipeline);
      if(result.length === 0)
        res.status(200).json({message:"No valid grades was found"});
      else{
        const {midTermScores  , midTermExamScoreMean , midTermExamScoreStdDev , preFinalScoreMean , preFinalScoreStdDev , preFinalScores} = result[0];
        const midExamMaxScore = course.courseType === '' ? 20 : 30;
        const preFinalMaxScore = course.courseType === '' ? 30 : 50;
        let midPercentageOfAbsence = 0;
        for(scoreIndex in midTermScores){
          if(midTermScores[scoreIndex] === "ABSENT")
            midPercentageOfAbsence++;
        }

        midPercentageOfAbsence = (midPercentageOfAbsence / midTermScores.length) * 100;

        let midTermFailPercentage = [];
        let midTermCriticalFailPercentage = []; 
        let preFinalFailPercentage = []; 
        let preFinalCriticalFailPercentage = []; 
        
        midTermScores.forEach( score => {
          if(score < 0.5 * midExamMaxScore)
            midTermFailPercentage++;
          if(score < 0.33 * midExamMaxScore)
            midTermCriticalFailPercentage++;
        })
        midTermFailPercentage = (midTermFailPercentage / midTermScores.length) * 100;
        midTermCriticalFailPercentage = (midTermCriticalFailPercentage / midTermScores.length) * 100;
        preFinalScores.forEach( score => {
          if(score < 0.5 * preFinalMaxScore)
            preFinalFailPercentage++;
          if(score < 0.33 * preFinalMaxScore)
            preFinalCriticalFailPercentage++;
        })
        preFinalFailPercentage = (preFinalFailPercentage / preFinalScores.length) * 100;
        preFinalCriticalFailPercentage = (preFinalCriticalFailPercentage / preFinalScores.length) * 100;
        res.status(200).json({
          midTermScores , 
          midExamMaxScore , 
          midPercentageOfAbsence ,
          midTermFailPercentage ,
          midTermCriticalFailPercentage ,
          midTermExamScoreMean , 
          midTermExamScoreStdDev , 
          preFinalScores , 
          preFinalMaxScore , 
          preFinalFailPercentage ,
          preFinalCriticalFailPercentage ,
          preFinalScoreMean , 
          preFinalScoreStdDev
        });
    }
    } catch (err) {
      const { statusCode, message, errors } = errorReport(err);
      res.status(statusCode).json({ message, errors });
    }
  });
  
router.get(':courseTitle/branchHead' , (req , res) => {

})

router.get('/:courseTitle/examCommittee' , (req , res) => {

})

module.exports = router;