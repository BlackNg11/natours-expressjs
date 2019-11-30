const AppError = require('./../utils/appErr');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Dulicate field value: ${value}.Please use another value!`;

    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.error).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;

    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token.Please log in again!!!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired !!! Please log in again.', 401)

const sendErrorDev = (err, req, res) => {
    //A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    //B) RENDER WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!!!',
        msg: err.message
    });
}

const sendErrorProduction = (err, req, res) => {
    console.error("Error", err)
    //I) API
    if (req.originalUrl.startsWith('/api')) {
        //A) Operatinal, trusted error: send mess to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        //B) Programing or other unknown error: dont leak err detail
        // 1) Log error
        console.error("Error", err)

        // 2) Send generic message
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong!!!"
        })

        //II) RENDER WEBSITE
        //Operatinal, trusted error: send mess to client
        if (err.isOperational) {
            return res.status(err.statusCode).render('error', {
                title: 'Something went wrong!!!',
                msg: err.message
            });
        }

        // 1) Log error
        console.error("Error", err)

        // Programing or other unknown error: dont leak err detail
        // 2) Send generic message
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!!!',
            msg: 'Please try again later'
        });
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProduction(error, req, res);
    }
}