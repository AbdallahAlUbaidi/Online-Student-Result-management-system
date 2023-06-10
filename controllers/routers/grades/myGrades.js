const express = require("express");
const router = express.Router();
const {validateAccess} = require("../../accessControl");
const {errorReport , renderErrorPage} = require('../../errorReport')


//Only Student
router.get("/" , validateAccess(["student"] , false , "page") ,(req , res) => {
    try{
        const student_id = req.info.roleInfo._id;
        const {username , profileImg} = req.info.userInfo;
        res.render("student/myGrades") , {message:req.flash("message")[0] , messageType:req.flash("messageType")[0] , student_id , username , profileImg}
    }catch(err){
        const {statusCode , errors , message} = errorReport(err);
        if(statusCode === 500)
            renderErrorPage(res , statusCode);
    }
});

module.exports = router