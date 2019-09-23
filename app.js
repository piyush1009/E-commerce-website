var createError = require('http-errors');  //for creating self-made errors
var express = require('express'); 
var path = require('path');  //To work with different directory and file
var favicon = require('serve-favicon');   //for giving website, icons.
var cookieParser = require('cookie-parser');   //for storing cookies on client side.
var logger = require('morgan');   //to log http requests
var bodyParser = require('body-parser');  //Parse incoming request bodies and expose to req.body
var session = require('express-session');   //to communicate or store data to middlewares
var passport = require('passport');   //for authentication
var LocalStrategy = require('passport-local').Strategy; //for authentication with username and password
var expressValidator = require('express-validator');   //for server side data validation
var multer = require('multer');    //multer for file uploads
var upload = multer({dest:'./uploads'}); //Handle file uploads
var mongo = require('mongodb');     
var flash = require('connect-flash');   //ability to add messages, eg: when you are logged in
var bcrypt = require('bcryptjs');    //for password protection
var mongoose = require('mongoose');  //way to interact with the database with application
var db = mongoose.connection;

var index = require('./routes/index');  //setting up the index file in routes folder
var users = require('./routes/users');  //setting up the users file in routes folder

//Initialising the app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Middlewares
app.use(logger('dev'));   //For development env.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Handle session
app.use(session({
  secret:'secret',
  saveUninitialized:true,
  resave:true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());   //authenticate the session.

//Validators
app.use(expressValidator({                            //????????????????????
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
})); 

//For connecting flash messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*',function(req,res,next){                 //??????????????????
  res.locals.user = req.user || null;
  next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,() => console.log('server started..'));
module.exports = app;
