const mongoose = require('mongoose')
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
                }
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
        }

    }
)

studentSchema.statics.createStudent = async function(userInfo ,student_id , stage , branch , study)
{
    const newStudnet = this.create({
        userInfo ,student_id , stage , branch , study
    })
    return newStudnet
}

module.exports = mongoose.model('Student' , studentSchema)
