if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config();
}
const express = require("express");
const epxress_layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const helmet =  require('helmet');



const app = express()
app.use(bodyParser.urlencoded({limit:"10mb" , extended:false}))
app.use(cookieParser())
app.use(express.json())
app.use(helmet.hidePoweredBy())
app.use(session({
    cookie:{ maxAge: 60000 },
    secret: process.env.SESSION_SECRET,
    saveUninitialized:false,
    resave:false
}))
app.use(flash())
//Import controllers

const indexRouter = require('./controllers/routers/index')
const loginRouter = require('./controllers/routers/login/login')
const logoutRouter = require('./controllers//routers/login/logout')
const retrievePasswordRouter = require('./controllers/routers//retrievePassword/retrievePassword')
const registerRouter = require('./controllers/routers/register/register')
const studentRegisterRouter = require('./controllers/routers/register/studentRegister')
const facultyRegisterRouter = require('./controllers/routers/register/facultyRegister')
const emailConfirmationRouter = require('./controllers/routers/email/emailConfirmation')
const coursesRouter = require('./controllers/routers/courses/courses')
const gradesRouter = require('./controllers/routers/grades/grades')
const accessToken = require('./controllers/AuthenticationTokens/accessToken')
const {hasEnteredRoleInfo , rolesRegisterLinks} = require('./controllers/roleInfo')
const {errorReport} = require('./controllers/errorReport')

//testing routers
const testRouter = require('./controllers/routers/Test')

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


//Protected routes
app.use(accessToken.tokenHandler.unless({path:[/^\/login/ , '/register' , /^\/emailConfirmation/]}))
app.use(hasEnteredRoleInfo.unless({path:[/^\/login/ , '/register' , /^\/emailConfirmation/].concat(rolesRegisterLinks)}))



//Using routers
app.use('/' , indexRouter)
app.use('/register' , registerRouter)
app.use('/register/student' , studentRegisterRouter)
app.use('/register/faculty' , facultyRegisterRouter)
app.use('/login' , loginRouter)
app.use('/login/retrievePassword' , retrievePasswordRouter)
app.use('/logout' , logoutRouter)
app.use('/emailConfirmation' , emailConfirmationRouter)
app.use('/courses' , coursesRouter)
app.use('/grades' , gradesRouter)



//testing router
app.use('/test' , testRouter)

app.listen(process.env.PORT || 80)

