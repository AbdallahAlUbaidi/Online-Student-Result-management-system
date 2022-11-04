if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}
const express = require("express")
const epxress_layouts = require("express-ejs-layouts")
const mongoose = require("mongoose")

const app = express()
//Import Routers
const indexRouter = require('./routes/index')
//set up express view enigne, layout and the public folder
app.set('view engine' , 'ejs')
app.set('views' , __dirname + '/views')
app.set('layout' , './layouts/layout')
app.use(epxress_layouts)
app.use(express.static('public'))

//Connecting to database
mongoose.connect(process.env.DATABASE_URL ,
    ()=>{console.log("Connected Successfully")},
    (e)=>{console.log(e)}) 

//Using routers
app.use('/' , indexRouter)


app.listen(process.env.PORT || 80)

