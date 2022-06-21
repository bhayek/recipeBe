const { signupValidation,loginValidation } = require('../routes/validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const mw = require('./mwAuth');

    //GET /users/genders -- Get genders
    exports.genders = ((req, res) => {
        let sql = `SELECT * from gender`;
        db.query(sql, function(err, data, fields){
            if (err) throw err;
            // console.log(data[0])
            res.json({
                status: 200,
                data,
                message: `Genders returned successfully.`
            })
        })
    });