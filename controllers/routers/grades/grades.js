const express = require('express')
const router = express.Router();

const {errorReport , renderErrorPage} = require('../../errorReport')
const {showFlashMessage} = require('../../flashMessage')

const Grade = require('../../../models/Grade')
const Course = require('../../../models/Course')
const Student = require('../../../models/Student')
const Faculty = require('../../../models/Faculty')

//All roles aside from student
router.get('/' , (req , res)=>{

})

//Only faculty and exam committee
router.post('/save' , (req , res)=>{

})

//Only faculty
router.post('/submit' , (req , res)=>{

})

//Only branch head
router.post('/approve' , (req , res)=>{

})

//Only branch head
router.post('/reject' , (req , res)=>{

})

//Only exam committee
router.post('/publish' , (req , res)=>{
    
})

module.exports = router;
