import mongoose from "mongoose";
const gradeSchema = mongoose.Schema({
    student:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Student',
        required:[true , "The graded student was not specified"]
    },
    course:{
        type:mongoose.SchemaType.ObjectId,
        ref:'Course',
        required:[true , "The course was not specified"]
    },
    preFinalScore:{
        type:Number,
        minValue:0
    },
    finalExamScore:{
        type:Number,
        minValue:0
    },
    finalGrade:{
        type:String,
        enum:['fail' , 'pass' , 'average' , 'good' , 'very good' , 'excellent'],
        lowerCase:true
    }

})

gradeSchema.path('preFinalScore').validate(async score =>{
    const course = await mongoose.model('Course').findById(this.course)
    
})


module.exports = mongoose.model('Grade' , gradeSchema)