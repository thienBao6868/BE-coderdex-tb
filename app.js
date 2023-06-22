require("dotenv").config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const { error } = require("console");
const cors= require("cors") // 

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // allows use file public export file images. 
app.use(cors()) // allows connect FE

app.use('/', indexRouter);

app.use((req,res,next)=>{
    const error = new Error("Not found page")
    error.statusCode = 404;
    next(error)
})

app.use((err,req,res,next)=>{
    res.status(err.statusCode).send(err.message)
})

module.exports = app;
