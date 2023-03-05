const express = require('express')
const router = express.Router();
const Grade = require('../../../models/Grade')
const Course = require('../../../models/Course')
const mongoose = require('mongoose')
const {errorReport} = require('../../errorReport');

router.get('/' , (req , res) => {

})

router.get('/:courseTitle/faculty', async (req, res) => {
    const { courseTitle } = req.params;
    const courseTitleFormatted = courseTitle.split('-').join(' ');
  
    const course = await Course.findOne({ courseTitle: courseTitleFormatted });
    const courseIdFromDB = course._id;
  
    const pipeline = [
      {
        $match: {
          course: mongoose.Types.ObjectId(courseIdFromDB),
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
        },
      },
      {
        $group: {
          _id: "$course",
          midTermExamScoreMean: { $avg: "$midTermScore" },
          preFinalScoreMean: { $avg: "$preFinalScore" },
          midTermExamScoreStdDev: { $stdDevPop: "$midTermScore" },
          preFinalScoreStdDev: { $stdDevPop: "$preFinalScore" },
          midExamScore_absent: {
            $sum: {
              $cond: [
                { $eq: ["$midExamScore", "ABSENT"] },
                1,
                0,
              ],
            },
          },
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
          midExamScore_absent: 1,
          midTermScores: 1,
          preFinalScores: 1,
        },
      },
    ];
  
    try {
      const result = await Grade.aggregate(pipeline);
      res.status(200).json(result);
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