const express = require('express')
const user = require('../../models/User')
const roleInfoModule = require('../roleInfo')
const router = express.Router()

router.get('/'  ,  async (req , res)=>
{
    
    const userId = req.auth.userId
    const userInfo = await user.findById(userId)
    const roleInfo = (await roleInfoModule.getRoleInfo(userId , userInfo)).roleInfo
    
    res.render('testPage' , {userInfo , roleInfo})
})


module.exports = router