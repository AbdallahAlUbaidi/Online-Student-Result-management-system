//A Route used to test some functinality will be replaced with solid test in the future
const express = require('express')
const user = require('../../models/User')
const roleInfoModule = require('../roleInfo')
const router = express.Router()
const {renderErrorPage} = require('../errorReport')

router.get('/'  ,  async (req , res)=>
{
    
    const userId = req.auth.userId
    const userInfo = await user.findById(userId)
    const roleInfo = (await roleInfoModule.getRoleInfo(userId , userInfo)).roleInfo
    
    res.render('testPage' , {userInfo , roleInfo})
})

router.get('/500' , (req , res)=>{
    //res.render('errorPage' , {errorName:"Internal Server Error" , error:'The server encountered an error' , statusCode:500  ,  errorDescription: 'The Server encountered an error while processing your request'} )
    renderErrorPage(res , 500)

})

router.get('/401' , (req , res ) =>{
    //res.render('errorPage' , {errorName:'UnAutherized' , error: 'Access to this page was restricted' , statusCode:401 , errorDescription:'Sorry, you are not autherized tp view this page'})
    renderErrorPage(res , 401)
})

router.get('/404' ,  (req , res ) =>{
    //res.render('errorPage' , {errorName:'Not Found', error: 'The requested page can\'t be found' , statusCode:404 , errorDescription:'We could not find what you are looking for, it might have been deleted or modifyed'})
    renderErrorPage(res , 404)
})
module.exports = router