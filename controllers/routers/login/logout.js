const express = require('express')
const router = express.Router()
const secure = Boolean(parseInt(process.env.HTTPS))

router.get('/' , (req , res)=>{
    res.cookie('Authorization' , `` , { 
        httpOnly: true, 
        sameSite: secure? 'None': "Lax",
        secure: Boolean(parseInt(process.env.HTTPS)), 
        maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_PERIOD) * 60 * 60 * 1000 
    })
    res.cookie('Refreash_Token' , `` , { 
        httpOnly: true, 
        sameSite: secure? 'None': "Lax", secure: Boolean(parseInt(process.env.HTTPS)), 
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_PERIOD) * 24 * 60 * 60 * 1000 })
    res.redirect('/')
})

module.exports = router