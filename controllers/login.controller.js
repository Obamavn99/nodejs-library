var bcrypt = require('bcrypt');
var wrong = 0;

var nodemailer = require('nodemailer');
var User = require("../models/user.model");

// send an Email
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '18521118@gm.uit.edu.vn',
    pass: 'Dbnbl08081999'
  }
});

var mailOptions = {
  from: '18521118@gm.uit.edu.vn',
  to: 'obamavn99@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

module.exports.index = function(req, res) {
  res.render("login/index");
};

module.exports.registerIndex = function(req, res) {
  res.render("login/register");
};

module.exports.addNewAccount = async function(req, res) {
  
  var password = req.body.password;
  
  try {
    const salt = await bcrypt.genSalt();
    req.body.password = await bcrypt.hash(password, salt);
  } catch {}
  await User.create(req.body);
  res.redirect('/login');
};

module.exports.postLogin = async function(req, res) {
  var email = req.body.email;
	var password = req.body.password;

  var user = await User.findOne({ email: email });

  if(!user) {
    wrong++;
    res.cookie('wrong', wrong);
    res.render('login', {
      errors: ['Không tìm thấy email này!']
    })
    return;
  }

  try{
    if (await bcrypt.compare(password, user.password) == false) {
      wrong++;
      res.cookie('wrong', wrong);
      if (wrong > 4) {
        res.render('login', {
          errors: ['Nhập sai quá 4 lần!']
        })
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        })
        
      } else {
        res.render('login', {
          errors: ['Mật khẩu sai!']
        })
      }
      return;
    }
  } catch {
    res.status(500).send();
  }

  res.cookie('userId', user._id,{
    signed: true
  })

  res.locals.user = user;
  
  res.redirect('/');
};

module.exports.logout = function(req, res) {
  res.clearCookie("userId");
  res.redirect("/");
};