// include product model
const User = require('../model/user');
const Token = require('../model/token');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../emailVerify");
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtpout.secureserver.net',
  secure: false,
  requireTLS: true,
  port: 587,
  // auth: {
  //   user: 'thakursinghvinita@gmail.com',
  //   pass: 'Shaitan@30',
  // }
  auth: {
    user: 'vinita.thakur@mindruby.com',
    pass: 'Vinitathakur@1234',
  }
});

var mailOptions = {
  from: 'svineeta119@gmail.com',
  to: 'vinita.thakur@mindruby.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
}
// register endpoint

exports.user_register = function (request, response) {
    console.log(request.body,response.body);
    var messageEmail='';
    // validate request
    if(!request.body.email || !request.body.password) {
        return response.status(400).send({
            success: false,
            message: "Please enter email and password"
        });
    }
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
            // Create a verification token for this user
          var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
  
          // Save the verification token
          token.save(function (err) {
              //if (err) { return response.status(500).send({ msg: err.message }); }
  
              // Send the email
              // var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
              // var mailOptions = { from: 'no-reply@yourwebapplication.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
              // transporter.sendMail(mailOptions, function (err) {
              //     if (err) { return res.status(500).send({ msg: err.message }); }
              //     res.status(200).send('A verification email has been sent to ' + user.email + '.');
              // });
              transporter.sendMail(mailOptions, function(error, info){
                messageEmail='A verification email has been sent to ' + user.email + '.';
                // if (error) {
                //   console.log(error);
                // } else {
                //   console.log('Email sent: ' + info.response);
                // }
                //if (err) { return response.status(500).send({ msg: err.message }); }
                //response.status(200).send('A verification email has been sent to ' + user.email + '.');
              });
          });
     
          response.status(201).send({
            message: "User Created Successfully"+ messageEmail,
            result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
        
          response.status(500).send({
            message: "Error creating user"+error.message,
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
};
exports.user_login = function (request, response) {
    console.log(request.body,response.body);
    // validate request
    if(!request.body.email || !request.body.password) {
        return response.status(400).send({
            success: false,
            message: "Please enter email and password"
        });
    }
   // check if email exists
   User.findOne({ email: request.body.email })

   // if email exists
   .then((user) => {
     // compare the password entered and the hashed password found
     bcrypt
       .compare(request.body.password, user.password)

       // if the passwords match
       .then((passwordCheck) => {

         // check if password matches
         if(!passwordCheck) {
           return response.status(400).send({
             message: "Passwords does not match",
             error,
           });
         }

         //   create JWT token
         const token = jwt.sign(
           {
             userId: user._id,
             userEmail: user.email,
           },
           "RANDOM-TOKEN",
           { expiresIn: "24h" }
         );

         //   return success response
         response.status(200).send({
           message: "Login Successful",
           email: user.email,
           token,
         });
       })
       // catch error if password do not match
       .catch((error) => {

         response.status(400).send({
           message: "Passwords does not match",
           error,
         });
       });
   })
   // catch error if email does not exist
   .catch((e) => {
     response.status(404).send({
       message: "Email not found",
       e,
     });
   });
};


  
//   // free endpoint
//   app.get("/free-endpoint", (request, response) => {
//     response.json({ message: "You are free to access me anytime" });
//   });
  
//   // authentication endpoint
//   app.get("/auth-endpoint", auth, (request, response) => {
  
//     try { 
//       //enter code here
//       response.json({ message: "You are authorized to access me" });
//     } catch (error) {
//       // something here
//       response.send("Somthing Wrong!");
  
//     }
//   });
  
 