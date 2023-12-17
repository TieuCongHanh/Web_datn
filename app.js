var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
require('dotenv').config();

var check_login = require('./middlewares/check_login');
var usersRouter = require('./routes/user');
var homeRouter=require('./routes/home');
var sanphamRouter=require('./routes/sanpham');
var orderRouter=require('./routes/orders');
var staffRouter=require('./routes/staff');
var categoryRouter=require('./routes/category');
var doanhthuRouter=require('./routes/doanhthu');
var ratingRouter = require('./routes/danhgia');
var addressRouter=require('./routes/address');
var apiRouter = require('./routes/api');

var addressRouter=require('./routes/address');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'KNDHA93sf2nfskfHNDHflsnr53jsg3hgsmdnsdg',
  resave: true,
  saveUninitialized: true
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/user', usersRouter);
app.use('/home', homeRouter);
app.use('/sanpham', sanphamRouter);
app.use('/order',check_login.yeu_cau_dang_nhap, orderRouter);
app.use('/staff',check_login.yeu_cau_dang_nhap, staffRouter);
app.use('/category',check_login.yeu_cau_dang_nhap, categoryRouter);
app.use('/doanhth', doanhthuRouter);

app.use('/danhgia', ratingRouter);

app.use('/address', addressRouter);

app.use('/api', apiRouter);

app.use(express.static("images"));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (req.originalUrl.indexOf('/api') === 0) {
    res.status(err.status || 500).json({ msg: err.message });
  } else {
    res.status(err.status || 500).render('error', { error: err });
  }
});


module.exports = app;
