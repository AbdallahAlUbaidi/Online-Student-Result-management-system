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
    404:{errorName:'Not Found', errorMsg: 'The requested page can\'t be found' , statusCode:404 , errorDescription:'We could not find what you are looking for, it might have been deleted or modified'},
    401:{errorName:'UnAutherized' , errorMsg: 'Authentication Required. Please log in to access this page' ,  errorDescription:' You must be logged in to view this page. Please sign in with valid credentials'},
    403:{errorName:"Forbidden" , errorMsg:"You don't have permission to access this page" , errorDescription:"This page is restricted and cannot be accessed. You may not have the necessary permissions to view this content."}
}

const renderErrorPage = (res , statusCode)=>{
    const {errorName , errorMsg , errorDescription} = errorObjects[statusCode]
    res.render('errorPage' , {errorName, statusCode , errorMsg , errorDescription})
}


module.exports = {errorReport , renderErrorPage} 
