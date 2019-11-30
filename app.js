const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appErr');
const globalErrorHanler = require('./controller/errController');
const tourRouter = require('./route/tourRoutes');
const userRouter = require('./route/userRoutes');
const reviewRouter = require('./route/reviewRoute');
const bookingRouter = require('./route/bookingRoute');
const viewRouter = require('./route/viewRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'view'));

// 1) GLOBAL MIDDLEWARES
//Dat folder la noi truy cap tinh
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP header
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'develoment') {
    app.use(morgan('dev'))
}

// Limit request from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP,please try again in an hour!'
})

app.use('/api', limiter);

// Body parse, reading data from body into req.body
app.use(express.json({
    limit: '10kb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))
app.use(cookieParser())

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
    ]
}));

/*app.use((req, res, next) => {
    console.log('Hello,from the midd');

    next();
});*/

//Test Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies);

    next();
});

/*
app.get('/api/v1/tours', getAllTours);
app.get('/api/v1/tours/:id', getTour);
app.post('/api/v1/tours', createTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);
*/

//3.ROUTE
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    /* res.status(404).json({
         status: 'fail',
         message: `Can't find ${req.originalUrl} on this server`
     })*/

    /*const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.status = 'fail';
    err.statusCode = 404;*/

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
})

app.use(globalErrorHanler);

//4.START SEVER
module.exports = app;