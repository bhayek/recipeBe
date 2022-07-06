const express = require('express');
    app = express();
mysql = require('mysql');
cors = require('cors');
bodyParser = require('body-parser');
querystring = require('querystring');
url = require('url');
const reload = require('reload')

const config = require('../config/env')
const { host, user, password, database } = config.env.mysql
const { port } = config.env

// use the modules
app.use(cors())
app.use(bodyParser.json());

// setup db
db = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
})

db.connect(err => {
    if(err){
        console.log(err);
    }
    console.log('MySql Connected')
});

// use the modules
app.use(cors())
app.use(bodyParser.json());
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

// routers
const router = require('../routes/routes');
// use router
app.use('/api', router);

// Handling Errors
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack
        //err
    })
})

// starting the server
app.listen(`${port}`, () => console.log(`Server started, listening for APIs on port: ${port}`));
