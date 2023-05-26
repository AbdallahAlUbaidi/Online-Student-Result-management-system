const { renderErrorPage } = require("./errorReport");
const Course = require('../models/Course');

function validateAccess(authorizedRoles , requireCourseOwnerShip , responseHandler = "page"){
    responseHandler = responseHandler.toLowerCase();
    return async (req , res , next) => {
        const userRoles = req.info.roles;
        const hasAuthorizedRole = authorizedRoles.some(role => userRoles.includes(role));
        if(!hasAuthorizedRole) return denyAccess(responseHandler , res);
        let courseTitle;
        if(req.params.courseTitle)
            courseTitle = req.params.courseTitle.replace(/-/gi , " ").trim();
        const course = await Course.findOne({courseTitle});
        if(!course && courseTitle) return notFound(responseHandler , res);
        req.course = course;
        if(requireCourseOwnerShip){
            if(req.params.courseTitle){
                if(!course) return notFound(responseHandler , res);
                let courses = req.info.roleInfo.courses.map(course => course.courseTitle);
                if(!courses.includes(course.courseTitle)) return denyAccess(responseHandler , res);
            }
        }
        next();
    };
}

function denyAccess(responseHandler , res){
    if(responseHandler === "page") return renderErrorPage(res , 403);
    if(responseHandler === "json") return res.status(403).json({message:"Access Denied!"});
    else throw("Invalid response handler");
}

function notFound(responseHandler , res){
    if(responseHandler === "page") return renderErrorPage(res , 404);
    if(responseHandler === "json") return res.status(404).json({message:"Course Not found"});
}

module.exports = {validateAccess}