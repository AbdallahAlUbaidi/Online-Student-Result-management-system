const mongoose = require("mongoose")
const facultySchema = mongoose.Schema(
    {
        Credentials:{
            type:mongoose.SchemaTypes.ObjectId,
            required:[true , 'Please enter your credentials'],
            ref:"User"
        }
    }
)


module.exports = mongoose.model('Faculty' , facultySchema)