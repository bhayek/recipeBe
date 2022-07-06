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

//GET recipes/:id/edit -- retrieve 
exports.byIdEdit = function(req, res){
    let id = req.params.id;
    let data = {};
    let q1Recipe = `SELECT id, name recipeTitle, description, prepTime, totalTime, servings, isSharedId, dateCreated FROM recipes WHERE recipes.id = ${id} AND dateDeleted is null`;
    let q2IngredientList = `SELECT IL.categoryId catId, RIC.name catName, RIC.sortOrder catSortOrder, 
    ingN.name fieldValue, IL.id ingId, IL.sort ingSortOrder, IL.unitTypeId unitTypeId,
    IL.amount unitTypeAmount
    
    from ingList IL
    
    left join recipeIngCats RIC
    ON RIC.id=IL.categoryId
    
    left join ingNames ingN
    ON ingN.id=IL.nameId
    
    
    WHERE IL.recipeId = ${id}
    order by IL.categoryId, IL.sort`

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

        data = q1RecipeData[0] || [];
        if(!q1RecipeData[0]){
            res.json({
                status: 404,
                message: `Recipe ${id} not found`
            })
        } else {
            data.photos = []
            db.query(q2IngredientList, function(err, q2IngredientListData,fields){
                if (err) throw err;
                db.query(q3Photos, function(err, q3PhotosData,fields) {
                    if(err) throw err;
                    db.query(q4Instructions, function(err,q4InstructionsData,fields) {
                        if(err) throw err;
                        const ingForm2 = []
                        q2IngredientListData.forEach(ing => {
                            if(ingForm2.length < ing.catSortOrder +1) {
                               ingForm2.push({
                                       cat: ing.catName,
                                       catId: ing.catId,
                                       sort: ing.catSortOrder,
                                       ingredients: []
                                    }) 
                                }
                                ingForm2[ing.catSortOrder].ingredients.push({
                                    fieldValue: ing.fieldValue,
                                    ingId: ing.ingId,
                                    sortOrder: ing.ingSortOrder,
                                    unitTypeId: ing.unitTypeId,
                                    unitTypeAmount: ing.unitTypeAmount,
                                    description:''
                                })
                        })

                            data.ingForm2 = ingForm2
                            //data.ingredients = q2IngredientListData || [];
                            //data.photos = q3PhotosData || [];
                            //data.instructions = q4InstructionsData || [];
                            // console.log(data)
                            //data
                            res.json({
                                status: 200,
                                data,
                                message: `Recipe returned successfully.`
                        })
                    })
                })
            })
        }

    })

};


// //POST recipes/:id/edit -- update existing recipe 
// exports.byIdEdit = function(req, res){

//    db.query(sql,function(err,res,){

//    })



// };


//GET recipestest/:id -- retrieve ONE recipe
exports.byIdTest = function(req, res){
    res.json({ 
        data: {
            recipeTitle: 'recipe title',
            prepTime: '11',
            totalTime: '30',
            description: 'I am a description--',
            ingForm2:[
                {
                    cat: "chili", 
                    catId: null, 
                    sortOrder: 0, 
                    ingredients:[
                        {
                            fieldValue: "ground beef", 
                            ingId: null, 
                            sortOrder: 0,
                            unitTypeId: 9,  
                            // unitType: "pound", 
                            unitTypeAmount: .5, 
                            description: "cooked" 
                        },
                        {   
                            fieldValue: "bell pepper", 
                            ingId: null, 
                            sortOrder: 1,
                            unitTypeId: null,  
                            // unitType: "", 
                            unitTypeAmount: 1, 
                            description: "" 
                        }
                    ]
                },
                {
                    cat: "garnish", 
                    catId: null, 
                    sortOrder: 1, 
                    ingredients:[
                        {
                            fieldValue: "cilantro", 
                            ingId: null, 
                            sortOrder: 0,
                            unitTypeId: 4,  
                            unitType: "tsp", 
                            unitTypeAmount: 2, 
                            description: "" 
                        },
                        {
                            fieldValue: "cheese", 
                            ingId: null, 
                            sortOrder: 1, 
                            unitTypeId: 2, 
                            // unitType: "ounce", 
                            unitTypeAmount: 5, 
                            description: "grated" 
                        }, 
                        {
                            fieldValue: "cheese", 
                            ingId: null, 
                            sortOrder: 2, 
                            unitTypeId: 2, 
                            // unitType: "ounce",
                            unitTypeAmount: 5, 
                            description: "grated" 
                        }   
                    ]
                }
            ],
            steps:{}
        },
        errors: {}
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