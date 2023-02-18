const express = require("express")
router = express.Router()


//Landing Page
router.get("/", (req , res)=>
{
    const cookie = req.cookies.Refreash_Token
    if(cookie == undefined || cookie == null)
        res.redirect('/login')
    else
        res.redirect('/courses')
})

module.exports = router