const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
    username:{
        type:String,
        required: [true,"Username field is required"],
        lowerCase:true,
        minLength: [8 , "Username must be at least 8 characters long"],
        maxLength: [60 , "Username must be at most 60 characters long"],
        validate:{
            validator:user=>{
                const pattern = /^([a-zA-z0-9\.\-\_]*)([a-zA-z0-9\.\-\_])$/gi
                return pattern.test(user)
            }
        }
    },
    emaillAddress:{
        type:String,
        required:[true,"Email field is required"],
        lowerCase:true,
        maxLength:254,
        munLength:3,
        validate:{
            validator:email=>{
                const emailPattern1 = /^([\.\_A-Za-z0-9]+)@([\.A-Za-z]+)\.([a-zA-Z]{2,8})\s*$/g;
                const emailPattern2 = /^([\.\_A-Za-z0-9]+)@([\.A-Za-z]+)\.([a-zA-Z]{2,3})\.([a-zA-Z]{1,3})\s*$/g;
                return emailPattern1.test(email) || emailPattern2.test(email)
            }
        }
    },
    password:{
        type:String,
        required:[true,"Password field is required"],
        maxLength:255,
        minLength:56,
        validate:{
            validator:hashedPassword =>
            {
                const pattern = /^\$2[ayb]\$.{56}$/gmi
                return pattern.test(hashedPassword)
            }
        }

    },
    role:{
        type:String,
        enum:['admin','student' , 'faculty' , 'exam_committee' , 'branch_head'],
        lowerCase:true,
        required:[true,"Please specify your role"]
    },
    createdAt:{
        type:Date,
        default: () => Date.now()
    }  
})




module.exports = mongoose.model('User' , userSchema) 