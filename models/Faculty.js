const mongoose = require("mongoose")
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
                }
            },
            required:true
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
            required:true
        },
        specialty:
        {
            type:String,
            lowercase:true,
            required:true,
            minLength:3,
            maxLength:30
        }

    }
)


module.exports = mongoose.model('Faculty Member' , facultySchema)