const express = require('express')
const router = express.Router();
const Grade = require('../../../models/Grade')
const Course = require('../../../models/Course')
const mongoose = require('mongoose')
const {errorReport} = require('../../errorReport');
const {validateAccess} = require("../../accessControl");
const statisticsPage = {
  faculty:"courses/facultyPages/statisticsPage",
  branchHead:"courses/branchHeadPages/statisticsPage",
  examCommittee:"courses/examCommitteePages/statisticsPage" //Temp
}

router.get('/:courseTitle' , (req , res) => {
  const {courseTitle} = req.params;
  const role = req.query.role;
  const mainRole = req.info.roles[0];
  const {username , profileImg} = req.info.userInfo;
  res.render(statisticsPage[mainRole] , {message:req.flash('message')[0] , messageType:req.flash('messageType')[0] , courseTitle , role , username , profileImg});
})

router.get('/:courseTitle/faculty', validateAccess(["faculty"] , true , "json") ,async (req, res) => {
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
          }
        },
      },
      {
        $group: {
          _id: "$course",
          midTermExamScoreMean: { $avg: "$midTermScore" },
          preFinalScoreMean: { $avg: "$preFinalScore" },
          midTermExamScoreStdDev: { $stdDevPop: "$midTermScore" },
          preFinalScoreStdDev: { $stdDevPop: "$preFinalScore" },
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
        const midExamMaxScore = course.courseType === 'theoretical' ? 20 : 30;
        const preFinalMaxScore = course.courseType === 'theoretical' ? 30 : 50;
        let midPercentageOfAbsence = 0;
        for(scoreIndex in midTermScores){
          if(midTermScores[scoreIndex] === "ABSENT")
            midPercentageOfAbsence++;
        }

        midPercentageOfAbsence = (midPercentageOfAbsence / midTermScores.length) * 100;

        let midTermFailPercentage = 0;
        let midTermCriticalFailPercentage = 0; 
        let preFinalFailPercentage = 0; 
        let preFinalCriticalFailPercentage = 0; 
        
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
          midTerm:{
            scores:midTermScores , 
            maxScore:midExamMaxScore , 
            percentageOfAbsence:midPercentageOfAbsence ,
            failPercentage:midTermFailPercentage ,
            criticalFailPercentage:midTermCriticalFailPercentage ,
            meanValue:midTermExamScoreMean , 
            standardDeviation:midTermExamScoreStdDev , 
          },
          preFinal:{
            scores:preFinalScores , 
            maxScore:preFinalMaxScore , 
            failPercentage:preFinalFailPercentage ,
            criticalFailPercentage:preFinalCriticalFailPercentage ,
            meanValue:preFinalScoreMean , 
            standardDeviation:preFinalScoreStdDev
          }
        });
    }
    } catch (err) {
      const { statusCode, message, errors } = errorReport(err);
      res.status(statusCode).json({ message, errors });
    }
  });
  
router.get('/:courseTitle/branchHead' , validateAccess(["branchHead"] , false , "json") , async (req , res) => {
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
        }
      },
    },
    {
      $group: {
        _id: "$course",
        preFinalScoreMean: { $avg: "$preFinalScore" },
        preFinalScoreStdDev: { $stdDevPop: "$preFinalScore" },
        preFinalScores: { $push: "$preFinalScore" },
      },
    },
    {
      $project: {
        _id: 0,
        preFinalScoreMean: 1,
        preFinalScoreStdDev: 1,
        preFinalScores: 1,
      },
    },
  ];

  try {
    const result = await Grade.aggregate(pipeline);
    if(result.length === 0)
      res.status(200).json({message:"No valid grades was found"});
    else{
      const { preFinalScoreMean , preFinalScoreStdDev , preFinalScores} = result[0];
      const preFinalMaxScore = course.courseType === 'theoretical' ? 30 : 50;

      let preFinalFailPercentage = 0; 
      let preFinalCriticalFailPercentage = 0; 
      
      preFinalScores.forEach( score => {
        if(score < 0.5 * preFinalMaxScore)
          preFinalFailPercentage++;
        if(score < 0.33 * preFinalMaxScore)
          preFinalCriticalFailPercentage++;
      })
      preFinalFailPercentage = (preFinalFailPercentage / preFinalScores.length) * 100;
      preFinalCriticalFailPercentage = (preFinalCriticalFailPercentage / preFinalScores.length) * 100;
      res.status(200).json({
        preFinal:{
          scores:preFinalScores , 
          maxScore:preFinalMaxScore , 
          failPercentage:preFinalFailPercentage ,
          criticalFailPercentage:preFinalCriticalFailPercentage ,
          meanValue:preFinalScoreMean , 
          standardDeviation:preFinalScoreStdDev
        }
      });
  }
  } catch (err) {
    const { statusCode, message, errors } = errorReport(err);
    res.status(statusCode).json({ message, errors });
  }
})

