if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}
const express = require("express")
const epxress_layouts = require("express-ejs-layouts")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const url = require('url')




const app = express()
app.use(bodyParser.urlencoded({limit:"10mb" , extended:false}))
app.use(cookieParser())
app.use(express.json())

//Import controllers

const indexRouter = require('./controllers/routers/index')
const registerRouter = require('./controllers/routers/register/register')
const studentRegisterRouter = require('./controllers/routers/register/studentRegister')
const authenticationRouter = require('./controllers/routers/authentication')
const emailConfirmationRouter = require('./controllers/email/emailConfirmation').router
const errorReport = require('./controllers/errorReport')


//set up express view enigne, layout and the public folder
app.set('view engine' , 'ejs')
app.set('views' , __dirname + '/views')
app.set('layout' , './layouts/layout')

app.use(epxress_layouts)
app.use(express.static('public'))

//Connecting to database
mongoose.set('strictQuery', true)
mongoose.connect(process.env.DATABASE_URL ,
    ()=>{console.log("Connected Successfully")},
    (e)=>{errorReport(error)}) 

//Using routers
app.use('/' , indexRouter)
app.use('/register' , registerRouter)
app.use('/register/student' , studentRegisterRouter)
app.use('/emailConfirmation' , emailConfirmationRouter)
app.use('/authentication' , authenticationRouter)


app.listen(process.env.PORT || 80)

