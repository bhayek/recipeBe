const { signupValidation,loginValidation } = require('../routes/validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const mw = require('./mwAuth');
const time = require('../services/time')

console.log(mw.auth)


// POST users/register -- Create new user
exports.register = (signupValidation, (req, res, next) => {
    db.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
        req.body.email
      )});`,
      (err, result) => {
        if (result.length) {
          return res.status(409).send({
            msg: 'This user is already in use!'
          });
        } else {
          // username is available
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).send({
                msg: err
              });
            } else {
              // has hashed pw => add to database
              db.query(
                `INSERT INTO users (
                    dateCreated,
                    firstName, 
                    lastName,
                    genderId,
                    email, 
                    password) VALUES (
                        '${moment().utc().format('YYYY-MM-DD hh:mm:ss')}',
                        '${req.body.firstName}',
                        '${req.body.lastName}',
                        
                        '${req.body.gender}',
                        ${db.escape(
                  req.body.email
                )}, ${db.escape(hash)})`,
                (err, result) => {
                  if (err) {
                    throw err;
                    return res.status(400).send({
                      msg: err
                    });
                  }
                  return res.status(201).send({
                    status: 200,
                    msg: 'The user has been registerd with us!'
                  });
                }
              );
            }
          });
        }
      }
    );
  });


// POST users/login
exports.login = (loginValidation, (req, res, next) => {
    db.query(
      `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
      (err, result) => {
        // user does not exists
        if (err) {
          throw err;
          return res.status(400).send({
            msg: err
          });
        }
        if (!result.length) {
          return res.status(401).send({
            msg: 'Email or password is incorrect!'
          });
        }
        // check password
        bcrypt.compare(
          req.body.password,
          result[0]['password'],
          (bErr, bResult) => {
            // wrong password
            if (bErr) {
              throw bErr;
              return res.status(401).send({
                msg: 'Email or password is incorrect!'
              });
            }
            if (bResult) {
                const {id, firstName, lastName,isAdmin } = result[0]
              const token = jwt.sign(
                  {
                    user:{
                        id:id,
                        firstName:firstName,
                        lastName:lastName,
                        admin: isAdmin
                    }},
                    'the-super-strong-secrect',
                    { expiresIn: '1h' });
              db.query(
                `UPDATE users SET lastLogin = now(), jwt = '${token}', jwtLastUsed = now() WHERE id = '${result[0].id}'`
              );
              return res
              .status(200)
              .header('x-auth-token', token)
              .header('access-control-expose-headers', 'x-auth-token')
              .send({
                // msg: 'Logged in!',
                token
                // user: result[0]
              });
            }
            return res.status(401).send({
              msg: 'Username or password is incorrect!'
            });
          }
        );
      }
    );
  });



    //GET /users/all -- Get all users
    exports.all = ((req, res) => {
        let sql = `SELECT * from users`;
        db.query(sql, function(err, data, fields){
            if (err) throw err;
            // console.log(data[0])
            res.json({
                status: 200,
                data,
                message: `Users returned successfully...`
            })
        })
    });

exports.adminCreate = (req, res) => {
    let sql = 
      `INSERT INTO users(
        avatarId,
        dateCreated,
        dateDeleted,
        dateSuspended,
        dob,
        email,
        firstName,
        lastName,
        genderId,
        password,
        lastLogin,
        suspendReason) 
        VALUES(?)`;
        
        let avatarId = req.body.avatarId || null;
        let dateCreated = moment().utc().format('YYYY-MM-DD hh:mm:ss');
        let dateDeleted = req.body.dateDeleted || null;
        let dateSuspended = req.body.dateSuspended || null;
        let dob = req.body.dob;
        let email = req.body.email;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let genderId = req.body.genderId;
        let password = req.body.password
        let suspendReason = req.body.suspendReason || null;
        let lastLogin = req.body.lastLogin || null;
        let values = [
            avatarId,
            dateCreated,
            dateDeleted,
            dateSuspended,
            dob,
            email,
            firstName,
            lastName,
            genderId,
            password,
            suspendReason,
            lastLogin
        ];
    if(firstName) {
      db.query(sql, [values], function(err, data, fields) {
          if(err) throw err;
          res.json({
              status: 200,
              message: `New user added successfully.`
          })
      })
    } else {
        res.json({
            status: 403,
            message: "One or more required fields is missing."
        })
        console.log(req.body)
    }
}