const {  } = require('../routes/validation');
const { validationResult } = require('express-validator');
const moment = require('moment');
const jwt = require('jsonwebtoken');



// GET recipes/all -- get ALL recipes (including deleted)
exports.all = function(req, res){
    let sql = `select * from recipes`;
    db.query(sql, function(err, data, fields){
        if (err) throw err;
        // console.log(data[0])
        res.json({
            status: 200,
            data,
            message: `Recipes returned successfully.`
        })
    })
};

// get active recipes with ingredients
exports.active = (req, res) => {
    let recSql = `
    SELECT id, name, description, prepTime, totalTime, servings, isSharedId dateCreated 
    FROM recipes 
    WHERE dateDeleted is null`;
    db.query(recSql, function(err, data, fields){
        if (err) throw err;
        res.json({
            status: 200,
            data,
            message: `Recipes returned successfully.`
        })
    })
};


// GET recipes/:id -- retrieve ONE recipe
exports.byId = function(req, res){
    let id = req.params.id;
    let resContract = {};
    let q1Recipe = `SELECT id, name, description, prepTime, totalTime, servings, isSharedId, dateCreated FROM recipes WHERE recipes.id = ${id} AND dateDeleted is null`;
    let q2IngredientList = `select il.id, il.sort ingSortOrder,  r.name recipeName, ric.id catId, ric.name category, ric.sortOrder catSortOrder, ingN.name name, il.amount, ut.name unit, ut.nameShort unitShort FROM ingList il

    left join recipes r
    ON r.id=il.recipeId
    
    left join unitTypes ut
    ON ut.id=il.unitTypeId
    
    left join recipeIngCats ric
    ON ric.id=il.categoryId
    
    left join ingNames ingN
    ON ingN.id=il.nameId
    
    where recipeId = ${id}
    
    order by catSortOrder, ingSortOrder asc`

    q3Photos = `select * from photos p

    where p.recipeId = ${id}`
    q4Instructions = `Select r.name recipeName, ri.sortOrder instructSortOrder, ri.userId createdBy, ri.step step, ri.recipeIngCatId CatId, rc.name recipeIngredientCat, rc.sortOrder catSortOrder, ri.stepDurationSec time from recipeInstructions ri

    left join recipes r
    ON r.id=ri.recipeId
    
    left join recipeIngCats rc
    ON rc.id=ri.recipeIngCatId
    
    where recipeId = ${id}
    
    order by catSortOrder, instructSortOrder asc`
    db.query(q1Recipe, function(err, q1RecipeData, fields){
        if (err) throw err;

        resContract = q1RecipeData[0] || [];
        if(!q1RecipeData[0]){
            res.json({
                status: 404,
                message: `Recipe ${id} not found`
            })
        } else {
            resContract.photos = []
            db.query(q2IngredientList, function(err, q2IngredientListData,fields){
                if (err) throw err;
                db.query(q3Photos, function(err, q3PhotosData,fields) {
                    if(err) throw err;
                    db.query(q4Instructions, function(err,q4InstructionsData,fields) {
                        if(err) throw err;
                            resContract.ingredients = q2IngredientListData || [];
                            resContract.photos = q3PhotosData || [];
                            resContract.instructions = q4InstructionsData || [];
                            // console.log(resContract)
                            //resContract
                            res.json({
                                status: 200,
                                resContract,
                                message: `Recipe returned successfully.`
                        })
                    })
                })
            })
        }

    })

};

// POST -- create NEW recipe
exports.create = (req, res) => {
    let sql = 
      `INSERT INTO recipes(
          name,
          description,
          photoId,
          originationId,
          servings,
          prepTime,
          totalTime,
          isSharedId,
          dateSuspended,
          suspendedById,
          suspendedReason,
          dateCreated,
          dateDeleted) 
        VALUES(?)`;
        let name = req.body.name;
        let description = req.body.description || null;
        let photoId = req.body.photoId || null;
        let originationId = req.body.originationId || null;
        let servings = req.body.servings;
        let prepTime = req.body.prepTime || null;
        let totalTime = req.body.totalTime || null;
        let isSharedId = req.body.isSharedId;
        let dateSuspended = req.body.dateSuspended || null;
        let suspendedById = req.body.suspendedById || null;
        let suspendedReason = req.body.suspendedReason || null;
        let dateCreated = moment().utc().format('YYYY-MM-DD hh:mm:ss');
        let dateDeleted = req.body.dateDeleted || null;
        let values = [
            name,
            description,
            photoId,
            originationId,
            servings,
            prepTime,
            totalTime,
            isSharedId,
            dateSuspended,
            suspendedById,
            suspendedReason,
            dateCreated,
            dateDeleted
        ];
    if(name) {
      db.query(sql, [values], function(err, data, fields) {
          if(err) throw err;
          res.json({
              status: 200,
              message: `New recipe added successfully`
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



// POST -- create NEW recipe instruction
exports.createInstruction = (req, res) => {
    let sql = 
      `INSERT INTO recipeInstructions(
          recipeId,
          sortOrder,
          userId,
          dateModified,
          dateCreated,
          instruction,
          recipeIngCatId) 
        VALUES(?)`;

        let recipeId = req.body.recipeId;
        let sortOrder = req.body.sortOrder || null;
        let userId = req.body.userId || null;
        let dateModified = moment().utc().format('YYYY-MM-DD hh:mm:ss');
        let dateCreated = moment().utc().format('YYYY-MM-DD hh:mm:ss');
        let instruction = req.body.instruction || null;
        let recipeIngCatId = req.body.recipeIngCatId || null;
        let values = [
            recipeId,
            sortOrder,
            userId,
            dateModified,
            dateCreated,
            instruction,
            recipeIngCatId
        ];

    if(recipeId) {
      db.query(sql, [values], function(err, data, fields) {
          if(err) throw err;
          res.json({
              status: 200,
              message: `New recipe instruction added successfully`
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