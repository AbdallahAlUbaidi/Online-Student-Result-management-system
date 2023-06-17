const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
let generateEmailErrorMessage = (props)=> "";

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required: [true,"Username field is required"],
        lowerCase:true,
        trim:true,
        minLength: [4 , "Username must be at least 8 characters long"],
        maxLength: [60 , "Username must be at most 60 characters long"],
        unique:true,
        validate:{
            validator:user=>{
                const pattern = /^([a-zA-z0-9\.\-\_]*)([a-zA-z0-9\.\-\_])$/gi
                return pattern.test(user)
            },
            message:props => `"${props.value}" is not a valid user name`
        }
    },
    emailAddress:{
        type:String,
        required:[true,"Email field is required"],
        lowerCase:true,
        trim:true,
        unique:true,
        maxLength:[254 , 'Email address can be a max of 254 characters'],
        minLength:[3 , 'Email address can be at least 3 characters'],
        validate:{
            validator:emailValidator(),
            message:emailInvalidMessage()
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
    roles:{
        type:[{
            type:String,
            enum:['student' , 'faculty' , 'branchHead' , "examCommittee" , "admin"]
        }],
        lowerCase:true,
        validate:{
            validator:rolesArray=>{
                return rolesArray.length > 0 && rolesArray.length < 3; 
            },
            message:"Please specify a valid role"
        }
        // required:[true,"Please specify your role"]
    },
    roleInformation:{
        type:mongoose.SchemaTypes.ObjectId,
    },
    profileImg:{
        type:String
    },
    createdAt:{
        type:Date,
        default: () => Date.now()
    }  
})


userSchema.virtual('unhashedPassoword')
.get(function(){
    return this._unhashedPassoword;
})
.set(function(value){
    this._unhashedPassoword = value;
})

userSchema.virtual('confirmPassword')
.get(function(){
    return this._confirmPassoword;
})
.set(function(value){
    this._confirmPassoword = value;
})

const hashPassword = async (password)=>
{
    if(password == null || password == undefined || password == '') 
    {
        return null
    }
    return await bcrypt.hash(password ,  13)
}

userSchema.statics.updateUser = async function(filter , updatedFields)
{
    const userInfo = await this.findOne(filter)
    for(const field in updatedFields)
        userInfo[field] = updatedFields[field]
    await this.validate(userInfo , Object.keys(updatedFields))
    return await this.updateOne(filter , updatedFields)
}

userSchema.statics.updatePassword = async function(filter , password , confirmPassword){
    const user = await this.findOne(filter);
    const hashedPassword = await hashPassword(password);
    user.unhashedPassoword = password;
    user.confirmPassword = confirmPassword
    user.password = hashedPassword;
    user.markModified('confirmPassword')
    await user.save({validateModifiedOnly: true})
}

userSchema.statics.createNewUser = async function(username , emailAddress , password , confirmPassword , role){
    const hashedPassword = await hashPassword(password)
    let roles = [];
    roles.push(role); 
    if(role !== 'faculty' && role !== "student")
        roles.push('faculty');
    const newUser = this({username , emailAddress , password:hashedPassword , roles})
    newUser.confirmPassword = confirmPassword
    newUser.unhashedPassoword = password
    await newUser.save()
    return newUser
}

userSchema.path('emailAddress').validate(async (email)=>
{
    return await mongoose.models.User.countDocuments({emailAddress:email}) == 0;
} , 'Email already exists')

userSchema.path('username').validate(async (username)=>
{
    return await mongoose.models.User.countDocuments({username}) == 0;
} , 'username already exists')
userSchema.pre('validate' , function(next){
    if(this.unhashedPassoword !== this.confirmPassword)
        this.invalidate('confirmPassword', 'Passwords do not match');
    next()
})

function emailValidator(){
    if(process.env.TEST_MODE){
        return (email)=>{
            const emailPattern1 = /^([\.\_A-Za-z0-9]+)@([\.A-Za-z]+)\.([a-zA-Z]{2,8})\s*$/g;
            const emailPattern2 = /^([\.\_A-Za-z0-9]+)@([\.A-Za-z]+)\.([a-zA-Z]{2,3})\.([a-zA-Z]{1,3})\s*$/g;
            return emailPattern1.test(email) || emailPattern2.test(email)
        }
    }else{
        return function(email){
            let pattern;
            let {roles} = this;
            if(roles.includes("student")){
                pattern = /ce\.[0-9]{2,4}\.[0-9]{2,4}@student\.uotechnology\.edu\.iq/gi;
            }else{
                pattern = /[0-9]{6,10}@uotechnology\.edu\.iq/gi;
            }
            const isValid = pattern.test(email);
            if(!isValid){
                if(roles.includes("student"))
                    generateEmailErrorMessage = (props) => `"${props.value}" is not a valid student email`;
                else if(roles.includes(""))
                    generateEmailErrorMessage = (props) => {
                        return `Cannot validate email without specifing role`;
                    }
                else
                    generateEmailErrorMessage = (props) => `"${props.value}" is not a valid faculty email`;
            }
            return isValid;
        }
    }
}

function emailInvalidMessage(){
    if(process.env.TEST_MODE){
        return props => `"${props.value}" is not a valid email address`;
    }else{
        return props => generateEmailErrorMessage(props);
    }
}

module.exports = mongoose.model('User' , userSchema) 