const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
const mongoose = require("mongoose")
require('dotenv').config();
const session = require('express-session')
const connectflash = require('connect-flash');
const passport = require('passport');
const connectMongo = require('connect-mongo');
const connectensurelogin = require('connect-ensure-login');
const { roles } = require('./utils/constant');

// Initialization

const app = express();
app.use(morgan("dev"))
app.use(express.json())
app.set('view engine',"ejs")
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))

const  mongoStore = connectMongo(session)
// init session
app.use((session({
     secret:process.env.SESSION,
     resave:false,
     saveUninitialized:false,
     cookie:{
          httpOnly:true
     },
     store: new mongoStore({mongooseConnection:mongoose.connection})
})));

// For Passport JS Authentication

app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
     res.locals.user = req.user;
     next();
   });

// Connect Flash

app.use(connectflash())
app.use((req,res,next)=>{
     res.locals.messages = req.flash()
     next()
})

// Routes

app.use('/',require ('./routes/index'))
app.use('/auth',require ('./routes/auth.route'))
app.use('/user', connectensurelogin.ensureLoggedIn({redirectTo:"/auth/login"}) ,require ('./routes/user'))
app.use('/admin',connectensurelogin.ensureLoggedIn({redirectTo:"/auth/login"}),ensureAdmin,require('./routes/admin.rout'));

// 404 Handler

app.use((req,res,next)=>{
     next(createError.NotFound())
})

// Error Handler

app.use((error,req,res,next)=>{
     error.status = error.status || 500;
     res.status(error.status)
     res.render('error_40x', { error });
})
// Setting the PORT

const port = process.env.Port || 2344;

// Making a connection to MongoDB

mongoose.connect(process.env.MONGO_URL,{
     dbName:process.env.DB_NAME

}).then(()=>{
     console.log('connected to mongodb!');
     app.listen(port, () => console.log(`server run on port ${port}`))
}).catch(err =>console.log(err))

function ensureAdmin(req, res, next) {
  if (req.user.role === roles.admin) {
    next();
  } else {
     req.flash('warning','yur not authorized to see this route!')
    res.redirect('/');
  }
}
