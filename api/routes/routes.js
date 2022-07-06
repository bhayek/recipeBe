const { urlencoded } = require('body-parser');

const express = require('express'),
    router = express.Router(),
    user = require('../controllers/user')
    recipes = require('../controllers/recipes')
    recipeSave = require('../controllers/recipeSave')
    ingredients = require('../controllers/ingredients')
    lookup = require('../controllers/lookup')
const url = require('url')
const app = express();
// const moment = require('moment');
const moment = require('moment-timezone');

const { signupValidation,loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mw = require('../controllers/mwAuth')


//const serveStatic = require('serve-static');
// app.use(express.static('images'));


//app.use('images', express.static('images'));
// const server = {
//   port: 4041,
//   imagePath: `http://localhost:4041`,
// };

// app.listen(4041, () => 
// console.log(`Server started, listening for static files on port: ${server.port}`));

// router.post('/loginNew', console.log('loginNew'))

console.log('LAST REBOOT: ', moment().tz("America/Los_Angeles").format('YYYY-MM-DD hh:mm:ss'))

//USER => POST ROUTES
router.post('/users/register', user.register)
router.post('/users/admin/create', mw.auth, user.adminCreate)
router.post('/users/login', user.login)

//USER => GET ROUTES
router.get('/users/all', mw.auth, user.all)

//RECIPE => POST ROUTES
router.post('/recipes/create', mw.auth, recipes.create)
router.post('/recipes/createInstruction', mw.auth, recipes.createInstruction)

//RECIPESAVE => POST ROUTES
router.post('/recipes/:id/update', mw.auth, recipeSave.update)

//RECIPE => GET ROUTES
router.get('/recipes/all', mw.auth, recipes.all)
router.get('/recipes/active', [mw.auth], recipes.active)
router.get('/recipes/:id', mw.auth, recipes.byId)
router.get('/recipestest/:id', mw.auth, recipes.byIdTest) // returns static json
router.get('/recipes/:id/edit', mw.auth, recipes.byIdEdit)


//INGREDIENTS => POST ROUTES
router.post('/ingredients/create', mw.auth, ingredients.create)
//INGREDIENTS => GET ROUTES
router.get('/ingredients/all', mw.auth, ingredients.all)



//LOOKUP => GET ROUTES
router.get('/lookup/genders', mw.auth, lookup.genders)
router.get('/lookup/units', mw.auth, lookup.units)








//   // get plant list with optional query param
//   router.get('/list/wildcard', function(req, res) {
//       let commonName = req.query.commonName
//       let species = req.query.species
//       console.log(`query prams - commonName: ${commonName}, species: ${species}`)
//       let sql = `SELECT * FROM plant where commonName like '%${commonName}%' OR species like '%${species}%'`
//       db.query(sql, function(err, data, fields){
//           if (err) throw err;
//           res.json({
//               status: 200,
//               data,
//               message: `plants returned successfully: ${commonName}`
//           })
//       })
//   })

// // get plant by common name
// router.get('/list/commonName/:commonName', function(req, res) {
//     let commonName = req.params.commonName;
//     let sql = `SELECT * FROM plant where commonName ='${commonName}'`;
//     db.query(sql, function(err, data, fields) {
//       if (err) throw err;
//       res.json({
//         status: 200,
//         data,
//         message: "plant list retrieved successfully"
//       })
//     })
//   });

// // get plant list
// router.get('/list', function(req, res) {
//     let sql = `select * from plant P
//     left join edible E on E.plantId = p.id
//     left join edibleCat EC on E.edibleCatId = EC.id
//     left join photo PH on PH.plantId = P.id
  
//     where PH.isPrimary = 1
//     order by P.commonName asc
//     `;
//     db.query(sql, function(err, data, fields) {
//       if (err) throw err;
//       data.forEach(item => item.photoUrl = `${server.imagePath}/${item.photoUrl}`)
//       console.log(data)
//       res.json({
//        // status: 200,
//         plants: data,
//        //message: "plant list retrieved successfully"
//       })
//     })
//   });

//   // create new plant
//   router.post('/new', function(req, res){
//       let sql = 
//         `INSERT INTO plant(
//           commonName, species, isTree, genus, familyId, 
//           plantDescription, isEdible) 
//           VALUES(?)`;
//       let commonName = req.body.commonName;
//       let species = req.body.species;
//       let isTree = req.body.isTree;
//       let genus = req.body.genus;
//       let familyId = req.body.familyId;
//       let plantDescription = req.body.plantDescription;
//       let isEdible = req.body.isEdible;
//       let values = [
//           commonName,
//           species,
//           isTree,
//           genus,
//           familyId,
//           plantDescription,
//           isEdible
//       ];
//       if(commonName && species) {
//         db.query(sql, [values], function(err, data, fields) {
//             if(err) throw err;
//             res.json({
//                 status: 200,
//                 message: "New plant added successfully"
//             })
//         })
//       } else {
//           res.json({
//               status: 403,
//               message: "One or more required fields is missing."
//           })
//       }
//   })

// upload file



module.exports = router;

