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
        enum:['notGraded' , 'pending' , 'approvedPending' , 'finalized' , 'published']

    },
    evaluationScore:{
        type:Number,
        min:[0 , 'Must be at least zero'] 
    },
    midTermScore:{
        type:mongoose.Schema.Types.Mixed,
        validate:{
            validator:value => typeof value === 'number' || (typeof value === 'string' && value.toUpperCase() === 'ABSENT'),
            message: props => `${props.value} is an invalid Score Must be a number or "ABSENT"`
        },
        toUpperCase:true,
        min:[0 , 'Must be at least zero']
    },
    finalExamScore:{
        type:mongoose.Schema.Types.Mixed,
        validate:{
            validator:value => typeof value === 'number' || (typeof value === 'string' && value.toUpperCase() === 'ABSENT'),
            message: props => `${props.value} is an invalid Score Must be a number or "ABSENT"`
        },
        toUpperCase:true,
        min:[0 , 'Must be at least zero']
    }

})



gradeSchema.virtual('preFinalScore')
.get(async function(){
    const course = await Course.findById(this.course)
    const maxScore = course.courseType === 'theoretical'? 30 : 50;
    const midTermScore = this.midTermScore;
    if(typeof midTermScore === 'String');
        midTermScore = 0;
    const preFinalScore = this.evaluationScore + midTermScore;
    if(preFinalScore > maxScore)
        throw new mongoose.Error.ValidationError(`Pre final score must not be higher than ${maxScore}`)
    return preFinalScore;
});

gradeSchema.virtual('totalScore')
.get(function(){
    const finalExamScore = this.finalExamScore;
    if(typeof finalExamScore === 'String')
        finalExamScore = 0;
    const totalScore = this.preFinalScore + finalExamScore;
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

gradeSchema.path('evaluationScore').validate(async function(score){
    const course = await Course.findById(this.course)
    const maxScore = course.courseType === 'theoretical'? 10 : 20;
    return score <= maxScore
} , async function(err){
    const course = await Course.findById(this.course);
    const maxScore = course.courseType === 'theoretical'? 10 : 20;
    return `Evaluation score can't be higher than ${maxScore}`
})

gradeSchema.path('midTermScore').validate(async function(score){
    const course = await Course.findById(this.course)
    const maxScore = course.courseType === 'theoretical'? 20 : 30;
    return score <= maxScore
} , async function(err){
    const course = await Course.findById(this.course)
    const maxScore = course.courseType === 'theoretical'? 20 : 30;
    return `Mid term Score can't be higher than ${maxScore}`
})

gradeSchema.path('finalExamScore').validate(async function(score){
    const course = await Course.findById(this.course)
    const maxScore = course.courseType === 'theoretical'? 70 : 50;
    return score <= maxScore
} , async function(err){
    const course = await Course.findById(this.course)
    const maxScore = course.courseType === 'theoretical'? 70 : 50;
    return `Final exam score can't be higher than ${maxScore}`
})


module.exports = mongoose.model('Grade' , gradeSchema)