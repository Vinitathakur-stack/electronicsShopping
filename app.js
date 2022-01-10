const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const auth = require("./middleware/auth");

var productsRouter = require('./routes/products');
var usersRouter = require('./routes/users');

// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('./uploads'));
// app.use(express.urlencoded());
// app.use(express.json());

app.use('/users', usersRouter);
app.use('/products', productsRouter);

module.exports = app;
