const mongoose = require('mongoose')
const Course = require('./Course')
const studentSchema = mongoose.Schema(
    {
        userInfo:{
            type:mongoose.SchemaTypes.ObjectId,
            required:[true , 'Please enter your credentials'],
            ref:"User"
        },
        student_id:{
            type:String,
            required:[true , 'You must enter your ID number'],
            minLength:[1 , 'ID number must be at least one digit'],
            maxLength:[10 , 'ID number must be at most 10 digits'],
            validate:{
                validator:number=>
                {
                    const pattern = /^([0-9]+)([0-9]+)$/gi
                    return pattern.test(number)
                },
                message:props => `"${props.value}" is not a valid student id number`
            }
        },
        stage:{
            type:String,
            enum:['1st' , '2nd' , '3rd' , '4th' , 'Graduate'],
            required:[true , 'You must specify your stage'],
            lowercase:true
        },
        branch:{
            type:String,
            required:[true , 'You must specify your branch'],
            enum:['information engineering' , 'network engineering'],
            lowercase:true
        },
        study:{
            type:String,
            required:[true , 'You must specify your study'],
            enum:['morning' , 'evening'],
            lowercase:true
        },
        courses:{
            type:[{type:mongoose.SchemaTypes.ObjectId ,  ref:'Course'}]
        }

    }
)

studentSchema.pre('save' , async function(next){
    try{
        if(!this.courses)
            this.courses = []
        const coursesArray = await Course.find({stage:this.stage, $or:[{branch:this.branch} , {branch:'both branches'}]} , {_id:1})
        const updatedCourses = this.courses.concat(coursesArray)
        this.set('courses' , updatedCourses)
        next()
    }catch(err){
        console.log(err)
    }
})

studentSchema.path('userInfo').validate(async (userId)=>
{
    return await mongoose.models.Student.countDocuments({userInfo:userId}) == 0;
} , 'You have entered your student information before')

studentSchema.path('student_id').validate(async (studentId)=>
{
    return await mongoose.models.Student.countDocuments({student_id:studentId}) == 0;
} , 'The student id you have entered already exists')


module.exports = mongoose.model('Student' , studentSchema)
