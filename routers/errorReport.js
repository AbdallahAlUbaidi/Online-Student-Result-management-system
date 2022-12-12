const errorReport = (err)=>
{
    if(err.name === 'ValidationError')
    {
        let errors = {}
        const errorFields = Object.keys(err.errors)
        errorFields.forEach(errorField =>{errors[errorField] = err.errors[errorField].properties.message})
        return {statusCode: 400 , errors}
    }
    else
    {
        console.log(err)
        return {statusCode: 500 , errors:{ServerError:"Server was not able to respond to the request"}}
    }
}


module.exports = errorReport