const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const monk = require('monk');
const { notFound, errorHandler } = require('./middleware');
const app = express()

require('dotenv').config();
// Import db and other file


app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

const employee = require('./routes/employee');
const user = require('./routes/user');

// Specify the render engine by adding the following code in index.js file
app.set("view engine", "ejs")
// static file path
app.use(express.static(path.join(__dirname, "assets")))


// Home page
app.get('/', (req, res, next) => {
    res.render('index')
})

app.use('/api/employee', employee);
app.use('/api/auth', user);

// middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;