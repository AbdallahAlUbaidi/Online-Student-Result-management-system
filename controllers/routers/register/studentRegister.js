const express = require('express')
const User = require('../../../models/User')
const Student = require('../../../models/Student')
const router = require('../authentication')

router.get('/' , (req , res)=>
{
    res.render('register/registerStudent' , {token:req.params.token})
})


// router.post('/' , async (req , res)=>
// {
    
//     try
//     {
//         // const student = await student.createNewStudent( , req.body.student_id , req.body.stage , req.body.branch , req.body.study)
//         res.status(201).json({});
//     }
//     catch(error)
//     {
//         const errorInfo = errorReport(error)
//         res.status(errorInfo.statusCode).json(errorInfo.errors)
//     }
// })

module.exports = router