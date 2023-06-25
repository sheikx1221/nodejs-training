const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const uri = "mongodb+srv://sheikxhassan1221:9qO8xo7fCFs5WYKd@cluster0.vgxesxg.mongodb.net/?retryWrites=true&w=majority&ssl=true";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected with MongoDB");
  })
  .catch((error) => {
    console.log("error mongoose connection = ", error);
  });

const userRouter = require('./routes/user');
const indexRouter = require('./routes/index');
const filesRouter = require('./routes/files');
const productRouter = require('./routes/products');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/files', filesRouter);
app.use('/products', productRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;