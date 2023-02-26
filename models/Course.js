const mongoose = require("mongoose")
const Faculty = require('./Faculty')
const Grade = require('./Grade')

const courseSchema =  mongoose.Schema({
    courseTitle:{
        type:String,
        required:[true , 'Course title is required'],
        minLength:[4 , 'Course title must be at least four characters'],   
        maxLength:[30 , 'Course title cannot be longer than 30 characters']
    },
    lecturers:{
        type:[{type:mongoose.SchemaTypes.ObjectId ,  ref:'Faculty Member'}],
        required:[true , 'You must specify the course lecturers'],
        maxLength:[4 , 'There can be at most four lecturers per course'],
        minLength:[1, 'There can be at least one lecturer per course']
    },
    stage:{
        type:String,
        enum:['1st' , '2nd' , '3rd' , '4th'],
        required:[true , 'You must specify which stage this course is for'],
        lowercase:true
    },
    branch:{
        type:String,
        required:[true , 'You must specify which branch this course is for'],
        enum:['information engineering' , 'network engineering' , 'both branches'],
        lowercase:true
    },
    courseType:{
        type:String,
        enum:['practical' , 'theoretical'],
        required:[true , 'You must specify this course\'s type']
    }
})


courseSchema.statics.createCourse = async function(courseTitle , stage , branch , courseType , courseCreator){
    const newCourse = this({courseTitle , stage , branch , courseType})
    newCourse.lecturers.push(courseCreator._id)
    newCourse.save()
    await Faculty.updateOne({_id:courseCreator._id} , {$push:{courses:newCourse._id}} , {runValidators:true})
}

courseSchema.pre('save' , async function(next){
    const filter = this.branch !== 'both branches' ? {"stage": this.stage, "branch": this.branch} : {"stage": this.stage}
    const students = await mongoose.model('Student').find(filter)
    students.forEach(student =>{
        Grade.create({student , course:this})
    })
    await mongoose.model('Student').updateMany(filter , {$push:{courses:this._id}} , { runValidators: true })

    next()
})

courseSchema.path('courseTitle').validate(async courseTitle =>{
    return await mongoose.models.Course.countDocuments({courseTitle}) == 0;
} , 'The specified course already exists')



module.exports = mongoose.model('Course' , courseSchema)