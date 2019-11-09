var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/register', function(req, res, next) {
  res.render('register',{title: 'Register'});
});


router.get('/login', function(req, res, next) {
  res.render('login',{title: 'Login'});
});

router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));



router.post('/register',upload.single('profileimage') , function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if(req.file){
  	console.log('uploading...');
  } else {
  	console.log('no file uploaded');
  	var profileimage = 'noimage.jpg';
  }

  //form validator
  var letterNumber = /([0-9].*[a-z])|([a-z].*[0-9])/;
  req.checkBody('name','name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','email is not valid').isEmail();
  req.checkBody('username','username is required').notEmpty();
  req.checkBody('username','Username length should be minimum 3').isLength({min:3});
  req.checkBody('password','password is required').notEmpty();
  req.checkBody('password','password length should be minimum 5').isLength({min:5});
  req.checkBody('password','Password must contain atleast 1 letter and atleast 1 number').matches(letterNumber);
  req.checkBody('password2','password do not match').equals(req.body.password);


  //check errors

  var errors = req.validationErrors();

  if(errors){
  	res.render('register',{
  		errors: errors
  	});
  } else{
  	var newUser = new User({
  		name: name,
  		email: email,
  		username: username,
  		password: password,
  		profileimage: profileimage
  	});
User.createUser(newUser,function(err, user){
   if(err) throw err;
   console.log(user);
});

req.flash('success', 'You are now registered and can log in');


res.location('/');
res.redirect('/');

}
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You are now logged out')
	res.redirect('/users/login');
});




module.exports = router;
