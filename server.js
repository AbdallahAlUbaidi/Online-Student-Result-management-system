if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}
const express = require("express")
const epxress_layouts = require("express-ejs-layouts")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const url = require('url')


const app = express()
app.use(bodyParser.urlencoded({limit:"10mb" , extended:false}))
app.use(express.json())

//Import Routers

const indexRouter = require('./routers/index')
const registerRouter = require('./routers/register/register')
const emailConfirmationRouter = require('./routers/emailConfirmation/emailConfirmation').router
const errorReport = require('./routers/errorReport')


//set up express view enigne, layout and the public folder
app.set('view engine' , 'ejs')
app.set('views' , __dirname + '/views')
app.set('layout' , './layouts/layout')

app.use(epxress_layouts)
app.use(express.static('public'))

//Connecting to database
mongoose.connect(process.env.DATABASE_URL ,
    ()=>{console.log("Connected Successfully")},
    (e)=>{errorReport(error)}) 

//Using routers
app.use('/' , indexRouter)
app.use('/register' , registerRouter)
app.use('/emailConfirmation' , emailConfirmationRouter)


app.listen(process.env.PORT || 80)

