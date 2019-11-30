const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err.name, err.message, err.stack);
    console.log('UNCAUGHT EXCEPTION !!! Shutting down...');
    process.exit(1);
})

dotenv.config({
    path: './config.env'
});
const app = require('./app');

//console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    //console.log(con.connections);
    console.log('DB connection succes');
});

//Server Run
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('App running on port 3000');
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHENDLER REJECTION !!! Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});