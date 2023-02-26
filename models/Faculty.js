const mongoose = require("mongoose")
const Course = require('./Course')
const facultySchema = mongoose.Schema(
    {
        userInfo:{
            type:mongoose.SchemaTypes.ObjectId,
            required:[true , "Could not find user's info"],
            ref:"User"
        },
        id_num:
        {
            //Must be Verifyed
            type:String,
            minLength:[1 , 'ID number must be at least one digit'],   
            maxLength:[10 , 'ID number must be at most 10 digits'],
            validate:{
                validator:number=>
                {
                    const pattern = /^([0-9]+)([0-9]+)$/gi
                    return pattern.test(number)
                },
                message:props => `"${props.value}" is not a valid id number number`
            },
            required:[true , 'You must specify your id number']
        },
        department:
        {
            type:String,
            lowercase:true,
                enum:[
                'computer engineering' , 'electrical engineering' , 'mechanical engineering' , 'elctromechanical engineering' , 'chemical engineering' , 'civil engineering',
                'production engineering and metallurgy' , 'material engineering' , 'architectural engineering' , 'laser and optoelectronics engineering' , 'comunication engineering',
                'petrolum technology engineering' , 'biomedical engineering' , 'applied sciences' , 'computer sciences' , 'english language center' , 'continous learning center', 
                'training and workshop center' , 'envoirmental research center' , 'information technology center' , 'nanotechnology and advanced materials research center' ,
                'energy and renewable energies research center'],
            required:[true , 'You must specify your department']
        },
        specialty:
        {
            type:String,
            lowercase:true,
            required:[true , 'You must specify your specialty'],
            minLength:3,
            maxLength:30
        },
        branch:{
            type:String,
            required:[true , 'You must specify your branch'],
            enum:['information engineering' , 'network engineering'],
            lowercase:true
        },
        courses:{
            type:[{type:mongoose.SchemaTypes.ObjectId ,  ref:'Course'}],
        }
    }
)

facultySchema.path('userInfo').validate(async (userId)=>
{
    return await mongoose.models['Faculty Member'].countDocuments({userInfo:userId}) == 0;
} , 'You have entered your Faculty information before')

facultySchema.path('id_num').validate(async (idNum)=>
{
    return await mongoose.models['Faculty Member'].countDocuments({id_num:idNum}) == 0;
} , 'The id number you have entered already exists')



module.exports = mongoose.model('Faculty Member' , facultySchema)