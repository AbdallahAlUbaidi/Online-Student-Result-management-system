const express = require("express");
const router = express.Router();
const {validateAccess} = require("../../accessControl");
const {errorReport , renderErrorPage} = require('../../errorReport')


//Only Student
router.get("/" , validateAccess(["student"] , false , "page") ,(req , res) => {
    try{
        const student_id = req.info.roleInfo._id;
        res.render("student/myGrades") , {message:req.flash("message")[0] , messageType:req.flash("messageType")[0] , student_id}
    }catch(err){
        const {statusCode , errors , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , statusCode);
    }
});

module.exports = router