router.get('/:courseTitle/examCommittee' , validateAccess(["examCommittee"] , false , "json") , async (req , res) => {
  const { courseTitle } = req.params;
  const courseTitleFormatted = courseTitle.split('-').join(' ');

  const course = await Course.findOne({ courseTitle: courseTitleFormatted });

  const courseIdFromDB = course._id;

  const pipeline = [
    {
      $match: {
        course: mongoose.Types.ObjectId(courseIdFromDB),
        midTermScore:{$nin:[undefined , NaN , null]},
        evaluationScore:{$nin:[undefined , NaN , null]},
        finalExamScore:{$nin:[undefined , NaN , null]}
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
        }
      },
    },
    {
      $addFields: {
        totalScore: {
          $cond: {
            if: { $eq: ["$finalExamScore", "ABSENT"] },
            then: "$preFinalScore",
            else: { $sum: ["$preFinalScore", "$finalExamScore"] },
          },
        },
      }
    },
    {
      $group: {
        _id: "$course",
        finalExamScoreMean: { $avg: "$finalExamScore" },
        totalScoreMean: { $avg: "$totalScore" },
        finalExamScoreStdDev: { $stdDevPop: "$finalExamScore" },
        totalScoreStdDev: { $stdDevPop: "$preFinalScore" },
        finalExamScores: { $push: "$finalExamScore" },
        totalScores: { $push: "$totalScore" },
      },
    },
    {
      $project: {
        _id: 0,
        finalExamScoreMean: 1,
        totalScoreMean: 1,
        finalExamScoreStdDev: 1,
        totalScoreStdDev: 1,
        finalExamScores: 1,
        totalScores: 1,
      },
    },
  ];

  try {
    const result = await Grade.aggregate(pipeline);
    if(result.length === 0)
      res.status(200).json({message:"No valid grades was found"});
    else{
      const {finalExamScores  , finalExamScoreMean , finalExamScoreStdDev , totalScoreMean , totalScoreStdDev , totalScores} = result[0];
      const finalExamMaxScore = course.courseType === 'theoretical' ? 70 : 50;
      const totalMaxScore = 100;
      let finalPercentageOfAbsence = 0;
      for(scoreIndex in finalExamScores){
        if(finalExamScores[scoreIndex] === "ABSENT")
          finalPercentageOfAbsence++;
      }
      finalPercentageOfAbsence = (finalPercentageOfAbsence / finalExamScores.length) * 100;

      let finalFailPercentage = 0;
      let finalCriticalFailPercentage = 0; 
      let totalFailPercentage = 0; 
      let totalCriticalFailPercentage = 0; 
      
      finalExamScores.forEach( score => {
        if(score < 0.5 * finalExamMaxScore)
          finalFailPercentage++;
        if(score < 0.33 * finalExamMaxScore)
          finalCriticalFailPercentage++;
      })
      finalFailPercentage = (finalFailPercentage / finalExamScores.length) * 100;
      finalCriticalFailPercentage = (finalCriticalFailPercentage / finalExamScores.length) * 100;
      totalScores.forEach( score => {
        if(score < 0.5 * totalMaxScore)
          totalFailPercentage++;
        if(score < 0.33 * totalMaxScore)
          totalCriticalFailPercentage++;
      })
      totalFailPercentage = (totalFailPercentage / totalScores.length) * 100;
      totalCriticalFailPercentage = (totalCriticalFailPercentage / totalScores.length) * 100;
      res.status(200).json({
        finalExam:{
          scores:finalExamScores , 
          maxScore:finalExamMaxScore , 
          percentageOfAbsence:finalPercentageOfAbsence ,
          failPercentage:finalFailPercentage ,
          criticalFailPercentage:finalCriticalFailPercentage ,
          meanValue:finalExamScoreMean , 
          standardDeviation:finalExamScoreStdDev , 
        },
        totalScore:{
          scores:totalScores , 
          maxScore:totalMaxScore , 
          failPercentage:totalFailPercentage ,
          criticalFailPercentage:totalCriticalFailPercentage ,
          meanValue:totalScoreMean , 
          standardDeviation:totalScoreStdDev
        }
      });
    }
    } catch (err) {
      const { statusCode, message, errors } = errorReport(err);
      res.status(statusCode).json({ message, errors });
    }
  });


    

module.exports = router;