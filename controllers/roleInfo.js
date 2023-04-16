const roles = {
    student : {model:require('../models/Student'), registerLink: '/register/student'},
    faculty: {model:require('../models/Faculty'), registerLink: '/register/faculty'},
    branchHead:{model:require('../models/Faculty') , registerLink: '/register/faculty'},
    examCommittee:{model:require('../models/Faculty') , registerLink: '/register/faculty'}
}
const user = require('../models/User')
const {errorReport, renderErrorPage} = require('./errorReport');
const {unless} = require('express-unless')
const flashMessage = require('./flashMessage')

async function getRoleInfo(userId , userInfo = undefined)
{
    try
    {
        if(!userInfo){userInfo = await user.findById(userId)};
        const role = roles[userInfo.role[0]];
        const roleInfo = await role.model.findOne({userInfo:userInfo._id}).populate("courses")
        return {roleInfo , userInfo , role}
    }
    catch(err)
    {
        return {error:errorReport(err)}}
}

async function hasEnteredRoleInfo(req , res , next)
{
    const userId = req.auth.userId
    const roleInfo = await getRoleInfo(userId)
    if(roleInfo.error)
        renderErrorPage(res , 500)
    else if(!roleInfo.roleInfo)
        flashMessage.showFlashMessage(302 , `You need to enter your ${roleInfo.userInfo.role} information` , req , res , roleInfo.role.registerLink)
    else
    {   
        req.info = roleInfo
        next()
    }
}


hasEnteredRoleInfo.unless = unless;

const rolesRegisterLinks = []
for(role in roles)
    rolesRegisterLinks.push(roles[role].registerLink)
module.exports = {getRoleInfo , hasEnteredRoleInfo , rolesRegisterLinks}