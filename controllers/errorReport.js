const errorReport = (err)=>
{
    if(err.name === 'ValidationError')
    {
        let errors = {}
        const errorFields = Object.keys(err.errors)
        errorFields.forEach(errorField =>{errors[errorField] = err.errors[errorField].properties.message})
        return {statusCode: 400 , errors}
    }
    else if(new RegExp('No token provided').test(err) || new RegExp('Access token has expired').test(err))
    {
        console.log("[ERROR]:- Status Code " , 401 , err)
        return {statusCode: 401 , message:err}
    }
    else if(new RegExp('invalid signature').test(err))
    {
        console.log("[ERROR]:- Status Code " , 403 , err)
        return {statusCode: 403 , message:'Invalid Token'}
    }
    else
    {
        console.log("[ERROR]:- Status Code ", 500 , err)
        return {statusCode: 500 , errors:{ServerError:"Server was not able to respond to the request"}}
    }
}


module.exports = errorReport
