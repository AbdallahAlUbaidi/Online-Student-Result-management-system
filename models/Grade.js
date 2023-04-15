const mongoose = require('mongoose')
const Course = require('./Course')
const Student = require('./Student')
const Faculty = require('./Faculty')

const gradeSchema = mongoose.Schema({
    student:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Student',
        required:[true , "The graded student was not specified"]
    },
    course:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Course',
        required:[true , "The course was not specified"]
    },
    gradeStatus:{
        type:String,
        lowerCase:true,
        default:'notGraded',
        enum:['notGraded' , 'pendingApproval' , 'pendingFinalExam' , 'finalized' , 'published']

    },
    evaluationScore:{
        type:Number,
        set:v => parseFloat(v)? v : null,
        validate:{
            validator:value => value != null,
            message:"Evaluation score must be a number"
        },
        min:[0 , 'Evaluation score must be at least zero']
    },
    midTermScore:{
        type:mongoose.Schema.Types.Mixed,
        set:value=>{
            if(value === 'ABSENT')
                return value;
            return parseFloat(value)? parseFloat(value) : null;
        },
        validate:{
            validator:value => {
                if(value !== null)
                    return parseFloat(value) >= 0 || value === "ABSENT";
            },
            message: props => 'Mid term score must be at least zero'
        },
        toUpperCase:true
    },
    finalExamScore:{
        type:mongoose.Schema.Types.Mixed,
        set:value=>{
            if(value === 'ABSENT')
                return value;
            return parseFloat(value);
        },
        validate:{
            validator:value => typeof value === 'number' && (Boolean(value) && value !== 0) || (typeof value === 'string' && value.toUpperCase() === 'ABSENT'),
            message: props => `You have entered an invalid final exam score, Must be either a number or "ABSENT"`
        },
        validate:{
            validator:value => parseFloat(value) >= 0 && typeof value !== 'string',
            message: props => 'Final Exam score must be at least zero'
        },
        toUpperCase:true
    }

})

gradeSchema.virtual('preFinalScore')
.get(async function(){
    const grade = this;
    const course = await grade.populate('course');
    const maxScore = course.courseType === 'theoretical'? 30 : 50;
    let {evaluationScore , midTermScore} = grade;
    if(typeof midTermScore === 'string')
        midTermScore = 0;    
    const preFinalScore = evaluationScore + midTermScore;
    if(preFinalScore > maxScore)
        throw new mongoose.Error.ValidationError(`Pre final score must not be higher than ${maxScore}`)
    return preFinalScore;
});

gradeSchema.virtual('totalScore')
.get(async function(){
    const grade = this;
    let finalExamScore = grade.finalExamScore;
    const preFinalScore = await grade.preFinalScore;
    if(typeof finalExamScore === 'string')
        finalExamScore = 0;
    const totalScore = preFinalScore + finalExamScore;
    if(totalScore > 100 || totalScore < 0)
        throw new mongoose.Error.ValidationError(`Total score must not be higher than 100 or lower than 0`)
    return totalScore;
});

gradeSchema.virtual('finalGrade')
.get(function(){
    const grades = ['fail' , 'pass' , 'average' , 'good' , 'very good' , 'excellent'];
    const gradesIndex = this.totalScore === 100 ? 5 : Math.floor(this.totalScore / 10) - 4;
    return grades[gradesIndex];
    
})

gradeSchema.path('evaluationScore').validate({
    validator:async function(score , validatorObj){
    const courseId = this._conditions.course;
    const course = await mongoose.model('Course').findById(courseId);
    const maxScore = course.courseType === 'theoretical'? 10 : 20;
    validatorObj.message = `Evaluation score can't be higher than ${maxScore}`
    return score <= maxScore
    },
    propsParameter:true
});

gradeSchema.path('midTermScore').validate({
    validator: async function(score , validatorObj) {
        score = Number(score) ? Number(score)  : 0;
        const courseId = this._conditions.course;
        const course = await mongoose.model('Course').findById(courseId);
        const maxScore = course.courseType === 'theoretical' ? 20 : 30;
        validatorObj.message = `Mid term Score can't be higher than ${maxScore}`;
        return score <= maxScore;
    },
    propsParameter:true
  });

  gradeSchema.path("midTermScore").validate({
    validator:function(score){
        return score != null;
    },
    message:'You have entered an invalid mid term score, Must be either a number or "ABSENT"'
  });

gradeSchema.path('finalExamScore').validate({
    validator:async function(score , validatorObj){
        const courseId = this._conditions.course;
        const course = await mongoose.model('Course').findById(courseId);
        const maxScore = course.courseType === 'theoretical'? 70 : 50;
        validatorObj.message = `Final exam score can't be higher than ${maxScore}`;
        return score <= maxScore;
    }, 
    propsParameter:true
});


module.exports = mongoose.model('Grade' , gradeSchema)