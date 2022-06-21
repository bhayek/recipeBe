const {  } = require('../routes/validation');
const { validationResult } = require('express-validator');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const pluralize = require('pluralize')

// GET ingredients/all -- get ALL ingredients
exports.all = (req, res) => {
    let sql = `select * from ingNames`;
    db.query(sql, function(err, data, fields){
        if (err) throw err;
        // console.log(data[0])
        res.json({
            status: 200,
            data,
            message: `Ingredients returned successfully.`
        })
    })
};

// POST -- create NEW ingredient
exports.create = (req, res) =>{
    let sql = 
      `INSERT INTO ingNames(
          name,
          namePlural,
          userId,
          dateModified,
          dateCreated,
          descriptionId,
          photoId) 
        VALUES(?)`;
        let name = req.body.namePlural === null ? req.body.name : pluralize(req.body.namePlural,1);
        let namePlural = req.body.name === null ? req.body.namePlural : pluralize(req.body.name,2);
        let userId = req.body.userId || null;
        let dateModified = moment().utc().format('YYYY-MM-DD hh:mm:ss');
        let dateCreated = moment().utc().format('YYYY-MM-DD hh:mm:ss');
        let descriptionId = req.body.descriptionId || null;
        let photoId = req.body.photoId || null;
        let values = [
            name,
            namePlural,
            userId,
            dateModified,
            dateCreated,
            descriptionId,
            photoId,
        ];

    if(name) {
      db.query(sql, [values], function(err, data, fields) {
          if(err) throw err;
          res.json({
              status: 200,
              message: `New ingredient added successfully`
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
