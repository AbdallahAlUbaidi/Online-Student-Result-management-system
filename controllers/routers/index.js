const express = require("express")
router = express.Router()
const mainPage = {
    faculty:"/courses",
    branchHead:"/facultyMembers",
    examCommittee:"/courses", //Temp
    student:"/myGrades" //Temp  
}

//Landing Page
router.get("/", (req , res)=>
{
    const cookie = req.cookies.Refreash_Token
    if(cookie == undefined || cookie == null)
        res.redirect('/login')
    else{
        const role = req.info.roles[0];
        const mainPageLink = mainPage[role];

        res.redirect(mainPageLink);
    }
})

module.exports = router