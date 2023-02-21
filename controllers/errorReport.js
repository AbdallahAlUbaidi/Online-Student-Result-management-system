const errorReport = err=>
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

const errorObjects = {
    500:{errorName:"Internal Server Error" , errorMsg:'The server encountered an error' , errorDescription:'The Server encountered an error while processing your request'},
    404:{errorName:'Not Found', errorMsg: 'The requested page can\'t be found' , statusCode:404 , errorDescription:'We could not find what you are looking for, it might have been deleted or modifyed'},
    401:{errorName:'UnAutherized' , errorMsg: 'Access to this page was restricted' ,  errorDescription:'Sorry, you are not autherized to view this page'}
}

const renderErrorPage = (res , statusCode)=>{
    console.log(statusCode)
    const {errorName , errorMsg , errorDescription} = errorObjects[statusCode]
    res.render('errorPage' , {errorName, statusCode , errorMsg , errorDescription})
}


module.exports = {errorReport , renderErrorPage} 
