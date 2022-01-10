// include product model
const User = require('../model/user');
const Token = require('../model/token');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: false,
  requireTLS: true,
  port: 587,
  auth: {
    user: 'thakursinghvinita@gmail.com',
    pass: 'Shaitan@30',
  }

});



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
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          console.log(result._id);
            // Create a verification token for this user
          const token = new Token({ userId: result._id, token: crypto.randomBytes(16).toString('hex') });
            // Save the verification token
          token.save()
          .then((tokensave)=>{

            var mailOptions = {
                    from: 'svineeta119@gmail.com',
                    to: 'vinita.thakur@mindruby.com',
                    subject: 'Account Verification Token',
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + request.headers.host + '\/confirmation\/' + token.token + '.\n' 
                  }
                  transporter.sendMail(mailOptions, function(error, info){
                  });
          response.status(201).send({
            message: "User Created Successfully & "+ 'A verification email has been sent to ' + user.email + '.',
            result,
          });
          })
          .catch((err)=>{ 
            response.status(500).send({
              message: "Error creating user"+err.message,
              err,
            });
          });
          
     
          
        })
        // catch error if the new user wasn't added successfully to the database
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
/**
* POST /confirmation
*/
exports.confirmationPost = function (req, res, next) {


  // Find a matching token
  Token.findOne({ token: req.body.token }, function (err, token) {
      if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

      // If we found a token, find a matching user
      User.findOne({ _id: token.userId, email: req.body.email }, function (err, user) {
          if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
          if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

          // Verify and save the user
          user.isVerified = true;
          user.save(function (err) {
              if (err) { return res.status(500).send({ msg: err.message }); }
              res.status(200).send("The account has been verified. Please log in.");
          });
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
         console.log(user);
          // Make sure the user has been verified
          if (!user.isVerified) return response.status(401).send({ type: 'not-verified', msg: 'Your account has not been verified.' }); 
 

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
  
 