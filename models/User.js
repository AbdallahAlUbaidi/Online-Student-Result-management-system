const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const userSchema = mongoose.Schema({
    username:{
        type:String,
        required: [true,"Username field is required"],
        lowerCase:true,
        trim:true,
        minLength: [4 , "Username must be at least 8 characters long"],
        maxLength: [60 , "Username must be at most 60 characters long"],
        unique:[true,'Username already exists'],
        validate:{
            validator:user=>{
                const pattern = /^([a-zA-z0-9\.\-\_]*)([a-zA-z0-9\.\-\_])$/gi
                return pattern.test(user)
            },
            message:props => `"${props.value}" is not a valid user name\nUsername must only contain:\n-lower case and uppercase letters\n-digits from 0 - 9 \n-special characters (. , - , _ )\n-it must not have spaces`
        }
    },
    emailAddress:{
        type:String,
        required:[true,"Email field is required"],
        lowerCase:true,
        trim:true,
        unique:[true,'Email already exists'],
        maxLength:[254 , 'Email address can be a max of 254 characters'],
        munLength:[3 , 'Email address can be at least 3 characters'],
        validate:{
            validator:email=>{
                const emailPattern1 = /^([\.\_A-Za-z0-9]+)@([\.A-Za-z]+)\.([a-zA-Z]{2,8})\s*$/g;
                const emailPattern2 = /^([\.\_A-Za-z0-9]+)@([\.A-Za-z]+)\.([a-zA-Z]{2,3})\.([a-zA-Z]{1,3})\s*$/g;
                return emailPattern1.test(email) || emailPattern2.test(email)
            },
            message:props => `"${props.value}" is not a valid email address`
        }
    },
    conformed:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:[true,"Password field is required"],
        maxLength:255,
        minLength:56,
        trim:true,
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
    roleInformation:{
        type:mongoose.SchemaTypes.ObjectId,
    },
    createdAt:{
        type:Date,
        default: () => Date.now()
    }  
})


const hashPassword = async (password)=>
{
    if(password == false) return null
    return await bcrypt.hash(password ,  13)
}
userSchema.statics.createNewUser = async function(username , emailAddress , password , role){
    password = await hashPassword(password)
    const newUser = await this.create({username , emailAddress , password , role}) 
    return newUser
}



module.exports = mongoose.model('User' , userSchema) 